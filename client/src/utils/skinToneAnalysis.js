// Skin tone analysis — sample pixels from the face region of a video/canvas frame
// and classify the user's undertone (warm · cool · neutral) using ITA (Individual
// Typology Angle) approximation in CIE L*a*b* space.

const SKIN_TONES = {
  'very-fair':   { label: 'Very Fair',   hex: '#f8d5c2', ita: '>55',  undertone: 'cool' },
  'fair':        { label: 'Fair',        hex: '#f2c09a', ita: '41-55', undertone: 'neutral' },
  'light':       { label: 'Light',       hex: '#e8a87c', ita: '28-41', undertone: 'warm' },
  'medium':      { label: 'Medium',      hex: '#c68642', ita: '10-28', undertone: 'warm' },
  'olive':       { label: 'Olive',       hex: '#a0725a', ita: '-30-10', undertone: 'neutral' },
  'tan':         { label: 'Tan',         hex: '#8d5524', ita: '-30--55', undertone: 'warm' },
  'deep-brown':  { label: 'Deep Brown',  hex: '#6b3a2a', ita: '-55--90', undertone: 'neutral' },
  'deep':        { label: 'Deep',        hex: '#3b1f0e', ita: '<-90', undertone: 'cool' },
}

/**
 * Convert sRGB [0-255] to linear light.
 */
function linearize(c) {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/**
 * sRGB → CIE XYZ (D65 illuminant).
 */
function rgbToXyz(r, g, b) {
  const rl = linearize(r)
  const gl = linearize(g)
  const bl = linearize(b)
  return {
    x: rl * 0.4124 + gl * 0.3576 + bl * 0.1805,
    y: rl * 0.2126 + gl * 0.7152 + bl * 0.0722,
    z: rl * 0.0193 + gl * 0.1192 + bl * 0.9505,
  }
}

function fLab(t) {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
}

/**
 * sRGB → CIE L*a*b* (D65).
 */
function rgbToLab(r, g, b) {
  const { x, y, z } = rgbToXyz(r, g, b)
  const fx = fLab(x / 0.95047)
  const fy = fLab(y / 1.0)
  const fz = fLab(z / 1.08883)
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

/**
 * Individual Typology Angle.
 * ITA > 55  → very fair skin
 * ITA < -90 → very deep skin
 */
function calculateITA(L, b) {
  return (Math.atan((L - 50) / b) * 180) / Math.PI
}

/**
 * Sample the skin-tone region from a canvas ImageData.
 * faceRegion: { x, y, width, height } in canvas pixels
 */
export function analyzeSkinTone(imageData, faceRegion) {
  const { data, width } = imageData
  const { x: fx, y: fy, width: fw, height: fh } = faceRegion

  let totalL = 0, totalA = 0, totalB = 0, count = 0

  for (let row = Math.floor(fy); row < Math.floor(fy + fh); row += 4) {
    for (let col = Math.floor(fx); col < Math.floor(fx + fw); col += 4) {
      const idx = (row * width + col) * 4
      const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3]

      if (a < 128) continue
      if (!isSkinPixel(r, g, b)) continue

      const lab = rgbToLab(r, g, b)
      totalL += lab.L; totalA += lab.a; totalB += lab.b
      count++
    }
  }

  if (count === 0) return null

  const avgL = totalL / count
  const avgA = totalA / count
  const avgB = totalB / count
  const ita  = calculateITA(avgL, avgB)

  return classifyTone(ita, avgA, avgB)
}

/**
 * Rough skin-pixel heuristic in RGB space (fast pre-filter before Lab).
 */
function isSkinPixel(r, g, b) {
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - Math.min(g, b) > 15 &&
    r - b > 35
  )
}

function classifyTone(ita, a, b) {
  let toneKey
  if      (ita > 55)  toneKey = 'very-fair'
  else if (ita > 41)  toneKey = 'fair'
  else if (ita > 28)  toneKey = 'light'
  else if (ita > 10)  toneKey = 'medium'
  else if (ita > -30) toneKey = 'olive'
  else if (ita > -55) toneKey = 'tan'
  else if (ita > -90) toneKey = 'deep-brown'
  else                toneKey = 'deep'

  // Refine undertone from a* and b* channels
  let undertone
  if (a > 8 && b > 12)       undertone = 'warm'
  else if (a < 4 || b < 6)   undertone = 'cool'
  else                        undertone = 'neutral'

  return {
    key: toneKey,
    ...SKIN_TONES[toneKey],
    undertone,
    ita: Math.round(ita),
  }
}

/**
 * Manual skin-tone selection (for users who prefer to pick).
 */
export function getToneByKey(key) {
  return key in SKIN_TONES ? { key, ...SKIN_TONES[key] } : null
}

export const SKIN_TONE_OPTIONS = Object.entries(SKIN_TONES).map(([key, val]) => ({
  key,
  ...val,
}))
