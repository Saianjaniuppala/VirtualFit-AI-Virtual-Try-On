// Style recommendation engine
// Combines skin-tone undertone, body type, personality, and occasion
// to score and rank clothing items.

// ── Color-theory palette maps ────────────────────────────────────────────

const UNDERTONE_PALETTE = {
  warm: {
    best:   ['terracotta', 'rust', 'warm red', 'orange', 'gold', 'olive', 'warm brown', 'cream', 'camel', 'peach'],
    good:   ['coral', 'mustard', 'warm green', 'warm pink', 'ivory'],
    avoid:  ['icy pink', 'cool lavender', 'silver', 'stark white', 'cool blue-grey'],
    neutrals: ['cream', 'beige', 'warm grey', 'camel'],
    hues: ['#C8724A', '#E07040', '#D4A853', '#8B6914', '#C87941', '#A06040', '#E8C990'],
  },
  cool: {
    best:   ['navy', 'royal blue', 'emerald', 'magenta', 'berry', 'lavender', 'silver', 'cool red', 'plum', 'bright white'],
    good:   ['cobalt', 'teal', 'fuchsia', 'cool pink', 'charcoal'],
    avoid:  ['orange', 'warm yellow', 'rust', 'warm brown', 'terracotta'],
    neutrals: ['bright white', 'cool grey', 'charcoal', 'navy'],
    hues: ['#1E40AF', '#0F766E', '#6D28D9', '#9D174D', '#1E3A5F', '#374151', '#7C3AED'],
  },
  neutral: {
    best:   ['nude', 'taupe', 'greige', 'rose gold', 'soft white', 'denim', 'warm grey', 'medium blue', 'dusty pink', 'sage'],
    good:   ['most colors work', 'experiment freely'],
    avoid:  ['nothing specific — avoid overwhelming neons'],
    neutrals: ['taupe', 'greige', 'warm white', 'medium grey'],
    hues: ['#C4A882', '#9B8B7A', '#D4B896', '#8B7D6B', '#B8A090', '#A89080', '#6B5B4E'],
  },
}

// ── Personality to style mapping ─────────────────────────────────────────

export const PERSONALITY_STYLES = {
  classic:    { label: 'Classic',    icon: '🎩', description: 'Timeless, polished, understated elegance' },
  bohemian:   { label: 'Bohemian',   icon: '🌸', description: 'Free-spirited, earthy, artsy, layered' },
  minimalist: { label: 'Minimalist', icon: '⬜', description: 'Clean lines, neutral palette, capsule wardrobe' },
  edgy:       { label: 'Edgy',       icon: '⚡', description: 'Bold, unconventional, statement-making' },
  romantic:   { label: 'Romantic',   icon: '🌹', description: 'Soft, feminine, floral, flowy' },
  athletic:   { label: 'Athletic',   icon: '🏃', description: 'Functional, sporty, comfortable' },
  preppy:     { label: 'Preppy',     icon: '🎓', description: 'Smart-casual, collegiate, polished' },
  glamorous:  { label: 'Glamorous',  icon: '✨', description: 'Show-stopping, luxurious, high-fashion' },
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

// ── Scoring ──────────────────────────────────────────────────────────────

/**
 * Score a single clothing item against the user's profile.
 * Returns a number 0-100.
 */
export function scoreItem(item, { undertone, personality, occasion, bodyType }) {
  let score = 50

  // Skin-tone compatibility (+20 / +10 / -10)
  if (undertone) {
    const palette = UNDERTONE_PALETTE[undertone]
    if (item.recommendedFor?.includes(undertone)) score += 20
    const colorMatch = palette?.best.some((c) => item.color?.toLowerCase().includes(c) || c.includes(item.color?.toLowerCase()))
    if (colorMatch) score += 10
  }

  // Personality tag overlap (+5 per matching tag)
  if (personality) {
    const wantedTags = PERSONALITY_TAGS[personality] || []
    const tagOverlap = (item.tags || []).filter((t) => wantedTags.includes(t)).length
    score += tagOverlap * 5

    const wantedOccasions = PERSONALITY_OCCASIONS[personality] || []
    const occOverlap = (item.occasion || []).filter((o) => wantedOccasions.includes(o)).length
    score += occOverlap * 8
  }

  // Explicit occasion filter (+15)
  if (occasion && occasion !== 'all' && item.occasion?.includes(occasion)) score += 15

  // Rating bonus (+up to 5)
  score += ((item.rating || 0) / 5) * 5

  return Math.min(100, Math.max(0, score))
}

/**
 * Rank a catalog of clothing items and return the top N.
 */
export function getRankedRecommendations(catalog, profile, topN = 6) {
  return catalog
    .map((item) => ({ ...item, score: scoreItem(item, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

/**
 * Return the color palette and style tips for a given undertone.
 */
export function getStyleGuide(undertone) {
  if (!undertone || !(undertone in UNDERTONE_PALETTE)) return null
  return {
    undertone,
    ...UNDERTONE_PALETTE[undertone],
    tip: buildTip(undertone),
  }
}

function buildTip(undertone) {
  const tips = {
    warm:    'Lean into earthy, golden, and terracotta tones. They echo your natural warmth and make your complexion glow.',
    cool:    'Blues, jewel tones, and crisp whites complement your cool undertone beautifully and create striking contrast.',
    neutral: 'You have the widest color freedom! Anchor your look with classic neutrals and add any accent color you love.',
  }
  return tips[undertone] || ''
}

/**
 * Body-type silhouette advice.
 */
export const BODY_TYPES = {
  hourglass: {
    label: 'Hourglass',
    icon: '⏳',
    tips: ['Wrap dresses highlight your balanced proportions', 'Belted coats celebrate your waist', 'Avoid boxy silhouettes that hide your shape'],
    recommended: ['wrap', 'fitted', 'bodycon'],
  },
  pear: {
    label: 'Pear',
    icon: '🍐',
    tips: ['Draw attention upward with structured shoulders', 'A-line skirts flow over hips gracefully', 'Dark bottoms with bold tops balance proportions'],
    recommended: ['a-line', 'flared', 'regular'],
  },
  apple: {
    label: 'Apple',
    icon: '🍎',
    tips: ['Empire-waist styles create a flattering long line', 'V-necks elongate the upper body', 'Flowy tunics over leggings are effortlessly chic'],
    recommended: ['relaxed', 'empire', 'flowy'],
  },
  rectangular: {
    label: 'Rectangular',
    icon: '▭',
    tips: ['Create curves with peplum tops and full skirts', 'Layering adds dimension to a straight frame', 'Belted outfits define the waist beautifully'],
    recommended: ['peplum', 'flared', 'belted'],
  },
  inverted_triangle: {
    label: 'Inverted Triangle',
    icon: '▽',
    tips: ['Balance broad shoulders with volume at the hips', 'Wide-leg trousers are your best friend', 'Avoid cap sleeves and padded shoulders'],
    recommended: ['wide-leg', 'a-line', 'relaxed'],
  },
}

export { UNDERTONE_PALETTE, PERSONALITY_TAGS }
