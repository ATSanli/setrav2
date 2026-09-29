import { randomUUID } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

if (process.env.VERIFY_SIGNUPS_ALLOW_WRITES !== '1' || !process.env.TEST_BASE_URL || !process.env.TEST_ADMIN_COOKIE || !process.env.DATABASE_URL) {
  console.error('Set VERIFY_SIGNUPS_ALLOW_WRITES=1, TEST_BASE_URL, TEST_ADMIN_COOKIE and DATABASE_URL in the test environment.')
  process.exit(2)
}

const base = new URL(process.env.TEST_BASE_URL)
const email = `setra-flow-${randomUUID()}@example.com`
const db = new PrismaClient()

async function request(path, options = {}) {
  const response = await fetch(new URL(path, base), { redirect: 'manual', ...options })
  const body = await response.json().catch(() => ({}))
  return { status: response.status, body }
}

function assert(condition, label) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`${label}: ok`)
}

try {
  const invalidRegistration = await request('/api/auth/register', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ firstName: 'A', lastName: 'B', email: 'invalid', password: 'x' })
  })
  assert(invalidRegistration.status === 400, 'registration validation')

  const invalidNewsletter = await request('/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'invalid' })
  })
  assert(invalidNewsletter.status === 400, 'newsletter validation')

  assert((await request('/api/admin/users')).status === 401, 'user list authorization')
  assert((await request('/api/admin/newsletter')).status === 401, 'newsletter list authorization')

  const registration = await request('/api/auth/register', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ firstName: 'Test', lastName: 'Account', email, password: randomUUID() })
  })
  assert(registration.status === 201 && registration.body.success, 'registration response')
  assert(Boolean(await db.user.findFirst({ where: { email }, select: { id: true } })), 'registration database write')

  const subscription = await request('/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email })
  })
  assert(subscription.status === 200 && subscription.body.success, 'newsletter response')
  assert(Boolean(await db.newsletterSubscriber.findFirst({ where: { email, isActive: true }, select: { id: true } })), 'newsletter database write')

  const duplicate = await request('/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: email.toUpperCase() })
  })
  assert(duplicate.status === 409, 'newsletter duplicate handling')

  const adminHeaders = { cookie: process.env.TEST_ADMIN_COOKIE }
  const users = await request(`/api/admin/users?role=USER&q=${encodeURIComponent(email)}`, { headers: adminHeaders })
  assert(users.status === 200 && users.body.total >= 1 && users.body.users?.some(user => user.email === email), 'registration admin list')

  const subscribers = await request(`/api/admin/newsletter?q=${encodeURIComponent(email)}`, { headers: adminHeaders })
  assert(subscribers.status === 200 && subscribers.body.total >= 1 && subscribers.body.subscribers?.some(item => item.email === email && item.isActive), 'newsletter admin list')
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Verification failed')
  process.exitCode = 1
} finally {
  await db.$disconnect()
}
