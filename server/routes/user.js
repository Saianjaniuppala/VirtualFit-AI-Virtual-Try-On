const router = require('express').Router()
const jwt    = require('jsonwebtoken')
const User   = require('../models/User')
const auth   = require('../middleware/auth')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  styleProfile: u.styleProfile,
  savedItems: u.savedItems,
  tryOnHistory: u.tryOnHistory,
})

// POST /api/users/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: 'Email already registered' })

    const user = await User.create({ name, email, password })
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

// POST /api/users/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' })

    res.json({ token: signToken(user._id), user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(publicUser(user))
  } catch (err) {
    next(err)
  }
})

// PATCH /api/users/me/style-profile
router.patch('/me/style-profile', auth, async (req, res, next) => {
  try {
    const { skinTone, undertone, bodyType, personality } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { styleProfile: { skinTone, undertone, bodyType, personality } },
      { new: true, runValidators: true }
    )
    res.json(publicUser(user))
  } catch (err) {
    next(err)
  }
})

// PATCH /api/users/me/wardrobe — toggle a saved item
// Body: { itemId, action: 'save' | 'remove' }
router.patch('/me/wardrobe', auth, async (req, res, next) => {
  try {
    const { itemId, action } = req.body
    const update =
      action === 'remove'
        ? { $pull: { savedItems: itemId } }
        : { $addToSet: { savedItems: itemId } }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true })
    res.json(publicUser(user))
  } catch (err) {
    next(err)
  }
})

module.exports = router
