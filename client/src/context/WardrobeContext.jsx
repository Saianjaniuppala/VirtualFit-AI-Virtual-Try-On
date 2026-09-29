import React, { createContext, useContext, useReducer, useCallback } from 'react'

const WardrobeContext = createContext(null)

const initialState = {
  selectedClothing: null,    // currently selected item for try-on
  savedItems: [],            // items user saved to their wardrobe
  skinTone: null,            // detected or selected skin tone
  styleProfile: null,        // result from personality quiz
  tryOnHistory: [],          // recently tried items
  filters: {
    category: 'all',
    color: 'all',
    occasion: 'all',
  },
}

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_CLOTHING':
      return {
        ...state,
        selectedClothing: action.payload,
        tryOnHistory: [
          action.payload,
          ...state.tryOnHistory.filter((i) => i.id !== action.payload.id).slice(0, 9),
        ],
      }

    case 'DESELECT_CLOTHING':
      return { ...state, selectedClothing: null }

    case 'SAVE_TO_WARDROBE': {
      const alreadySaved = state.savedItems.some((i) => i.id === action.payload.id)
      return {
        ...state,
        savedItems: alreadySaved
          ? state.savedItems.filter((i) => i.id !== action.payload.id)
          : [...state.savedItems, action.payload],
      }
    }

    case 'REMOVE_FROM_WARDROBE':
      return {
        ...state,
        savedItems: state.savedItems.filter((i) => i.id !== action.payload),
      }

    case 'SET_SKIN_TONE':
      return { ...state, skinTone: action.payload }

    case 'SET_STYLE_PROFILE':
      return { ...state, styleProfile: action.payload }

    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } }

    case 'CLEAR_HISTORY':
      return { ...state, tryOnHistory: [] }

    default:
      return state
  }
}
export function WardrobeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const selectClothing  = useCallback((item) => dispatch({ type: 'SELECT_CLOTHING', payload: item }), [])
  const deselectClothing = useCallback(() => dispatch({ type: 'DESELECT_CLOTHING' }), [])
  const toggleSave      = useCallback((item) => dispatch({ type: 'SAVE_TO_WARDROBE', payload: item }), [])
  const removeFromWardrobe = useCallback((id) => dispatch({ type: 'REMOVE_FROM_WARDROBE', payload: id }), [])
  const setSkinTone     = useCallback((tone) => dispatch({ type: 'SET_SKIN_TONE', payload: tone }), [])
  const setStyleProfile = useCallback((profile) => dispatch({ type: 'SET_STYLE_PROFILE', payload: profile }), [])
  const setFilter       = useCallback((filter) => dispatch({ type: 'SET_FILTER', payload: filter }), [])
  const clearHistory    = useCallback(() => dispatch({ type: 'CLEAR_HISTORY' }), [])

  const isSaved = useCallback(
    (id) => state.savedItems.some((i) => i.id === id),
    [state.savedItems]
  )

  return (
    <WardrobeContext.Provider
      value={{
        ...state,
        selectClothing,
        deselectClothing,
        toggleSave,
        removeFromWardrobe,
        setSkinTone,
        setStyleProfile,
        setFilter,
        clearHistory,
        isSaved,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  )
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext)
  if (!ctx) throw new Error('useWardrobe must be used within WardrobeProvider')
  return ctx
}
