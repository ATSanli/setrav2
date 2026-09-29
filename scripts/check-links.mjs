import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const app = path.join(root, 'app')
const failures = []

function walk(dir, suffixes) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(file, suffixes) : suffixes.some(suffix => file.endsWith(suffix)) ? [file] : []
  })
}

function routeFor(file) {
  const relative = path.relative(app, path.dirname(file)).split(path.sep)
  return '/' + relative.filter(segment => !/^\(.+\)$/.test(segment)).join('/')
}

const pageRoutes = walk(app, ['page.tsx']).map(routeFor)
const apiRoutes = walk(path.join(app, 'api'), ['route.ts']).map(file => ({ path: routeFor(file), file }))
const redirects = new Set(['/favorites', '/hesabim/favorilerim'])

function matches(pattern, url) {
  const segments = pattern.split('/').filter(Boolean)
  const parts = url.split('/').filter(Boolean)
  if (segments.length !== parts.length && !segments.some(segment => segment.startsWith('[...'))) return false
  return segments.every((segment, index) => segment.startsWith('[') || segment === parts[index])
}

const sourceFiles = [
  ...walk(app, ['.tsx', '.ts']),
  ...walk(path.join(root, 'components'), ['.tsx', '.ts']),
  ...walk(path.join(root, 'hooks'), ['.tsx', '.ts'])
]

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  const label = path.relative(root, file)
  for (const match of source.matchAll(/(?:href|src)=["'](\/[\w./?=&%-]+|#)["']/g)) {
    const value = match[1]
    if (value === '#') { failures.push(`${label}: işlevsiz href="#"`); continue }
    const pathname = value.split('?')[0]
    if (match[0].startsWith('src=')) {
      if (!existsSync(path.join(root, 'public', pathname))) failures.push(`${label}: eksik görsel ${pathname}`)
    } else if (!pageRoutes.some(route => matches(route, pathname)) && !redirects.has(pathname) && !pathname.startsWith('/api/auth/')) {
      failures.push(`${label}: sayfa yok ${pathname}`)
    }
  }
  for (const match of source.matchAll(/fetch\(\s*['"`]((?:\/api\/)[^'"`]+)['"`]/g)) {
    const url = match[1].replace(/\$\{[^}]+\}/g, 'value').split('?')[0]
    const route = apiRoutes.find(candidate => matches(candidate.path, url))
    if (!route) { failures.push(`${label}: API yok ${url}`); continue }
    const tail = source.slice(match.index + match[0].length, match.index + match[0].length + 220)
    const method = /^\s*,\s*\{/.test(tail) ? (tail.match(/\bmethod:\s*['"](GET|POST|PUT|PATCH|DELETE)['"]/i)?.[1]?.toUpperCase() || 'GET') : 'GET'
    const handler = readFileSync(route.file, 'utf8')
    if (!new RegExp(`(?:function\\s+${method}\\b|\\bas\\s+${method}\\b)`).test(handler)) failures.push(`${label}: ${method} ${url} için API metodu yok`)
  }
}

console.log(`Kaynak denetimi: ${sourceFiles.length} dosya, ${pageRoutes.length} sayfa, ${apiRoutes.length} API rotası`)
if (failures.length) { failures.forEach(failure => console.error(failure)); process.exitCode = 1 }
else console.log('Statik iç bağlantı, görsel ve API yol denetimi başarılı.')

const baseArg = process.argv.find(argument => argument.startsWith('--base='))
if (baseArg) {
  const base = new URL(baseArg.slice(7))
  const max = Number(process.argv.find(argument => argument.startsWith('--max='))?.slice(6) || 100)
  const queue = ['/']
  const seen = new Set()
  while (queue.length && seen.size < max) {
    const pathname = queue.shift()
    if (seen.has(pathname)) continue
    seen.add(pathname)
    try {
      const response = await fetch(new URL(pathname, base), { signal: AbortSignal.timeout(10000), redirect: 'follow' })
      if (!response.ok) { failures.push(`${pathname}: HTTP ${response.status}`); continue }
      const html = await response.text()
      for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/g)) {
        const target = new URL(match[1], base)
        if (target.origin === base.origin && !target.pathname.startsWith('/api/') && !seen.has(target.pathname)) queue.push(target.pathname)
      }
    } catch (error) { failures.push(`${pathname}: ${error.message}`) }
  }
  console.log(`HTTP taraması: ${seen.size} sayfa`)
  if (failures.length) { failures.forEach(failure => console.error(failure)); process.exitCode = 1 }
}
