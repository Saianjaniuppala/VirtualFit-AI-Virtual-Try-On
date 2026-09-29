// Seed the Clothing collection: node seed.js
require('dotenv').config()
const mongoose = require('mongoose')
const Clothing = require('./models/Clothing')
const catalog  = require('./data/catalog')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  await Clothing.deleteMany({})
  const inserted = await Clothing.insertMany(catalog)
  console.log(Seeded ${inserted.length} clothing items.)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

