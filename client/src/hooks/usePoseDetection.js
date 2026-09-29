import { useRef, useState, useCallback, useEffect } from 'react'

// Lazy-import TF.js and pose-detection so they don't block initial render
let tf  = null
let poseDetection = null

async function loadDeps() {
  if (!tf) {
    tf = await import('@tensorflow/tfjs')
    await tf.ready()
  }
  if (!poseDetection) {
    poseDetection = await import('@tensorflow-models/pose-detection')
  }
}

/**
 * usePoseDetection
 *
 * Manages a MediaPipe BlazePose detector.
 * Call `startDetection(videoEl, canvasEl)` to begin the animation loop.
 * `keypoints` is updated every frame with the 33 BlazePose landmarks.
 */
export function usePoseDetection({ showSkeleton = false } = {}) {
  const detectorRef   = useRef(null)
  const rafRef        = useRef(null)
  const canvasRef     = useRef(null)

  const [keypoints,  setKeypoints]  = useState(null)
  const [isLoading,  setIsLoading]  = useState(false)
  const [isRunning,  setIsRunning]  = useState(false)
  const [error,      setError]      = useState(null)
  const [fps,        setFps]        = useState(0)

  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() })

  const loadDetector = useCallback(async () => {
    if (detectorRef.current) return
    setIsLoading(true)
    setError(null)

    try {
      await loadDeps()
      detectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        {
          runtime:           'mediapipe',
          solutionPath:      'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
          modelType:         'lite',
          enableSmoothing:   true,
          enableSegmentation: false,
        }
      )
    } catch (err) {
      // Fallback to TF.js runtime if mediapipe CDN fails (offline / CSP)
      try {
        await import('@tensorflow/tfjs-backend-webgl')
        detectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          { runtime: 'tfjs', modelType: 'lite', enableSmoothing: true }
        )
      } catch (fallbackErr) {
        setError('Pose detection unavailable: ' + fallbackErr.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startDetection = useCallback(async (videoEl, overlayCanvasEl, clothingItem, renderFn) => {
    if (!videoEl || videoEl.readyState < 2) return
    await loadDetector()
    if (!detectorRef.current) return

    canvasRef.current = overlayCanvasEl
    setIsRunning(true)

    const loop = async () => {
      if (!detectorRef.current) return

      try {
        const poses = await detectorRef.current.estimatePoses(videoEl, { flipHorizontal: false })

        if (poses.length > 0) {
          const kps = poses[0].keypoints
          setKeypoints(kps)

          // Render clothing overlay
          if (overlayCanvasEl && clothingItem && renderFn) {
            const ctx = overlayCanvasEl.getContext('2d')
            ctx.clearRect(0, 0, overlayCanvasEl.width, overlayCanvasEl.height)
            renderFn(ctx, kps)
          }
        }

        // FPS tracking
        const fc = fpsCounterRef.current
        fc.frames++
        const now = performance.now()
        if (now - fc.lastTime >= 1000) {
          setFps(fc.frames)
          fc.frames = 0
          fc.lastTime = now
        }
      } catch {
        // Silently swallow transient frame errors
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [loadDetector])

  const stopDetection = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setIsRunning(false)
    setKeypoints(null)
  }, [])

  useEffect(() => () => stopDetection(), [stopDetection])

  return {
    keypoints,
    isLoading,
    isRunning,
    error,
    fps,
    loadDetector,
    startDetection,
    stopDetection,
  }
}
