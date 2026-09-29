// Clothing overlay renderer
// Takes a canvas 2D context, MediaPipe/TF pose keypoints, and the selected clothing
// item, then draws a stylised representation of the garment onto the canvas.
//
// Keypoint indices (MediaPipe BlazePose 33-point model):
//   11 LEFT_SHOULDER  12 RIGHT_SHOULDER
//   13 LEFT_ELBOW     14 RIGHT_ELBOW
//   15 LEFT_WRIST     16 RIGHT_WRIST
//   23 LEFT_HIP       24 RIGHT_HIP
//   25 LEFT_KNEE      26 RIGHT_KNEE
//   27 LEFT_ANKLE     28 RIGHT_ANKLE
//   0  NOSE           7 LEFT_EAR   8 RIGHT_EAR

const KP = {
  NOSE:            0,
  LEFT_SHOULDER:  11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW:     13,
  RIGHT_ELBOW:    14,
  LEFT_WRIST:     15,
  RIGHT_WRIST:    16,
  LEFT_HIP:       23,
  RIGHT_HIP:      24,
  LEFT_KNEE:      25,
  RIGHT_KNEE:     26,
  LEFT_ANKLE:     27,
  RIGHT_ANKLE:    28,
}

const MIN_CONFIDENCE = 0.4

function kp(keypoints, name) {
  const p = keypoints[KP[name]]
  if (!p || (p.score ?? 1) < MIN_CONFIDENCE) return null
  return p
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

// ── Per-category draw functions ──────────────────────────────────────────

function drawTop(ctx, keypoints, item, width, height) {
  const ls = kp(keypoints, 'LEFT_SHOULDER')
  const rs = kp(keypoints, 'RIGHT_SHOULDER')
  const lh = kp(keypoints, 'LEFT_HIP')
  const rh = kp(keypoints, 'RIGHT_HIP')
  const le = kp(keypoints, 'LEFT_ELBOW')
  const re = kp(keypoints, 'RIGHT_ELBOW')

  if (!ls || !rs || !lh || !rh) return

  const shoulderW = dist(ls, rs)
  const clothW    = shoulderW * 2.4
  const midShoulder = midpoint(ls, rs)
  const midHip      = midpoint(lh, rh)
  const torsoH      = (midHip.y - midShoulder.y) * 1.15

  const angle = Math.atan2(rs.y - ls.y, rs.x - ls.x)
  const startX = midShoulder.x - clothW / 2
  const startY = midShoulder.y - shoulderW * 0.15

  ctx.save()
  ctx.translate(midShoulder.x, midShoulder.y)
  ctx.rotate(angle)
  ctx.translate(-midShoulder.x, -midShoulder.y)

  // Body of the top
  const grad = ctx.createLinearGradient(startX, startY, startX + clothW, startY + torsoH)
  grad.addColorStop(0, hexToRgba(item.overlayColor, 0.88))
  grad.addColorStop(1, hexToRgba(item.overlaySecondary || item.overlayColor, 0.78))
  ctx.fillStyle = grad

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(startX + clothW, startY)
  ctx.lineTo(startX + clothW + shoulderW * 0.1, startY + torsoH)
  ctx.lineTo(startX - shoulderW * 0.1, startY + torsoH)
  ctx.closePath()
  ctx.fill()

  // Sleeves
  if (le && re) {
    drawSleeve(ctx, ls, le, shoulderW * 0.42, item, angle)
    drawSleeve(ctx, rs, re, shoulderW * 0.42, item, angle)
  } else {
    // Half-sleeve fallback
    const halfSleeveLen = shoulderW * 0.55
    const lSleeveEnd = { x: ls.x - halfSleeveLen, y: ls.y + halfSleeveLen * 0.5 }
    const rSleeveEnd = { x: rs.x + halfSleeveLen, y: rs.y + halfSleeveLen * 0.5 }
    drawSleeve(ctx, ls, lSleeveEnd, shoulderW * 0.38, item)
    drawSleeve(ctx, rs, rSleeveEnd, shoulderW * 0.38, item)
  }

  // Collar / neckline
  drawNeckline(ctx, midShoulder, shoulderW, item)

  // Subtle pattern overlay for prints
  if (item.pattern === 'floral') drawFloralHint(ctx, startX, startY, clothW, torsoH, item.overlayColor)
  if (item.pattern === 'embroidered') drawEmbroideryHint(ctx, startX, startY, clothW, torsoH, item.overlaySecondary)

  ctx.restore()
}

function drawSleeve(ctx, shoulder, elbow, radius, item) {
  ctx.beginPath()
  ctx.moveTo(shoulder.x, shoulder.y)
  ctx.lineTo(elbow.x, elbow.y)
  ctx.strokeStyle = hexToRgba(item.overlayColor, 0.85)
  ctx.lineWidth   = radius * 2
  ctx.lineCap     = 'round'
  ctx.stroke()
}

function drawNeckline(ctx, midShoulder, shoulderW, item) {
  ctx.beginPath()
  const neckW = shoulderW * 0.38
  const style = item.neckStyle

  if (style === 'v-neck') {
    ctx.moveTo(midShoulder.x - neckW / 2, midShoulder.y)
    ctx.lineTo(midShoulder.x, midShoulder.y + shoulderW * 0.18)
    ctx.lineTo(midShoulder.x + neckW / 2, midShoulder.y)
  } else if (style === 'turtleneck') {
    ctx.arc(midShoulder.x, midShoulder.y - shoulderW * 0.04, neckW / 2, 0, Math.PI * 2)
  } else {
    // crew / default
    ctx.arc(midShoulder.x, midShoulder.y, neckW / 2, Math.PI, 0)
  }

  ctx.strokeStyle = hexToRgba(item.overlaySecondary || item.overlayColor, 0.7)
  ctx.lineWidth   = 2.5
  ctx.stroke()
}

function drawBottom(ctx, keypoints, item) {
  const lh = kp(keypoints, 'LEFT_HIP')
  const rh = kp(keypoints, 'RIGHT_HIP')
  const lk = kp(keypoints, 'LEFT_KNEE')
  const rk = kp(keypoints, 'RIGHT_KNEE')
  const la = kp(keypoints, 'LEFT_ANKLE')
  const ra = kp(keypoints, 'RIGHT_ANKLE')

  if (!lh || !rh) return

  const hipW    = dist(lh, rh)
  const clothW  = hipW * 2.0
  const midHip  = midpoint(lh, rh)
  const bottomY = la && ra ? (la.y + ra.y) / 2 : midHip.y + hipW * 2.8
  const height  = bottomY - midHip.y

  const isSkirt   = item.type === 'skirt'
  const isTrousers = item.type === 'trousers' || item.type === 'jeans'

  const grad = ctx.createLinearGradient(midHip.x, midHip.y, midHip.x, bottomY)
  grad.addColorStop(0, hexToRgba(item.overlayColor, 0.88))
  grad.addColorStop(1, hexToRgba(item.overlaySecondary || item.overlayColor, 0.78))
  ctx.fillStyle = grad

  if (isSkirt) {
    const flare = item.fitType === 'flared' ? 0.4 : 0.08
    ctx.beginPath()
    ctx.moveTo(midHip.x - clothW / 2, midHip.y)
    ctx.bezierCurveTo(
      midHip.x - clothW / 2 - hipW * flare, midHip.y + height * 0.5,
      midHip.x - clothW / 2 - hipW * flare * 1.5, bottomY,
      midHip.x - clothW * 0.6, bottomY
    )
    ctx.lineTo(midHip.x + clothW * 0.6, bottomY)
    ctx.bezierCurveTo(
      midHip.x + clothW / 2 + hipW * flare * 1.5, bottomY,
      midHip.x + clothW / 2 + hipW * flare, midHip.y + height * 0.5,
      midHip.x + clothW / 2, midHip.y
    )
    ctx.closePath()
    ctx.fill()
  } else if (isTrousers) {
    // Left leg
    ctx.beginPath()
    ctx.moveTo(midHip.x - hipW * 0.1, midHip.y)
    ctx.lineTo(midHip.x - hipW * 1.0, midHip.y)
    ctx.lineTo(lk ? lk.x - hipW * 0.45 : midHip.x - hipW * 0.9, lk ? lk.y : midHip.y + height * 0.55)
    ctx.lineTo(la ? la.x - hipW * 0.38 : midHip.x - hipW * 0.8, bottomY)
    ctx.lineTo(la ? la.x + hipW * 0.05 : midHip.x - hipW * 0.3, bottomY)
    ctx.lineTo(midHip.x - hipW * 0.1, midHip.y + height * 0.05)
    ctx.closePath()
    ctx.fill()

    // Right leg
    ctx.beginPath()
    ctx.moveTo(midHip.x + hipW * 0.1, midHip.y)
    ctx.lineTo(midHip.x + hipW * 1.0, midHip.y)
    ctx.lineTo(rk ? rk.x + hipW * 0.45 : midHip.x + hipW * 0.9, rk ? rk.y : midHip.y + height * 0.55)
    ctx.lineTo(ra ? ra.x + hipW * 0.38 : midHip.x + hipW * 0.8, bottomY)
    ctx.lineTo(ra ? ra.x - hipW * 0.05 : midHip.x + hipW * 0.3, bottomY)
    ctx.lineTo(midHip.x + hipW * 0.1, midHip.y + height * 0.05)
    ctx.closePath()
    ctx.fill()
  }
}

function drawDress(ctx, keypoints, item) {
  drawTop(ctx, keypoints, item)
  // Dress skirt extends from hip to ankle
  const lh = kp(keypoints, 'LEFT_HIP')
  const rh = kp(keypoints, 'RIGHT_HIP')
  const la = kp(keypoints, 'LEFT_ANKLE')
  const ra = kp(keypoints, 'RIGHT_ANKLE')

  if (!lh || !rh) return

  const hipW  = dist(lh, rh)
  const midHip = midpoint(lh, rh)
  const bottomY = la && ra ? (la.y + ra.y) / 2 + hipW * 0.2 : midHip.y + hipW * 3.2
  const height  = bottomY - midHip.y
  const flare   = item.fitType === 'bodycon' ? 0.0 : item.fitType === 'a-line' ? 0.45 : 0.25

  const grad = ctx.createLinearGradient(midHip.x, midHip.y, midHip.x, bottomY)
  grad.addColorStop(0, hexToRgba(item.overlayColor, 0.85))
  grad.addColorStop(1, hexToRgba(item.overlaySecondary || item.overlayColor, 0.75))
  ctx.fillStyle = grad

  ctx.beginPath()
  ctx.moveTo(midHip.x - hipW * 1.05, midHip.y)
  ctx.bezierCurveTo(
    midHip.x - hipW * (1.05 + flare), midHip.y + height * 0.4,
    midHip.x - hipW * (1.1 + flare),  bottomY,
    midHip.x - hipW * (0.6 + flare * 0.8), bottomY
  )
  ctx.lineTo(midHip.x + hipW * (0.6 + flare * 0.8), bottomY)
  ctx.bezierCurveTo(
    midHip.x + hipW * (1.1 + flare),  bottomY,
    midHip.x + hipW * (1.05 + flare), midHip.y + height * 0.4,
    midHip.x + hipW * 1.05, midHip.y
  )
  ctx.closePath()
  ctx.fill()
}

function drawOuterwear(ctx, keypoints, item) {
  // Draw as a wider top with lapels
  drawTop(ctx, keypoints, { ...item, overlayColor: item.overlayColor })

  const ls = kp(keypoints, 'LEFT_SHOULDER')
  const rs = kp(keypoints, 'RIGHT_SHOULDER')
  if (!ls || !rs) return

  const mid = midpoint(ls, rs)
  const sw  = dist(ls, rs)

  // Lapel V
  ctx.beginPath()
  ctx.moveTo(mid.x - sw * 0.22, mid.y)
  ctx.lineTo(mid.x, mid.y + sw * 0.22)
  ctx.lineTo(mid.x + sw * 0.22, mid.y)
  ctx.strokeStyle = hexToRgba(item.overlaySecondary || item.overlayColor, 0.65)
  ctx.lineWidth   = 3
  ctx.stroke()
}

// ── Decorative pattern hints ─────────────────────────────────────────────

function drawFloralHint(ctx, x, y, w, h, baseColor) {
  ctx.save()
  ctx.globalAlpha = 0.25
  ctx.fillStyle = lighten(baseColor, 60)
  for (let i = 0; i < 8; i++) {
    const fx = x + Math.random() * w
    const fy = y + Math.random() * h
    const r  = 3 + Math.random() * 5
    ctx.beginPath()
    ctx.arc(fx, fy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawEmbroideryHint(ctx, x, y, w, h, accentColor) {
  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.strokeStyle = accentColor || '#fbbf24'
  ctx.lineWidth   = 1.5
  for (let i = 0; i < 5; i++) {
    const sx = x + w * 0.1 + Math.random() * w * 0.8
    const sy = y + Math.random() * h * 0.5
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.bezierCurveTo(sx + 10, sy - 8, sx + 20, sy + 8, sx + 30, sy)
    ctx.stroke()
  }
  ctx.restore()
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Main entry point. Call on every animation frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array}  keypoints  - pose keypoints from TF.js BlazePose
 * @param {Object} item       - clothing item from catalog
 * @param {number} canvasW    - canvas pixel width
 * @param {number} canvasH    - canvas pixel height
 */
export function renderClothingOverlay(ctx, keypoints, item, canvasW, canvasH) {
  if (!ctx || !keypoints || !item) return

  ctx.save()
  ctx.globalCompositeOperation = 'source-over'

  switch (item.category) {
    case 'tops':
      drawTop(ctx, keypoints, item, canvasW, canvasH)
      break
    case 'bottoms':
      drawBottom(ctx, keypoints, item)
      break
    case 'dresses':
      drawDress(ctx, keypoints, item)
      break
    case 'outerwear':
      drawOuterwear(ctx, keypoints, item)
      break
    case 'ethnic':
      if (item.type === 'kurta') drawTop(ctx, keypoints, { ...item }, canvasW, canvasH)
      else if (item.type === 'saree') drawDress(ctx, keypoints, item)
      break
    default:
      drawTop(ctx, keypoints, item, canvasW, canvasH)
  }

  ctx.restore()
}

/**
 * Draw skeleton dots and lines for debugging pose detection.
 */
export function drawPoseSkeleton(ctx, keypoints, color = '#8b5cf6') {
  if (!keypoints) return
  ctx.save()

  const connections = [
    [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER],
    [KP.LEFT_SHOULDER, KP.LEFT_ELBOW],
    [KP.LEFT_ELBOW, KP.LEFT_WRIST],
    [KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW],
    [KP.RIGHT_ELBOW, KP.RIGHT_WRIST],
    [KP.LEFT_SHOULDER, KP.LEFT_HIP],
    [KP.RIGHT_SHOULDER, KP.RIGHT_HIP],
    [KP.LEFT_HIP, KP.RIGHT_HIP],
    [KP.LEFT_HIP, KP.LEFT_KNEE],
    [KP.LEFT_KNEE, KP.LEFT_ANKLE],
    [KP.RIGHT_HIP, KP.RIGHT_KNEE],
    [KP.RIGHT_KNEE, KP.RIGHT_ANKLE],
  ]

  ctx.strokeStyle = color
  ctx.lineWidth   = 2
  ctx.globalAlpha = 0.6

  for (const [a, b] of connections) {
    const pa = keypoints[a]; const pb = keypoints[b]
    if (!pa || !pb || (pa.score ?? 1) < MIN_CONFIDENCE || (pb.score ?? 1) < MIN_CONFIDENCE) continue
    ctx.beginPath()
    ctx.moveTo(pa.x, pa.y)
    ctx.lineTo(pb.x, pb.y)
    ctx.stroke()
  }

  ctx.fillStyle   = color
  ctx.globalAlpha = 0.9
  for (const kpIdx of Object.values(KP)) {
    const p = keypoints[kpIdx]
    if (!p || (p.score ?? 1) < MIN_CONFIDENCE) continue
    ctx.beginPath()
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// ── Helpers ──────────────────────────────────────────────────────────────

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(128,128,128,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function lighten(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `rgb(${r},${g},${b})`
}
