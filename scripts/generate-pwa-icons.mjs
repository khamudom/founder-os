import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')

/** Android / Chromium manifest sizes */
const STANDARD_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

/** Maskable-safe layout: full bleed background, logo scaled inside safe circle */
const maskableSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#141716"/>
  <g transform="translate(77 77) scale(0.7)">
    <rect width="512" height="512" rx="96" fill="#141716"/>
    <rect x="128" y="160" width="256" height="48" rx="24" fill="#6eb4b4"/>
    <rect x="128" y="240" width="192" height="48" rx="24" fill="#6eb4b4" opacity="0.75"/>
    <rect x="128" y="320" width="224" height="48" rx="24" fill="#6eb4b4" opacity="0.5"/>
  </g>
</svg>`

async function pngFromSvg(svgPathOrBuffer, size, outPath) {
  await sharp(svgPathOrBuffer)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath)
}

async function main() {
  const src = path.join(publicDir, 'pwa-icon.svg')
  const buf = fs.readFileSync(src)

  for (const size of STANDARD_SIZES) {
    const name = size === 192 || size === 512 ? `pwa-${size}.png` : `pwa-${size}x${size}.png`
    const out = path.join(publicDir, name)
    await pngFromSvg(buf, size, out)
    console.log(`wrote ${name}`)
  }

  const maskableOut = path.join(publicDir, 'pwa-maskable-512.png')
  await pngFromSvg(Buffer.from(maskableSvg), 512, maskableOut)
  console.log('wrote pwa-maskable-512.png')

  const appleOut = path.join(publicDir, 'apple-touch-icon.png')
  await pngFromSvg(buf, 180, appleOut)
  console.log('wrote apple-touch-icon.png')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
