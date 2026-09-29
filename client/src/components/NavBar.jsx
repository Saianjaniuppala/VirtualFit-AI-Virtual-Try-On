import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Shirt, Wand2, ShoppingBag, Home, Menu, X, Sparkles } from 'lucide-react'
import { useWardrobe } from '../context/WardrobeContext'

const NAV_ITEMS = [
  { to: '/',              label: 'Home',          Icon: Home },
  { to: '/try-on',        label: 'Try On',        Icon: Shirt },
  { to: '/style-advisor', label: 'Style Advisor', Icon: Wand2 },
  { to: '/wardrobe',      label: 'My Wardrobe',   Icon: ShoppingBag },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { savedItems } = useWardrobe()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
? 'bg-brand-600/20 text-brand-300 border border-brand-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                  }`
                }
              >
                <Icon size={15} />
                {label}
                {to === '/wardrobe' && savedItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {savedItems.length > 9 ? '9+' : savedItems.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
{/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="md:hidden btn-ghost p-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-card animate-fade-in">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-brand-600/20 text-brand-300'
                    : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                  }`
                }
              >
                <Icon size={16} />
                {label}
                {to === '/wardrobe' && savedItems.length > 0 && (
                  <span className="ml-auto badge bg-brand-600 text-white">{savedItems.length}</span>
                )}
                </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
