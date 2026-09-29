import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { translations } from '@/translations'
import { Prisma } from '@prisma/client'

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  phone: z.string().optional(),
  password: z.string().min(6)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: validatedData.email, mode: 'insensitive' } },
      select: { id: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: translations.tr.email_already_registered },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    })

    return NextResponse.json({
      success: true,
      user
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: translations.tr.invalid_data },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: translations.tr.email_already_registered }, { status: 409 })
    }
    console.error('Registration failed:', error)
    return NextResponse.json(
      { error: translations.tr.registration_failed },
      { status: 500 }
    )
  }
}
