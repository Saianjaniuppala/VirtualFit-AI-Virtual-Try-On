import { useRef, useState, useCallback, useEffect } from 'react'

const VIDEO_CONSTRAINTS = {
  width:  { ideal: 640 },
  height: { ideal: 480 },
  facingMode: 'user',
  frameRate: { ideal: 30 },
}

export function useCamera() {
  const videoRef    = useRef(null)
  const streamRef   = useRef(null)
  const [isReady,   setIsReady]   = useState(false)
  const [error,     setError]     = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 })

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS, audio: false })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            .then(resolve)
              .catch(reject)
          }
          videoRef.current.onerror = reject
        })

        setDimensions({
          width:  videoRef.current.videoWidth  || 640,
          height: videoRef.current.videoHeight || 480,
        })
        setIsReady(true)
      }
    } catch (err) {
      setError(parseError(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsReady(false)
  }, [])
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !isReady) return null
    const canvas = document.createElement('canvas')
    canvas.width  = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    return canvas
  }, [isReady])

  useEffect(() => () => stopCamera(), [stopCamera])

  return {
    videoRef,
    isReady,
    isLoading,
    error,
    dimensions,
    startCamera,
    stopCamera,
    captureFrame,
  }
}
function parseError(err) {
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
    return 'Camera access denied. Please allow camera permission and try again.'
  if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError')
    return 'No camera device found. Please connect a webcam.'
  if (err.name === 'NotReadableError' || err.name === 'TrackStartError')
    return 'Camera is in use by another application.'
  return Camera error: ${err.message}
}
