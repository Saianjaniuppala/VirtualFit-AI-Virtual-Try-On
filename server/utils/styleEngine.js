// Server-side style scoring — mirrors client/src/utils/styleRecommendations.js

const UNDERTONE_PALETTE = {
  warm: {
    best:  ['terracotta', 'rust', 'warm red', 'orange', 'gold', 'olive', 'warm brown', 'cream', 'camel', 'peach'],
    avoid: ['icy pink', 'cool lavender', 'silver', 'stark white', 'cool blue-grey'],
    hues:  ['#C8724A', '#E07040', '#D4A853', '#8B6914', '#C87941', '#A06040', '#E8C990'],
    tip:   'Lean into earthy, golden, and terracotta tones. They echo your natural warmth and make your complexion glow.',
  },
  cool: {
    best:  ['navy', 'royal blue', 'emerald', 'magenta', 'berry', 'lavender', 'silver', 'cool red', 'plum', 'bright white'],
    avoid: ['orange', 'warm yellow', 'rust', 'warm brown', 'terracotta'],
    hues:  ['#1E40AF', '#0F766E', '#6D28D9', '#9D174D', '#1E3A5F', '#374151', '#7C3AED'],
    tip:   'Blues, jewel tones, and crisp whites complement your cool undertone beautifully and create striking contrast.',
  },
  neutral: {
    best:  ['nude', 'taupe', 'greige', 'rose gold', 'soft white', 'denim', 'warm grey', 'medium blue', 'dusty pink', 'sage'],
    avoid: ['overwhelming neons'],
    hues:  ['#C4A882', '#9B8B7A', '#D4B896', '#8B7D6B', '#B8A090', '#A89080', '#6B5B4E'],
    tip:   'You have the widest color freedom! Anchor your look with classic neutrals and add any accent color you love.',
  },
}

const PERSONALITY_TAGS = {
  classic:    ['timeless', 'office', 'versatile', 'sophisticated'],
  bohemian:   ['summer', 'vacation', 'vibrant', 'ethnic', 'layering'],
  minimalist: ['everyday', 'comfort', 'simple', 'capsule'],
  edgy:       ['street-style', 'bold', 'statement', 'dark'],
  romantic:   ['feminine', 'summer', 'floral', 'soft'],
  athletic:   ['sport', 'casual', 'comfort', 'functional'],
  preppy:     ['smart-casual', 'office', 'versatile'],
  glamorous:  ['evening', 'glamorous', 'luxury', 'bridal'],
}

const PERSONALITY_OCCASIONS = {
  classic:    ['formal', 'casual'],
  bohemian:   ['casual', 'ethnic', 'party'],
  minimalist: ['casual', 'formal'],
  edgy:       ['party', 'casual'],
  romantic:   ['casual', 'party'],
  athletic:   ['sport', 'casual'],
  preppy:     ['formal', 'casual'],
  glamorous:  ['party', 'formal', 'ethnic'],
}

function scoreItem(item, { undertone, personality, occasion }) {
  let score = 50

  if (undertone) {
    const palette = UNDERTONE_PALETTE[undertone]
    if (item.recommendedFor?.includes(undertone)) score += 20
    const colorMatch = palette?.best.some(
      (c) => item.color?.toLowerCase().includes(c) || c.includes(item.color?.toLowerCase())
    )
    if (colorMatch) score += 10
  }

  if (personality) {
    const wantedTags = PERSONALITY_TAGS[personality] || []
    score += (item.tags || []).filter((t) => wantedTags.includes(t)).length * 5

    const wantedOccasions = PERSONALITY_OCCASIONS[personality] || []
    score += (item.occasion || []).filter((o) => wantedOccasions.includes(o)).length * 8
  }

  if (occasion && occasion !== 'all' && item.occasion?.includes(occasion)) score += 15

  score += ((item.rating || 0) / 5) * 5

  return Math.min(100, Math.max(0, Math.round(score)))
}

function getPalette(undertone) {
  return UNDERTONE_PALETTE[undertone] || null
}

module.exports = { scoreItem, getPalette, UNDERTONE_PALETTE }
