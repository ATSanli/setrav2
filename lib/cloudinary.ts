import { v2 as cloudinary } from "cloudinary"

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  // Warn instead of throwing so build-time bundling doesn't fail unexpectedly.
  // The API route will still fail at runtime if envs are missing; check Vercel env settings.
  // Clearer message helps debugging the common "Must supply api_key" error.
  // Do NOT prefix these env vars with NEXT_PUBLIC_ — keep them server-only.
  // Example: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  // In Vercel: Settings → Environment Variables → add them for Production (and Preview if needed).
  // NOTE: Do not commit secrets to the repo.
  // eslint-disable-next-line no-console
  console.warn('Cloudinary env vars missing: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET')
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

export default cloudinary