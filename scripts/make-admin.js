const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) return
    let [, key, val] = m
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
    process.env[key] = val
  })
}

async function main() {
  loadEnv()
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/make-admin.js user@example.com')
    process.exit(1)
  }

  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log('Updated user to ADMIN:', user)
  } catch (err) {
    console.error('Error updating user:', err.message || err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
