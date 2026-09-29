import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire } from 'node:module'
import { findAdminSessionCookieName } from '../lib/admin-session-cookie.ts'

const require = createRequire(import.meta.url)
const { encode, getToken } = require('next-auth/jwt')

test('admin session cookie selection handles secure, local and chunked names', () => {
  assert.equal(findAdminSessionCookieName(['__Secure-next-auth.session-token']), '__Secure-next-auth.session-token')
  assert.equal(findAdminSessionCookieName(['next-auth.session-token']), 'next-auth.session-token')
  assert.equal(findAdminSessionCookieName(['__Secure-next-auth.session-token.0']), '__Secure-next-auth.session-token')
  assert.equal(findAdminSessionCookieName(['other-cookie']), undefined)
})

test('explicit cookie name validates a secure admin JWT when URL configuration is HTTP', async () => {
  const previousUrl = process.env.NEXTAUTH_URL
  const previousVercel = process.env.VERCEL
  try {
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.VERCEL = '1'
    const secret = 'test-only-secret'
    const token = await encode({ token: { sub: 'synthetic', role: 'ADMIN' }, secret })
    const req = { cookies: { '__Secure-next-auth.session-token': token }, headers: {} }
    assert.equal(await getToken({ req, secret }), null)
    const cookieName = findAdminSessionCookieName(Object.keys(req.cookies))
    const verified = await getToken({ req, secret, cookieName })
    assert.equal(verified?.role, 'ADMIN')
  } finally {
    if (previousUrl === undefined) delete process.env.NEXTAUTH_URL
    else process.env.NEXTAUTH_URL = previousUrl
    if (previousVercel === undefined) delete process.env.VERCEL
    else process.env.VERCEL = previousVercel
  }
})
