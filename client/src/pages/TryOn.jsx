import React, { useState } from 'react'
import TryOnCanvas from '../components/TryOnCanvas'
import ClothingGrid from '../components/ClothingGrid'
import { useWardrobe } from '../context/WardrobeContext'
import { X, Info, ChevronRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TryOn() {
  const { selectedClothing, deselectClothing, toggleSave, isSaved } = useWardrobe()
  const [infoDismissed, setInfoDismissed] = useState(false)
  const saved = selectedClothing ? isSaved(selectedClothing.id) : false

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Info banner */}
      {!infoDismissed && (
        <div className="mb-4 glass-card px-4 py-3 flex items-start gap-3 border-brand-600/20 animate-fade-in">
          <Info size={15} className="text-brand-400 flex-shrink-0 mt-0.5" />
          <p className="text-gray-400 text-sm flex-1">
            <span className="text-white font-medium">How to use: </span>
            Pick a clothing item from the right panel → click "Start Camera" → the AI will detect your pose and overlay the garment on you live.
          </p>
          <button onClick={() => setInfoDismissed(true)} className="text-gray-600 hover:text-white flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main layout: Try-On + Clothing panel */}
      <div className="grid lg:grid-cols-[1fr,380px] gap-6 items-start">
        {/* Left: camera + canvas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Virtual Try-On</h1>
              <p className="text-gray-500 text-sm">Live camera · AI pose detection · real-time overlay</p>
            </div>
            {selectedClothing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSave(selectedClothing)}
                  className={`p-2 rounded-xl border transition-all ${
                    saved
                      ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : 'bg-surface-hover border-surface-border text-gray-400 hover:text-red-400'
                  }`}
                  title={saved ? 'Remove from wardrobe' : 'Save to wardrobe'}
                >
                  <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={deselectClothing}
                  className="p-2 rounded-xl bg-surface-hover border border-surface-border text-gray-400 hover:text-white transition-all"
                  title="Deselect item"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <TryOnCanvas />

          {/* Selected item info */}
          {selectedClothing && (
            <div className="glass-card p-4 flex items-center gap-4 animate-fade-in">
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0"
                style={{ backgroundColor: selectedClothing.overlayColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{selectedClothing.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {selectedClothing.brand} · ₹{selectedClothing.price.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="badge bg-surface-hover text-gray-400 capitalize">{selectedClothing.category}</span>
                <span className="badge bg-surface-hover text-gray-400 capitalize">{selectedClothing.fitType}</span>
              </div>
            </div>
          )}

          {/* Style Advisor link */}
          <Link
            to="/style-advisor"
            className="glass-card p-4 flex items-center gap-3 group hover:border-brand-600/40 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-600/20 flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Not sure what suits you?</p>
              <p className="text-gray-500 text-xs">Get personalised colour and style recommendations →</p>
            </div>
            <ChevronRight size={16} className="text-gray-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Right: clothing catalog */}
        <div className="glass-card p-4 sticky top-20" style={{ maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-white font-semibold">Clothing Catalog</h2>
            <span className="badge bg-brand-600/20 text-brand-400 border border-brand-600/30 text-xs">
              12+ items
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ClothingGrid compact />
          </div>
        </div>
      </div>
    </div>
  )
}
