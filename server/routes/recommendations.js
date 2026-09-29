const router   = require('express').Router()
const Clothing = require('../models/Clothing')
const { scoreItem, getPalette } = require('../utils/styleEngine')

// POST /api/recommendations — rank the catalog for a style profile
// Body: { undertone, personality, occasion, limit }
router.post('/', async (req, res, next) => {
  try {
    const { undertone, personality, occasion, limit = 12 } = req.body

    const catalog = await Clothing.find({ isActive: true }).lean()
    const ranked = catalog
      .map((item) => ({ ...item, score: scoreItem(item, { undertone, personality, occasion }) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, +limit)

    res.json({ items: ranked, palette: getPalette(undertone) })
  } catch (err) {
    next(err)
  }
})

// GET /api/recommendations/palette/:undertone — colour palette only
router.get('/palette/:undertone', (req, res) => {
  const palette = getPalette(req.params.undertone)
  if (!palette) return res.status(404).json({ error: 'Unknown undertone' })
  res.json(palette)
})

module.exports = router
