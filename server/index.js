require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
const morgan   = require('morgan')
const helmet   = require('helmet')

const clothingRoutes       = require('./routes/clothing')
const recommendationRoutes = require('./routes/recommendations')
const userRoutes           = require('./routes/user')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_ORIGIN : '*' }))
app.use(morgan('dev'))
app.use(express.json({ limit: '2mb' }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/clothing',       clothingRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/users',          userRoutes)
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// ── Error handler ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

// ── DB + listen ───────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/virtualfit')
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(🚀 Server running on http://localhost:${PORT}))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
