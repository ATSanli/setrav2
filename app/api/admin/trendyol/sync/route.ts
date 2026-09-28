import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { safeTrendyolError, syncTrendyol } from '@/lib/trendyol'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST() {
  try { await requirePermission('stock_manage') }
  catch { return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 }) }
  try {
    const run = await syncTrendyol('full')
    return NextResponse.json({ runId: run.id, mode: run.mode, status: run.status, processed: run.processed, created: run.created, updated: run.updated, deactivated: run.deactivated, failed: run.failed })
  } catch (error) {
    return NextResponse.json({ error: safeTrendyolError(error) }, { status: 503 })
  }
}
