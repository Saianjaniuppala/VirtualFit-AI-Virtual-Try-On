import React from 'react'
import { Link } from 'react-router-dom'
import { Camera, Wand2, ShoppingBag, ChevronRight, Zap, Shield, Cpu, Star } from 'lucide-react'

const FEATURES = [
  {
    Icon: Camera,
    title: 'Live Virtual Try-On',
    description: 'Use your webcam to see clothes fitted to your body in real time, powered by AI pose detection.',
    color: 'from-blue-500 to-cyan-500',
    link: '/try-on',
  },
  {
    Icon: Wand2,
    title: 'AI Style Advisor',
    description: 'Get personalised colour palettes, outfit suggestions, and body-type guidance based on your unique features.',
    color: 'from-purple-500 to-pink-500',
    link: '/style-advisor',
  },
  {
    Icon: ShoppingBag,
    title: 'Virtual Wardrobe',
    description: 'Save your favourite looks, build outfits, and review everything you have tried on—all in one place.',
    color: 'from-orange-500 to-amber-500',
    link: '/wardrobe',
  },
]

const STATS = [
  { value: '500+', label: 'Clothing Items' },
  { value: '33',   label: 'Body Keypoints Tracked' },
  { value: '30',   label: 'FPS Real-time AI' },
  { value: '8',    label: 'Style Personalities' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Grant Camera Access', body: 'Allow your browser to access your webcam. Everything is processed locally.' },
  { step: '02', title: 'Pick an Item',        body: 'Browse our catalog and click any item. It\'ll be pinned for try-on.' },
  { step: '03', title: 'See It On You',       body: 'Our AI detects your body pose and renders the garment fitted to you.' },
  { step: '04', title: 'Get Suggestions',     body: 'Visit the Style Advisor for colour and silhouette recommendations.' },
]

const TRUST = [
  { Icon: Shield, text: 'Camera runs locally — zero frames are sent to any server' },
  { Icon: Cpu,    text: 'TensorFlow.js + MediaPipe BlazePose runs entirely in-browser' },
  { Icon: Zap,    text: '30 FPS real-time overlay at Full HD' },
]

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6">
        <div className="badge bg-brand-600/20 text-brand-300 border border-brand-600/30 px-4 py-1.5 text-xs uppercase tracking-widest">
          AI-Powered Virtual Try-On
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-3xl">
          Try Clothes On —<br />
          <span className="text-gradient">Before You Buy</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
          Point your camera, pick an outfit, and watch it appear on you in real time.
          No fitting room, no hassle — just instant, AI-fitted fashion.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/try-on" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
            <Camera size={18} /> Start Try-On
          </Link>
          <Link to="/style-advisor" className="btn-secondary flex items-center gap-2 text-base px-8 py-3">
            <Wand2 size={18} /> Get Style Advice
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(({ value, label }) => (
          <div key={label} className="glass-card p-5 text-center glow-brand">
            <p className="text-3xl font-extrabold text-gradient">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle mt-2">Three AI-powered tools in one seamless experience</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, description, color, link }) => (
            <Link
              key={title}
              to={link}
              className="glass-card p-6 flex flex-col gap-4 group hover:border-brand-600/40 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{title}</h3>
                <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">{description}</p>
              </div>
              <div className="flex items-center gap-1 text-brand-400 text-sm font-medium mt-auto">
                Explore <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle mt-2">From camera to styled in under 30 seconds</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map(({ step, title, body }, i) => (
            <div key={step} className="glass-card p-5 relative overflow-hidden">
              <div className="absolute -top-3 -right-3 text-7xl font-black text-surface-hover select-none">
                {step}
              </div>
              <div className="relative">
                <p className="text-brand-400 font-bold text-xs uppercase tracking-wider mb-2">Step {i + 1}</p>
                <p className="text-white font-semibold">{title}</p>
                <p className="text-gray-400 text-sm mt-1.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="glass-card p-8">
        <div className="text-center mb-6">
          <h2 className="section-title">Privacy-First Design</h2>
          <p className="section-subtitle">Your camera feed never leaves your device</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {TRUST.map(({ Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-green-400" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-10">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Shopping?</h2>
        <p className="text-gray-400 mb-8">Join the future of fashion — try before you buy.</p>
        <Link to="/try-on" className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2">
          <Camera size={18} /> Launch Virtual Try-On
        </Link>
      </section>
    </div>
  )
}
