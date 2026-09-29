import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      select: { name: true, slug: true, image: true },
      orderBy: { sortOrder: 'asc' }
    })
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Kategoriler şu anda yüklenemiyor' }, { status: 500 })
  }
}
