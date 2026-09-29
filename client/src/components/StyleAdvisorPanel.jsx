import React, { useState } from 'react'
import { Sparkles, RefreshCw, ChevronRight, User, Palette, TrendingUp } from 'lucide-react'
import { useWardrobe } from '../context/WardrobeContext'
import ColorPalette from './ColorPalette'
import ClothingCard from './ClothingCard'
import { SKIN_TONE_OPTIONS } from '../utils/skinToneAnalysis'
import { getStyleGuide, getRankedRecommendations, PERSONALITY_STYLES, BODY_TYPES } from '../utils/styleRecommendations'
import { clothing } from '../data/mockClothing'

const TABS = [
  { id: 'palette',   label: 'Color Palette', Icon: Palette },
  { id: 'recs',      label: 'Recommendations', Icon: TrendingUp },
  { id: 'body',      label: 'Body Type', Icon: User },
]

export default function StyleAdvisorPanel() {
  const { skinTone, setSkinTone, styleProfile } = useWardrobe()
  const [activeTab, setActiveTab] = useState('palette')
  const [bodyType,  setBodyType]  = useState(null)
  const [occasion,  setOccasion]  = useState('all')

  const styleGuide = getStyleGuide(skinTone?.undertone)

  const recommendations = getRankedRecommendations(clothing, {
    undertone:   skinTone?.undertone,
    personality: styleProfile?.personality,
    bodyType,
    occasion,
  }, 8)

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Skin Tone Selector */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-brand-400" />
          <h3 className="text-white font-semibold">Your Skin Tone</h3>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Select the shade closest to your skin tone for accurate color recommendations.
        </p>
        <div className="flex flex-wrap gap-3">
          {SKIN_TONE_OPTIONS.map((tone) => (
            <button
              key={tone.key}
              onClick={() => setSkinTone(tone)}
              className={`group flex flex-col items-center gap-1.5 transition-all ${
                skinTone?.key === tone.key ? 'scale-110' : 'hover:scale-105'
              }`}
              title={`${tone.label} — ${tone.undertone} undertone`}
            >
              <div
                className={`w-9 h-9 rounded-full border-2 transition-all ${
                  skinTone?.key === tone.key
                    ? 'border-brand-400 shadow-lg shadow-brand-900/40'
                    : 'border-transparent group-hover:border-white/30'
                }`}
                style={{ backgroundColor: tone.hex }}
              />
              <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">{tone.label}</span>
            </button>
          ))}
        </div>
        {skinTone && (
          <div className="mt-4 pt-4 border-t border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: skinTone.hex }} />
              <span className="text-white font-medium">{skinTone.label}</span>
              <span className="text-gray-500">·</span>
              <span className="text-brand-400 capitalize">{skinTone.undertone} undertone</span>
            </div>
            <button
              onClick={() => setSkinTone(null)}
              className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1"
            >
              <RefreshCw size={10} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Personality result */}
      {styleProfile?.personality && (
        <div className="glass-card p-4 border-brand-600/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Your Style Personality</p>
              <p className="text-white font-bold text-lg">
                {PERSONALITY_STYLES[styleProfile.personality]?.icon}{' '}
                {PERSONALITY_STYLES[styleProfile.personality]?.label}
              </p>
              <p className="text-gray-400 text-sm mt-0.5">
                {PERSONALITY_STYLES[styleProfile.personality]?.description}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center text-2xl">
              {PERSONALITY_STYLES[styleProfile.personality]?.icon}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {skinTone && (
        <div>
          <div className="flex gap-1 glass-card p-1 mb-4">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === id
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'palette' && styleGuide && (
            <div className="glass-card p-5">
              <ColorPalette
                undertone={skinTone.undertone}
                hues={styleGuide.hues}
                best={styleGuide.best}
                avoid={styleGuide.avoid}
              />
              {styleGuide.tip && (
                <div className="mt-4 p-3 rounded-xl bg-brand-600/10 border border-brand-600/20">
                  <p className="text-brand-300 text-xs leading-relaxed">
                    <span className="font-semibold">Style Tip: </span>
                    {styleGuide.tip}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recs' && (
            <div className="space-y-4">
              {/* Occasion filter */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['all', 'casual', 'formal', 'party', 'sport', 'ethnic'].map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                      occasion === occ
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-hover text-gray-400 hover:text-white'
                    }`}
                  >
                    {occ.charAt(0).toUpperCase() + occ.slice(1)}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.map((item) => (
                  <div key={item.id} className="relative">
                    <ClothingCard item={item} compact />
                    <div className="absolute top-2 left-2 badge bg-brand-600/80 text-white text-[9px]">
                      {item.score}% match
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'body' && (
            <div className="glass-card p-5 space-y-4">
              <p className="text-xs text-gray-500">Select your body shape for tailored silhouette recommendations.</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(BODY_TYPES).map(([key, bt]) => (
                  <button
                    key={key}
                    onClick={() => setBodyType(key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      bodyType === key
                        ? 'bg-brand-600/20 border-brand-500'
                        : 'bg-surface-hover border-surface-border hover:border-brand-600/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{bt.icon}</div>
                    <p className="text-white font-medium text-xs">{bt.label}</p>
                  </button>
                ))}
              </div>
              {bodyType && BODY_TYPES[bodyType] && (
                <div className="pt-4 border-t border-surface-border space-y-2">
                  <p className="text-white font-semibold text-sm">{BODY_TYPES[bodyType].label} Tips</p>
                  {BODY_TYPES[bodyType].tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-sm text-gray-400">
                      <ChevronRight size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!skinTone && (
        <div className="text-center py-6 text-gray-600 text-sm">
          Select your skin tone above to unlock personalised recommendations.
        </div>
      )}
    </div>
  )
}
