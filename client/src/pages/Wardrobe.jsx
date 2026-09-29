import React, { useState } from 'react'
import { ShoppingBag, Heart, Clock, Trash2, Shirt, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWardrobe } from '../context/WardrobeContext'
import ClothingCard from '../components/ClothingCard'

const TABS = [
  { id: 'saved',   label: 'Saved Items',    Icon: Heart },
  { id: 'history', label: 'Try-On History', Icon: Clock },
]

export default function Wardrobe() {
  const { savedItems, tryOnHistory, removeFromWardrobe, clearHistory } = useWardrobe()
  const [activeTab, setActiveTab] = useState('saved')

  const items = activeTab === 'saved' ? savedItems : tryOnHistory
  const isEmpty = items.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <ShoppingBag size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Wardrobe</h1>
            <p className="text-gray-500 text-sm">
              {savedItems.length} saved · {tryOnHistory.length} tried on
            </p>
          </div>
        </div>

        {activeTab === 'history' && tryOnHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} /> Clear History
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card p-1 w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-brand-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
            {id === 'saved' && savedItems.length > 0 && (
              <span className="badge bg-white/20 text-white px-1.5 py-0.5 text-[10px]">
                {savedItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isEmpty ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div>
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">
                Items you've hearted — click any to try it on again.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {savedItems.map((item) => (
                  <div key={item.id} className="relative group/card">
                    <ClothingCard item={item} />
                    <button
                      onClick={() => removeFromWardrobe(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white
                                 opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                      title="Remove"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">
                Your last {tryOnHistory.length} tried-on items — click to try again.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tryOnHistory.map((item, i) => (
                  <div key={`${item.id}-${i}`} className="relative">
                    <ClothingCard item={item} />
                    {i === 0 && (
                      <div className="absolute top-2 left-2 badge bg-brand-600 text-white text-[9px]">Latest</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Outfit ideas CTA */}
      {savedItems.length >= 2 && (
        <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-4 mt-6">
          <div className="flex -space-x-3">
            {savedItems.slice(0, 3).map((item, i) => (
              <div
                key={item.id}
                className="w-12 h-12 rounded-xl border-2 border-surface-card"
                style={{ backgroundColor: item.overlayColor, zIndex: 3 - i }}
              />
            ))}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white font-semibold">You have {savedItems.length} saved items!</p>
            <p className="text-gray-400 text-sm">Head to the Try-On room and mix & match your saved pieces.</p>
          </div>
          <Link to="/try-on" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Shirt size={14} /> Try Them On <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}

function EmptyState({ tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center">
        {tab === 'saved' ? (
          <Heart size={28} className="text-gray-500" />
        ) : (
          <Clock size={28} className="text-gray-500" />
        )}
      </div>
      <div>
        <p className="text-white font-semibold text-lg">
          {tab === 'saved' ? 'No saved items yet' : 'No try-on history yet'}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          {tab === 'saved'
            ? 'Heart items in the catalog to save them here.'
            : 'Try on clothes to see your history here.'}
        </p>
      </div>
      <Link to="/try-on" className="btn-primary flex items-center gap-2">
        <Shirt size={14} /> Go to Try-On
      </Link>
    </div>
  )
}
