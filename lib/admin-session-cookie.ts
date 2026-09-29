const SESSION_COOKIE_NAMES = ['__Secure-next-auth.session-token', 'next-auth.session-token'] as const

export function findAdminSessionCookieName(receivedNames: string[]) {
  return SESSION_COOKIE_NAMES.find(name => receivedNames.some(received => received === name || received.startsWith(`${name}.`)))
}
