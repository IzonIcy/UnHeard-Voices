import { useEffect, useMemo, useState } from 'react'
import HistographyVisualization from './components/HistographyVisualization.jsx'
import eventsData from './data/events.json'

const VIEW_MODES = new Set(['timeline', 'constellation'])
const ALL_SEARCH_SCOPES = ['title', 'person', 'movement', 'place']

const toInteger = (value) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isNaN(parsed) ? null : parsed
}

const clampYear = (year, minYear, maxYear) => Math.max(minYear, Math.min(maxYear, year))

const parseCsvParam = (value) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const createInitialState = ({ minYear, maxYear, allCategories, eventIds }) => {
  if (typeof window === 'undefined') {
    return {
      viewMode: 'timeline',
      yearRange: [minYear, maxYear],
      selectedEventId: null,
      activeCategories: allCategories,
      searchQuery: '',
      searchScopes: ALL_SEARCH_SCOPES
    }
  }

  const params = new URLSearchParams(window.location.search)
  const requestedView = params.get('view')
  const viewMode = VIEW_MODES.has(requestedView) ? requestedView : 'timeline'

  const startFromUrl = toInteger(params.get('start'))
  const endFromUrl = toInteger(params.get('end'))
  const startYear = clampYear(startFromUrl ?? minYear, minYear, maxYear)
  const endYear = clampYear(endFromUrl ?? maxYear, minYear, maxYear)
  const yearRange = [Math.min(startYear, endYear), Math.max(startYear, endYear)]

  const requestedCategories = parseCsvParam(params.get('categories'))
  const validCategories = requestedCategories.filter((category) => allCategories.includes(category))
  const activeCategories = validCategories.length > 0 ? validCategories : allCategories

  const selectedId = toInteger(params.get('event'))
  const selectedEventId = selectedId !== null && eventIds.has(selectedId) ? selectedId : null

  const searchQuery = (params.get('q') ?? '').trim()
  const requestedScopes = parseCsvParam(params.get('scope'))
  const validScopes = requestedScopes.filter((scope) => ALL_SEARCH_SCOPES.includes(scope))
  const searchScopes = validScopes.length > 0 ? validScopes : ALL_SEARCH_SCOPES

  return {
    viewMode,
    yearRange,
    selectedEventId,
    activeCategories,
    searchQuery,
    searchScopes
  }
}

function App() {
  const minYear = useMemo(() => Math.min(...eventsData.map(e => e.date)), [])
  const maxYear = useMemo(() => Math.max(...eventsData.map(e => e.date)), [])
  const allCategories = useMemo(() => Array.from(new Set(eventsData.map((event) => event.category))), [])
  const eventIdSet = useMemo(() => new Set(eventsData.map((event) => event.id)), [])

  const initialState = useMemo(
    () => createInitialState({ minYear, maxYear, allCategories, eventIds: eventIdSet }),
    [allCategories, eventIdSet, maxYear, minYear]
  )

  const [viewMode, setViewMode] = useState(initialState.viewMode)
  const [yearRange, setYearRange] = useState(initialState.yearRange)
  const [selectedEventId, setSelectedEventId] = useState(initialState.selectedEventId)
  const [activeCategories, setActiveCategories] = useState(initialState.activeCategories)
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery)
  const [searchScopes, setSearchScopes] = useState(initialState.searchScopes)

  useEffect(() => {
    const params = new URLSearchParams()
    const [startYear, endYear] = yearRange
    const normalizedSearchQuery = searchQuery.trim()

    if (viewMode !== 'timeline') {
      params.set('view', viewMode)
    }

    if (startYear !== minYear) {
      params.set('start', String(startYear))
    }

    if (endYear !== maxYear) {
      params.set('end', String(endYear))
    }

    if (activeCategories.length > 0 && activeCategories.length !== allCategories.length) {
      params.set('categories', activeCategories.join(','))
    }

    if (normalizedSearchQuery.length > 0) {
      params.set('q', normalizedSearchQuery)
    }

    if (searchScopes.length > 0 && searchScopes.length !== ALL_SEARCH_SCOPES.length) {
      params.set('scope', searchScopes.join(','))
    }

    if (selectedEventId !== null && eventIdSet.has(selectedEventId)) {
      params.set('event', String(selectedEventId))
    }

    const nextQuery = params.toString()
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`
    window.history.replaceState(null, '', nextUrl)
  }, [
    activeCategories,
    allCategories.length,
    eventIdSet,
    maxYear,
    minYear,
    searchQuery,
    searchScopes,
    selectedEventId,
    viewMode,
    yearRange
  ])

  const selectedEvent = useMemo(
    () => eventsData.find((event) => event.id === selectedEventId) ?? null,
    [selectedEventId]
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>Unheard Voices</h1>
        <p>Exploring unrepresented histories from 1700-2026</p>
        <div className="view-mode-toggle">
          <button 
            className={viewMode === 'timeline' ? 'active' : ''}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </button>
          <button 
            className={viewMode === 'constellation' ? 'active' : ''}
            onClick={() => setViewMode('constellation')}
          >
            Constellation
          </button>
        </div>
      </header>
      
      <main>
        <HistographyVisualization
          events={eventsData}
          viewMode={viewMode}
          yearRange={yearRange}
          onYearChange={setYearRange}
          onEventSelect={(event) => setSelectedEventId(event?.id ?? null)}
          selectedEvent={selectedEvent}
          minYear={minYear}
          maxYear={maxYear}
          activeCategories={activeCategories}
          onActiveCategoriesChange={setActiveCategories}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchScopes={searchScopes}
          onSearchScopesChange={setSearchScopes}
        />
      </main>
    </div>
  )
}

export default App
