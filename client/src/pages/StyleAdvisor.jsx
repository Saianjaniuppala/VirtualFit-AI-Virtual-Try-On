import React, { useState } from 'react'
import { Sparkles, Wand2, RotateCcw } from 'lucide-react'
import PersonalityQuiz from '../components/PersonalityQuiz'
import StyleAdvisorPanel from '../components/StyleAdvisorPanel'
import { useWardrobe } from '../context/WardrobeContext'
import { PERSONALITY_STYLES } from '../utils/styleRecommendations'

export default function StyleAdvisor() {
  const { styleProfile, setStyleProfile } = useWardrobe()
  const [quizDone, setQuizDone] = useState(!!styleProfile)

  const handleQuizComplete = (personality) => {
    setQuizDone(true)
  }

  const resetQuiz = () => {
    setStyleProfile(null)
    setQuizDone(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-700 flex items-center justify-center">
            <Wand2 size={16} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Style Advisor</h1>
        </div>
        <p className="text-gray-400 max-w-xl">
          Discover your style personality, get a personalised colour palette, and find clothes that complement your unique features.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,1.5fr] gap-8 items-start">
        {/* Left: Quiz or result */}
        <div className="space-y-6">
          {!quizDone ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-brand-400" />
                <h2 className="text-white font-semibold">Discover Your Style</h2>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                Answer 5 quick questions to unlock a personalised fashion profile tailored to your personality.
              </p>
              <PersonalityQuiz onComplete={handleQuizComplete} />
            </div>
          ) : (
            <div className="space-y-5 animate-slide-up">
              {/* Personality result card */}
              {styleProfile?.personality && (
                <div className="glass-card p-6 border-brand-600/30 glow-brand">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Your Style Personality</p>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{PERSONALITY_STYLES[styleProfile.personality]?.icon}</span>
                        <div>
                          <p className="text-white font-bold text-2xl">
                            {PERSONALITY_STYLES[styleProfile.personality]?.label}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {PERSONALITY_STYLES[styleProfile.personality]?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="text-gray-600 hover:text-gray-400 transition-colors"
                      title="Retake quiz"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* All personality types */}
              <div className="glass-card p-4">
                <p className="text-xs text-gray-500 mb-3 font-medium">All Style Types</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PERSONALITY_STYLES).map(([key, style]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        styleProfile?.personality === key
                          ? 'bg-brand-600/20 border-brand-500'
                          : 'bg-surface-hover border-surface-border opacity-60'
                      }`}
                    >
                      <span className="text-xl block mb-1">{style.icon}</span>
                      <p className="text-white text-xs font-semibold">{style.label}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5 leading-tight">{style.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {!styleProfile && (
                <button onClick={resetQuiz} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Sparkles size={14} /> Take the Quiz
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: advisor panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-white font-semibold">Personalised Recommendations</h2>
          </div>
          <StyleAdvisorPanel />
        </div>
      </div>
    </div>
  )
}
