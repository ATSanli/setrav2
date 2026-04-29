import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    url.pathname = '/favorites'
    return NextResponse.redirect(url)
  } catch (err) {
    console.error('Favoriler redirect error:', err)
    return NextResponse.redirect('/favorites')
  }
}
