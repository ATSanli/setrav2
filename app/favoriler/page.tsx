'use server'

import { redirect } from 'next/navigation'

export default function FavorilerRedirect() {
  // Redirect Turkish `/favoriler` to the canonical `/favorites` page
  redirect('/favorites')
}
