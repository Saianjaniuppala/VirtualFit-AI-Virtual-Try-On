import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Camera, CameraOff, RefreshCw, Eye, EyeOff, Zap, Cpu, AlertCircle } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'
import { usePoseDetection } from '../hooks/usePoseDetection'
import { renderClothingOverlay, drawPoseSkeleton } from '../utils/clothingOverlay'
import { useWardrobe } from '../context/WardrobeContext'

export default function TryOnCanvas() {
  const { selectedClothing } = useWardrobe()

  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const {
    videoRef,
    isReady: cameraReady,
    isLoading: cameraLoading,
    error: cameraError,
    dimensions,
    startCamera,
    stopCamera,
  } = useCamera()

  const {
    keypoints,
    isLoading: poseLoading,
    isRunning: poseRunning,
    error: poseError,
    fps,
    startDetection,
    stopDetection,
  } = usePoseDetection()

  // Sync canvas size to video
  useEffect(() => {
    if (!canvasRef.current || !dimensions) return
    canvasRef.current.width  = dimensions.width
    canvasRef.current.height = dimensions.height
  }, [dimensions])

  // Start pose detection when camera is ready
  useEffect(() => {
    if (!cameraReady || !isActive) return

    const renderFn = (ctx, kps) => {
      if (selectedClothing) {
        renderClothingOverlay(ctx, kps, selectedClothing, dimensions.width, dimensions.height)
      }
      if (showSkeleton) {
        drawPoseSkeleton(ctx, kps)
      }
    }

    startDetection(videoRef.current, canvasRef.current, selectedClothing, renderFn)
    return () => stopDetection()
  }, [cameraReady, isActive, selectedClothing, showSkeleton, dimensions, startDetection, stopDetection, videoRef])

  // Re-run render when clothing or skeleton toggle changes
  useEffect(() => {
    if (!poseRunning || !canvasRef.current || !keypoints) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    if (selectedClothing) {
      renderClothingOverlay(ctx, keypoints, selectedClothing, dimensions.width, dimensions.height)
    }
    if (showSkeleton) {
      drawPoseSkeleton(ctx, keypoints)
    }
  }, [selectedClothing, showSkeleton, keypoints, poseRunning, dimensions])

  const handleToggleCamera = useCallback(async () => {
    if (isActive) {
      stopDetection()
      stopCamera()
      setIsActive(false)
    } else {
      setIsActive(true)
      await startCamera()
    }
  }, [isActive, startCamera, stopCamera, stopDetection])

  const error = cameraError || poseError
  const loading = cameraLoading || poseLoading

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Canvas / Camera View */}
      <div
        ref={wrapperRef}
        className="relative flex-1 rounded-2xl overflow-hidden bg-surface-card border border-surface-border min-h-0"
        style={{ aspectRatio: '4/3', minHeight: 300 }}
      >
        {/* Video element (hidden behind canvas) */}
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${isActive ? '' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Canvas for clothing overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover ${isActive && cameraReady ? '' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Idle / loading placeholder */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-card">
            <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center">
              <Camera size={32} className="text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Start Your Camera</p>
              <p className="text-gray-500 text-sm mt-1">
                {selectedClothing
                  ? `Ready to try on "${selectedClothing.name}"`
                  : 'Select a clothing item and start your camera'}
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isActive && loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-card/80 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
            <p className="text-white text-sm">
              {cameraLoading ? 'Starting camera…' : 'Loading AI model…'}
            </p>
            <p className="text-gray-500 text-xs px-6 text-center">
              {poseLoading && 'Downloading pose detection model (~10 MB on first run)'}
            </p>
          </div>
        )}

        {/* Scan line animation when active */}
        {isActive && cameraReady && !loading && (
          <div className="scan-line" />
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-surface-card/90">
            <div className="glass-card p-4 flex gap-3 max-w-xs">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium text-sm">Error</p>
                <p className="text-gray-400 text-xs mt-1">{error}</p>
                <button onClick={handleToggleCamera} className="mt-3 btn-primary text-xs py-1.5 px-3">
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected clothing info badge */}
        {isActive && selectedClothing && cameraReady && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="glass-card px-3 py-1.5 flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedClothing.overlayColor }} />
              <span className="text-white font-medium">{selectedClothing.name}</span>
            </div>
            {fps > 0 && (
              <div className="glass-card px-2 py-1 text-[10px] text-gray-400 flex items-center gap-1">
                <Zap size={10} />
                {fps} FPS
              </div>
            )}
          </div>
        )}

        {/* No clothing selected hint */}
        {isActive && !selectedClothing && cameraReady && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="glass-card px-3 py-2 text-xs text-gray-400 text-center">
              ← Select a clothing item to start the virtual try-on
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleCamera}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
            isActive
              ? 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30'
              : 'btn-primary'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : isActive ? (
            <><CameraOff size={15} /> Stop Camera</>
          ) : (
            <><Camera size={15} /> Start Camera</>
          )}
        </button>

        <button
          onClick={() => setShowSkeleton((p) => !p)}
          className={`p-2.5 rounded-xl border transition-all ${
            showSkeleton
              ? 'bg-brand-600/20 text-brand-400 border-brand-600/30'
              : 'bg-surface-hover text-gray-400 border-surface-border hover:text-white'
          }`}
          title="Toggle skeleton overlay"
        >
          {showSkeleton ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>

        <div className="p-2.5 rounded-xl bg-surface-hover border border-surface-border text-gray-500" title="AI pose detection active">
          <Cpu size={16} className={poseRunning ? 'text-brand-400 animate-pulse-slow' : ''} />
        </div>
      </div>

      {/* Permissions note */}
      {!isActive && !error && (
        <p className="text-center text-xs text-gray-600">
          Camera permission required. Video is processed locally — nothing is sent to a server.
        </p>
      )}
    </div>
  )
}
