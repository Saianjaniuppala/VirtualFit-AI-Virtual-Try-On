# VirtualFit: a try-on stylist that remembers you
Built for HackwithHyderabad 3.0 — "AI Agents That Learn Using Hindsight".

Most virtual try-on demos are stateless. VirtualFit's stylist learns from every outfit you try: dwell time,
quick skips and likes are retained as memories in [Hindsight](https://hindsight.vectorize.io). Each new session
recalls those memories to re-rank the catalog and reflects on them to explain your taste, so session 5 is
visibly smarter than session 1.

| Hindsight op | Where | Purpose |
|---|---|---|
| `retain` | `/event`, `/profile` | store try-ons, likes, skips, skin tone, body type |
| `recall` | `/recommend` | pull taste memories to re-rank the catalog |
| `reflect` | `/recommend` | generate the "here's what I've learned about you" card |

## Run
```bash
# 1. Hindsight (confirm image/env names in the official README)
docker run --rm -p 8888:8888 -p 9999:9999 -e HINDSIGHT_API_LLM_API_KEY=$KEY ghcr.io/vectorize-io/hindsight:latest
# 2. API (set "type": "module" in server/package.json)
cd server && npm i express cors dotenv @vectorize-io/hindsight-client && node index.js
# 3. Client
cd client && npm i @mediapipe/tasks-vision && npm run dev
```
