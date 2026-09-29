import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'
import { useWardrobe } from '../context/WardrobeContext'
import { PERSONALITY_STYLES } from '../utils/styleRecommendations'

const QUESTIONS = [
  {
    id: 'vibe',
    question: 'Which word best describes your everyday vibe?',
    options: [
      { value: 'classic',    label: 'Polished & Timeless' },
      { value: 'minimalist', label: 'Clean & Effortless' },
      { value: 'bohemian',   label: 'Free & Creative' },
      { value: 'edgy',       label: 'Bold & Daring' },
    ],
  },
  {
    id: 'event',
    question: 'Your go-to outfit for a dinner party is:',
    options: [
      { value: 'classic',   label: 'Smart blazer + tailored trousers' },
      { value: 'romantic',  label: 'Flowy midi dress' },
      { value: 'glamorous', label: 'Statement bodycon dress' },
      { value: 'preppy',    label: 'Smart-casual button-down + chinos' },
    ],
  },
  {
    id: 'colour',
    question: 'Your wardrobe is mostly:',
    options: [
      { value: 'minimalist', label: 'Neutrals — black, white, grey, beige' },
      { value: 'classic',    label: 'Classic navy, camel, burgundy' },
      { value: 'bohemian',   label: 'Earthy, prints, and patterns' },
      { value: 'edgy',       label: 'Dark tones with occasional neons' },
    ],
  },
  {
    id: 'icon',
    question: 'Your style icon?',
    options: [
      { value: 'classic',    label: 'Audrey Hepburn / George Clooney' },
      { value: 'romantic',   label: 'Taylor Swift / Timothée Chalamet' },
      { value: 'glamorous',  label: 'Beyoncé / Harry Styles' },
      { value: 'athletic',   label: 'Serena Williams / LeBron James' },
    ],
  },
  {
    id: 'priority',
    question: 'When shopping, your top priority is:',
    options: [
      { value: 'minimalist', label: 'Versatility — works in many outfits' },
      { value: 'glamorous',  label: 'Impact — turns heads' },
      { value: 'athletic',   label: 'Comfort — can wear all day' },
      { value: 'preppy',     label: 'Quality — built to last' },
    ],
  },
]

export default function PersonalityQuiz({ onComplete }) {
  const [step,    setStep]    = useState(0)
  const [answers, setAnswers] = useState({})
  const { setStyleProfile }   = useWardrobe()

  const total    = QUESTIONS.length
  const question = QUESTIONS[step]
  const isLast   = step === total - 1

  const pick = (value) => {
    const next = { ...answers, [question.id]: value }
    setAnswers(next)

    if (isLast) {
      const result = resolvePersonality(next)
      setStyleProfile({ personality: result, answers: next })
      onComplete?.(result)
    } else {
      setStep((s) => s + 1)
    }
  }

  const progress = ((step) / total) * 100

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Question {step + 1} of {total}</span>
          <span>{Math.round(progress)}% done</span>
        </div>
        <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-white font-semibold text-lg leading-snug">{question.question}</h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt) => {
          const isChosen = answers[question.id] === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all
                ${isChosen
                  ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                  : 'bg-surface-hover border-surface-border text-gray-300 hover:border-brand-600/40 hover:text-white'
                }
              `}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                isChosen ? 'border-brand-500 bg-brand-500' : 'border-gray-600'
              }`}>
                {isChosen && <Check size={10} className="text-white" />}
              </div>
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Back */}
      {step > 0 && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={14} /> Previous question
        </button>
      )}
    </div>
  )
}

function resolvePersonality(answers) {
  const tally = {}
  Object.values(answers).forEach((v) => {
    tally[v] = (tally[v] || 0) + 1
  })
  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'classic'
}
