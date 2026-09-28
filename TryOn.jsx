import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { sendEvent } from '../lib/api';

const ema = (prev, next, a = 0.35) => (prev == null ? next : prev + a * (next - prev)); // jitter smoothing

export default function TryOn({ userId, garment, onLiked }) {
  const video = useRef(); const canvas = useRef();
  const img = useRef(new Image());
  const started = useRef(Date.now());
  const [ready, setReady] = useState(false);

  useEffect(() => { img.current.src = garment.image; }, [garment]);

  // Every garment swap becomes a memory. Dwell time is an implicit preference signal.
  useEffect(() => {
    started.current = Date.now();
    return () => {
      const s = (Date.now() - started.current) / 1000;
      if (s > 2) sendEvent(userId, s < 6 ? 'skipped' : 'tried', garment, s);
    };
  }, [garment, userId]);

  useEffect(() => {
    let raf, landmarker, stream; const sm = {};
    (async () => {
      const fileset = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm');
      landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO', numPoses: 1,
      });
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 960, height: 720, facingMode: 'user' } });
      video.current.srcObject = stream; await video.current.play(); setReady(true);

      const ctx = canvas.current.getContext('2d');
      const loop = () => {
        const v = video.current; canvas.current.width = v.videoWidth; canvas.current.height = v.videoHeight;
        ctx.save(); ctx.scale(-1, 1); ctx.drawImage(v, -v.videoWidth, 0); ctx.restore(); // mirror view
        const p = landmarker.detectForVideo(v, performance.now()).landmarks?.[0];
        if (p) {
          const W = v.videoWidth, H = v.videoHeight;
          const pt = (i) => ({ x: (1 - p[i].x) * W, y: p[i].y * H });
          const [ls, rs, lh, rh] = [11, 12, 23, 24].map(pt); // shoulders + hips (BlazePose indices)
          const cx = (ls.x + rs.x + lh.x + rh.x) / 4, cy = (ls.y + rs.y + lh.y + rh.y) / 4;
          const shoulderW = Math.hypot(ls.x - rs.x, ls.y - rs.y);
          const torsoH = Math.hypot((ls.x + rs.x) / 2 - (lh.x + rh.x) / 2, (ls.y + rs.y) / 2 - (lh.y + rh.y) / 2);
          const angle = Math.atan2(rs.y - ls.y, rs.x - ls.x);
          sm.cx = ema(sm.cx, cx); sm.cy = ema(sm.cy, cy);
          sm.w = ema(sm.w, shoulderW * (garment.widthRatio ?? 1.9));
          sm.h = ema(sm.h, torsoH * (garment.heightRatio ?? 1.35));
          sm.a = ema(sm.a, angle);
          ctx.save(); ctx.translate(sm.cx, sm.cy - sm.h * 0.05); ctx.rotate(sm.a);
          ctx.globalAlpha = 0.96; ctx.drawImage(img.current, -sm.w / 2, -sm.h / 2, sm.w, sm.h); ctx.restore();
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })().catch(console.error);
    return () => { cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); landmarker?.close(); };
  }, []); // pose loop starts once; garment changes are read via the img ref + props on next frame

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black">
      <video ref={video} className="hidden" playsInline muted />
      <canvas ref={canvas} className="w-full" />
      {!ready && <div className="absolute inset-0 grid place-items-center text-white/80">Loading pose model…</div>}
      <button onClick={() => { sendEvent(userId, 'liked', garment); onLiked?.(garment); }}
        className="absolute bottom-4 right-4 px-5 py-2 rounded-full bg-white/90 font-semibold hover:scale-105 transition">
        ♥ Love it
      </button>
    </div>
  );
}
