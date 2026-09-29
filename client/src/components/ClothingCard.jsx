import React from 'react'
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react'
import { useWardrobe } from '../context/WardrobeContext'

export default function ClothingCard({ item, compact = false }) {
  const { selectClothing, selectedClothing, toggleSave, isSaved } = useWardrobe()

  const isSelected = selectedClothing?.id === item.id
  const saved = isSaved(item.id)

  return (
    <div
      className={`
        group relative glass-card overflow-hidden cursor-pointer
        transition-all duration-300
        ${isSelected
          ? 'ring-2 ring-brand-500 shadow-lg shadow-brand-900/40 scale-[1.02]'
          : 'hover:border-brand-600/40 hover:shadow-md hover:scale-[1.01]'
        }
      `}
      onClick={() => selectClothing(item)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ paddingTop: compact ? '100%' : '120%' }}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />

        {/* Color swatch fallback */}
        <div
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: item.overlayColor, display: 'none' }}
        >
          <span className="text-white/60 text-xs font-medium">
            {item.name}
          </span>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Try On badge */}
        {isSelected && (
          <div className="absolute top-2 left-2 flex items-center gap-1 badge bg-brand-600 text-white animate-fade-in">
            <Zap size={10} />
            Trying On
          </div>
        )}

        {/* Save button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleSave(item)
          }}
          className={`
            absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all
            ${saved
              ? 'bg-red-500/80 text-white'
              : 'bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-red-500/80'
            }
          `}
          aria-label={saved ? 'Remove from wardrobe' : 'Save to wardrobe'}
        >
          <Heart size={13} fill={saved ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Try on hover */}
        {!isSelected && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="badge bg-brand-600/90 text-white backdrop-blur-sm whitespace-nowrap text-[10px]">
              Click to Try On
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`p-3 ${compact ? 'p-2' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {item.name}
            </p>

            {!compact && (
              <p className="text-gray-500 text-xs mt-0.5">
                {item.brand}
              </p>
            )}
          </div>

          <p className="text-brand-400 font-semibold text-sm whitespace-nowrap">
            ₹{item.price.toLocaleString('en-IN')}
          </p>
        </div>

        {!compact && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={11} fill="currentColor" />
              <span className="text-xs text-gray-400">
                {item.rating} ({item.reviews})
              </span>
            </div>

            <div className="ml-auto flex gap-1">
              {item.occasion?.slice(0, 2).map((occ) => (
                <span
                  key={occ}
                  className="badge bg-surface-hover text-gray-400 text-[10px] px-2 py-0.5"
                >
                  {occ}
                </span>
              ))}
            </div>
          </div>
        )}

        {!compact && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              selectClothing(item)
            }}
            className={`
              mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all
              ${isSelected
                ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30'
                : 'bg-surface-hover hover:bg-brand-600/20 hover:text-brand-300 text-gray-300'
              }
            `}
          >
            <ShoppingCart size={13} />
            {isSelected ? 'Currently Trying' : 'Try On'}
          </button>
        )}
      </div>

      {/* Color dot */}
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: item.overlayColor }}
      />
    </div>
  )
}
