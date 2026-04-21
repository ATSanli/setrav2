import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { translations } from '@/translations'

const schema = z.object({
  email: z.string().min(1).email(),
  lang: z.enum(['tr', 'en']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, lang } = schema.parse(body)
    const language = lang ?? 'tr'

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: translations[language].newsletter.messages.exists },
        { status: 409 }
      )
    }

    await prisma.newsletterSubscriber.create({ data: { email } })

    return NextResponse.json({ success: true, message: translations[language].newsletter.messages.success })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'invalid' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 })
  }
}
