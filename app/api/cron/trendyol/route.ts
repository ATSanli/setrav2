import { NextRequest, NextResponse } from 'next/server'
import { safeTrendyolError, syncTrendyol } from '@/lib/trendyol'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const run = await syncTrendyol()
    return NextResponse.json({ runId: run.id, mode: run.mode, status: run.status, processed: run.processed, created: run.created, updated: run.updated, deactivated: run.deactivated, failed: run.failed })
  } catch (error) {
    return NextResponse.json({ error: safeTrendyolError(error) }, { status: 503 })
  }
}
