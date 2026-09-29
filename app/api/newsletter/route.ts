import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { translations } from '@/translations'
import { Prisma } from '@prisma/client'

const schema = z.object({
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  lang: z.string().optional()
})

export async function POST(request: NextRequest) {
  // Quick sanity check for database configuration to provide clearer errors
  if (!process.env.DATABASE_URL) {
    console.error('NEWSLETTER ERROR: DATABASE_URL is not set')
    return NextResponse.json(
      { success: false, error: 'Bülten şu anda kullanılamıyor' },
      { status: 500 }
    )
  }
  try {
    const body = await request.json()
    const { email, lang } = schema.parse(body)
    const language = lang === 'en' ? 'en' : 'tr'

    const t = translations[language]?.newsletter?.messages || {
      exists: 'Already subscribed',
      success: 'Subscribed successfully'
    }

    const existing = await prisma.newsletterSubscriber.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    })

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true, unsubscribedAt: null }
        })
        return NextResponse.json({ success: true, message: t.success, discountCode: 'SETRA10' })
      }
      return NextResponse.json(
        { success: false, error: t.exists },
        { status: 409 }
      )
    }

    await prisma.newsletterSubscriber.create({
      data: { email, isActive: true }
    })

    // return a discount code on success
    return NextResponse.json({
      success: true,
      message: t.success,
      discountCode: 'SETRA10'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email' },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })
    }
    console.error('Newsletter signup failed:', error)

    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
