import React, { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ClothingCard from './ClothingCard'
import { clothing, CATEGORIES, OCCASIONS, COLORS_FILTER, filterClothing } from '../data/mockClothing'
import { useWardrobe } from '../context/WardrobeContext'

export default function ClothingGrid({ compact = false, maxItems }) {
  const { filters, setFilter } = useWardrobe()
  const [search,      setSearch]      = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(
    () => filterClothing({ ...filters, search }),
    [filters, search]
  )

  const items = maxItems ? filtered.slice(0, maxItems) : filtered

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search clothes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((p) => !p)}
          className={`btn-secondary flex items-center gap-2 px-3 ${showFilters ? 'border-brand-500 text-brand-400' : ''}`}
        >
          <SlidersHorizontal size={14} />
          {!compact && <span className="text-sm">Filters</span>}
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter({ category: cat })}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
              ${filters.category === cat
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                : 'bg-surface-hover text-gray-400 hover:text-white hover:bg-surface-border'
              }
            `}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="glass-card p-4 animate-fade-in space-y-3">
          <FilterRow
            label="Occasion"
            options={OCCASIONS}
            value={filters.occasion}
            onChange={(v) => setFilter({ occasion: v })}
          />
          <FilterRow
            label="Color"
            options={COLORS_FILTER}
            value={filters.color}
            onChange={(v) => setFilter({ color: v })}
            colorDots
          />
          <button
            onClick={() => setFilter({ category: 'all', occasion: 'all', color: 'all' })}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-gray-500">
        {items.length} item{items.length !== 1 ? 's' : ''}
        {filters.category !== 'all' && ` in ${filters.category}`}
      </p>

      {/* Grid */}
      <div
        className={`
          grid gap-3 overflow-y-auto flex-1 pr-1
          ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3'}
        `}
        style={{ maxHeight: compact ? '100%' : undefined }}
      >
        {items.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <Search size={32} className="mb-3 opacity-40" />
            <p className="text-sm">No items found</p>
            <button onClick={() => { setSearch(''); setFilter({ category: 'all', color: 'all', occasion: 'all' }) }} className="mt-2 text-xs text-brand-400 hover:underline">
              Clear
            </button>
          </div>
        ) : (
          items.map((item) => (
            <ClothingCard key={item.id} item={item} compact={compact} />
          ))
        )}
      </div>
    </div>
  )
}

function FilterRow({ label, options, value, onChange, colorDots = false }) {
  const COLOR_MAP = {
    black: '#1a1a1a', white: '#f5f5f5', blue: '#1e40af', red: '#dc2626',
    green: '#16a34a', yellow: '#ca8a04', pink: '#db2777', neutral: '#a8956b',
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all
              ${value === opt
                ? 'bg-brand-600/30 text-brand-300 border border-brand-600/50'
                : 'bg-surface-hover text-gray-400 hover:text-white border border-transparent hover:border-surface-border'
              }
            `}
          >
            {colorDots && opt !== 'all' && (
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/20"
                style={{ backgroundColor: COLOR_MAP[opt] || '#666' }}
              />
            )}
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}
