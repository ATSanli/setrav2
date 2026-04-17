import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addressSchema = z.object({
  title: z.string().min(1),
  fullName: z.string().min(3),
  phone: z.string().min(10),
  address: z.string().min(10),
  city: z.string().min(2),
  district: z.string().min(2),
  postalCode: z.string().min(5),
  isDefault: z.boolean().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Addresses GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = addressSchema.parse(body)

    // Check if this is the first address - make it default
    const existingAddresses = await prisma.address.count({
      where: { userId: session.user.id }
    })

    const isDefault = existingAddresses === 0 || validatedData.isDefault

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        isDefault
      }
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Address POST error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}
