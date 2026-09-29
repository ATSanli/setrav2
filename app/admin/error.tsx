'use client'

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return <div role="alert" className="rounded border p-6">
    <h2 className="font-semibold">Admin verileri yüklenemedi</h2>
    <p className="my-3">Bağlantıyı kontrol edip tekrar deneyin.</p>
    <button className="border px-4 py-2" onClick={reset}>Tekrar dene</button>
  </div>
}
