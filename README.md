# VirtualFit — AI Virtual Try-On (MERN)

Try clothes on virtually using your webcam. AI detects your body pose and overlays
the selected garment on you in real time, plus a style advisor that recommends
colours, patterns and silhouettes based on your skin tone, personality and body type.

## Tech Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React 18 + Vite, Tailwind CSS, React Router |
| AI / Vision| TensorFlow.js + MediaPipe *BlazePose* (33-point pose detection) |
| Try-on     | HTML5 Canvas overlay, getUserMedia webcam |
| State      | React Context + useReducer |
| Backend    | Node + Express, Mongoose / MongoDB |
| Auth       | JWT + bcrypt |

The **frontend runs standalone** using mock data in `client/src/data/mockClothing.js`,
so you can demo it with no server. The **backend is now fully implemented** — catalog,
recommendations, auth and per-user wardrobe endpoints, plus a seed script.


## Project Structure

```
virtual/
├── client/                       # React frontend (complete)
│   ├── src/
│   │   ├── components/           # Navbar, TryOnCanvas, ClothingGrid, ClothingCard,
│   │   │                         #   StyleAdvisorPanel, PersonalityQuiz, ColorPalette
│   │   ├── pages/                # Home, TryOn, StyleAdvisor, Wardrobe
│   │   ├── hooks/                # useCamera, usePoseDetection
│   │   ├── utils/                # clothingOverlay, skinToneAnalysis, styleRecommendations
│   │   ├── context/             # WardrobeContext (global state)
│   │   └── data/                # mockClothing catalog
│   └── ...
└── server/                       # Express API (complete)
    ├── models/                   # User, Clothing (Mongoose schemas)
    ├── routes/                   # clothing, recommendations, user
    ├── middleware/               # auth (JWT)
    ├── utils/                    # styleEngine (server-side scoring)
    ├── data/                     # catalog (seed source)
    ├── seed.js
└── index.js

## Getting Started

### Frontend (works right now)

```bash
cd client
npm install
npm run dev            # → http://localhost:3000

Grant camera permission, pick a clothing item, hit *Start Camera*. The pose model
(~10 MB) downloads on first run.

### Backend
``bash
cd server
npm install
cp .env.example .env   # set MONGODB_URI, JWT_SECRET
npm run seed           # populate the Clothing collection from data/catalog.js
npm run dev            # → http://localhost:5000
```

Needs a running MongoDB (local mongod or a MongoDB Atlas URI).
# How the Try-On Works

1. **useCamera** opens the webcam via getUserMedia.
2. **usePoseDetection** loads BlazePose and, each animation frame, estimates the
   33 body landmarks from the video.
3. **clothingOverlay.renderClothingOverlay** maps garment shapes onto the relevant
   landmarks (shoulders, hips, elbows, knees…) and draws them on a <canvas> layered
   over the mirrored video.
4. Category-aware drawing: tops track shoulders→hips, bottoms track hips→ankles,
   dresses combine both, ethnic wear (kurta/saree) reuse those.

## How the Style Advisor Works
- **skinToneAnalysis** converts sampled face pixels sRGB → CIE L\*a\*b\*, computes the
  ITA (Individual Typology Angle), and classifies undertone (warm / cool / neutral).
  Users can also pick their tone manually.
- **styleRecommendations** scores each catalog item against the user's undertone,
  personality (5-question quiz), body type and occasion, then ranks suggestions and
  builds a colour palette from colour ending is builds a colour palette from colour-theory rules.
