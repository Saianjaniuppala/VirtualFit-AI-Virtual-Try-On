const router   = require('express').Router()
const Clothing = require('../models/Clothing')

// GET /api/clothing — list with optional filters
// Query: category, color, occasion, search, page, limit
router.get('/', async (req, res, next) => {
  try {
    const { category, color, occasion, search, page = 1, limit = 50 } = req.query
    const query = { isActive: true }

    if (category && category !== 'all') query.category = category
    if (color && color !== 'all')       query.color = color
    if (occasion && occasion !== 'all') query.occasion = occasion
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ]

    const items = await Clothing.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 })

    const total = await Clothing.countDocuments(query)
    res.json({ items, total, page: +page })
  } catch (err) {
    next(err)
  }
})

// GET /api/clothing/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Clothing.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Clothing item not found' })
    res.json(item)
  } catch (err) {
    next(err)
  }
})

// POST /api/clothing — add a new item
router.post('/', async (req, res, next) => {
  try {
    const item = await Clothing.create(req.body)
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

module.exports = router
