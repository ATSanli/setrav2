import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { translations } from '@/translations'

const schema = z.object({
  email: z.string().min(1).email(),
  lang: z.enum(['tr', 'en']).optional()
})

export async function POST(request: NextRequest) {
  // Quick sanity check for database configuration to provide clearer errors
  if (!process.env.DATABASE_URL) {
    console.error('NEWSLETTER ERROR: DATABASE_URL is not set')
    return NextResponse.json(
      { success: false, error: 'Server configuration error: DATABASE_URL not set' },
      { status: 500 }
    )
  }
  try {
    const body = await request.json()
    const { email, lang } = schema.parse(body)
    const language = lang ?? 'tr'

    const t = translations[language]?.newsletter?.messages || {
      exists: 'Already subscribed',
      success: 'Subscribed successfully'
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: t.exists },
        { status: 409 }
      )
    }

    await prisma.newsletterSubscriber.create({
      data: { email }
    })

    // return a discount code on success
    return NextResponse.json({
      success: true,
      message: t.success,
      discountCode: 'WELCOME10'
    })

  } catch (error) {
    console.error('NEWSLETTER ERROR:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}