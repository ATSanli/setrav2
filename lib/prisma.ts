import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as any

function createPrismaClient() {
  // If DATABASE_URL isn't set locally, return a proxy that throws a clear error
  if (!process.env.DATABASE_URL) {
    const handler = {
      get(_target: any, _prop: PropertyKey) {
        throw new Error('Prisma not configured: DATABASE_URL is not set. Add it to .env.local or set the environment variable.')
      }
    }
    return new Proxy({}, handler) as PrismaClient
  }

  const client = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
  return client
}

export const prisma = createPrismaClient()
