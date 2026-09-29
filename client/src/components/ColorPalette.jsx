import React from 'react'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

function Swatch({ color, label }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(color).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="group flex flex-col items-center gap-1.5 cursor-pointer" onClick={copy} title={`Copy ${color}`}>
      <div
        className="w-10 h-10 rounded-xl shadow-md border border-white/10 transition-transform group-hover:scale-110 relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/30 flex items-center justify-center transition-opacity">
          {copied ? <Check size={12} className="text-white" /> : <Copy size={12} className="text-white" />}
        </div>
      </div>
      {label && <span className="text-[10px] text-gray-500 text-center max-w-[48px] leading-tight">{label}</span>}
    </div>
  )
}

export default function ColorPalette({ undertone, hues = [], best = [], avoid = [] }) {
  const undertoneLabels = {
    warm:    { badge: 'Warm Undertone', color: '#C8724A', desc: 'Golden, peachy, or yellow-based skin tones' },
    cool:    { badge: 'Cool Undertone', color: '#5B7AC8', desc: 'Pink, red, or bluish-based skin tones' },
    neutral: { badge: 'Neutral Undertone', color: '#9B8B7A', desc: 'Mix of warm and cool tones' },
  }

  const meta = undertoneLabels[undertone]

  return (
    <div className="space-y-5">
      {/* Undertone badge */}
      {meta && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/20" style={{ backgroundColor: meta.color }} />
          <div>
            <p className="text-white font-semibold text-sm">{meta.badge}</p>
            <p className="text-gray-500 text-xs">{meta.desc}</p>
          </div>
        </div>
      )}

      {/* Your palette */}
      {hues.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Signature Palette</p>
          <div className="flex flex-wrap gap-3">
            {hues.map((h, i) => (
              <Swatch key={i} color={h} />
            ))}
          </div>
        </div>
      )}

      {/* Best colors */}
      {best.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Best Colors for You</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {best.map((color) => (
              <span key={color} className="badge bg-green-500/10 text-green-400 border border-green-500/20 capitalize">
                {color}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Avoid */}
      {avoid.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colors to Avoid</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {avoid.map((color) => (
              <span key={color} className="badge bg-red-500/10 text-red-400 border border-red-500/20 capitalize">
                {color}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
