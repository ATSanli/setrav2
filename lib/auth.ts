import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gereklidir')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, password: true, firstName: true, lastName: true, role: true, permissions: true, roleId: true }
        })

        if (!user) {
          throw new Error('Kullanıcı bulunamadı')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Geçersiz şifre')
        }

        // Try to populate permissions from Role table if present
        let resolvedPermissions: string[] = []
        try {
          const roleEntry = await prisma.role.findUnique({ where: { name: user.role }, include: { permissions: true } })
          if (roleEntry && Array.isArray(roleEntry.permissions)) {
            resolvedPermissions = roleEntry.permissions.map(p => p.permission)
          } else {
            resolvedPermissions = (() => {
              try { return user.permissions ? JSON.parse(user.permissions) : [] } catch { return [] }
            })()
          }
        } catch (e) {
          resolvedPermissions = (() => {
            try { return user.permissions ? JSON.parse(user.permissions) : [] } catch { return [] }
          })()
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: resolvedPermissions,
          roleId: user.roleId || null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.permissions = (user as any).permissions || []
        token.roleId = (user as any).roleId || null
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN'
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.permissions = token.permissions as string[] || []
        ;(session.user as any).roleId = token.roleId as string | null
      }
      return session
    }
  },
  pages: {
    signIn: '/giris',
    error: '/giris'
  },
  secret: process.env.NEXTAUTH_SECRET
}

// Helper to check if user is admin
export function isAdmin(role?: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

// Check super admin specifically
export function isSuperAdmin(role?: string): boolean {
  return role === 'SUPER_ADMIN'
}

// Type augmentation for next-auth
declare module 'next-auth' {
  interface User {
    id: string
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
    firstName: string
    lastName: string
  }

  interface Session {
    user: {
      id: string
      email: string
      role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
      firstName: string
      lastName: string
      permissions?: string[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
    firstName: string
    lastName: string
    permissions?: string[]
  }
}
