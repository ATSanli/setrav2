import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 88,
        color: '#f7f9f7',
        background: 'radial-gradient(circle at 80% 20%, #1f5965 0%, #122436 46%, #080e19 100%)',
      }}
    >
      <div style={{ color: '#b8f5eb', fontSize: 26, letterSpacing: 10, marginBottom: 30 }}>SETRA / TECH</div>
      <div style={{ fontSize: 78, fontWeight: 600, lineHeight: 1.08, maxWidth: 980 }}>İşinizin yeni çalışma biçimi.</div>
      <div style={{ color: '#c6dadc', fontSize: 30, marginTop: 42 }}>CompOS · Yazılım · Yapay zekâ · Otomasyon</div>
      <div style={{ width: 130, height: 5, background: '#b8f5eb', marginTop: 60 }} />
    </div>,
    size,
  )
}
