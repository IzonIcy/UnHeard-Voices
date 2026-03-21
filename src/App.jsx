import { useMemo, useRef, useState } from 'react'
import events from './data/events.json'
import HistographyVisualization from './components/HistographyVisualization'
import './styles/timeline.css'

const START_YEAR = 1700
const END_YEAR = 2026

const VIEW_OPTIONS = [
  {
    id: 'graph',
    name: 'Timeline',
    description: 'Trace events chronologically and inspect each story in context.'
  },
  {
    id: 'round',
    name: 'Constellation',
    description: 'Reveal thematic clusters and momentum shifts across eras.'
  }
]

const STORY_STOPS = [
  {
    id: 1,
    view: 'graph',
    yearRange: [1700, 1865],
    note: 'Early resistance and abolition writing set a foundation that mainstream timelines often minimize.'
  },
  {
    id: 11,
    view: 'graph',
    yearRange: [1900, 1968],
    note: 'Mid-century legal strategies and organizing networks reveal broad coalitions beyond familiar figures.'
  },
  {
    id: 16,
    view: 'round',
    yearRange: [1960, 1990],
    note: 'Intersectional frameworks emerge as movements connect race, gender, labor, and sovereignty.'
  },
  {
    id: 22,
    view: 'round',
    yearRange: [1990, END_YEAR],
    note: 'Current momentum highlights living struggles in language renewal, land rights, and community memory.'
  }
]

const NON_BACKGROUND_SELECTORS = [
  'button',
  'a',
  'input',
  'canvas',
  '.logo-container',
  '.home-story-panel',
  '.home-options',
  '.home-kicker',
  '.topbar',
  '.timeline-shell',
  '.event-detail-panel',
  '.time-slider-container',
  '.methodology-modal'
].join(', ')

function App() {
  const [viewMode, setViewMode] = useState('home')
  const [yearRange, setYearRange] = useState([START_YEAR, END_YEAR])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [storyStep, setStoryStep] = useState(null)
  const [showMethodology, setShowMethodology] = useState(false)
  const surpriseClickCountRef = useRef(0)
  const lastSurpriseClickAtRef = useRef(0)

  const eventsById = useMemo(() => {
    const lookup = new Map()
    events.forEach((event) => lookup.set(event.id, event))
    return lookup
  }, [])

  const openView = (nextView) => {
    setSelectedEvent(null)
    setStoryStep(null)
    setViewMode(nextView)
  }

  const handleYearChange = (nextRange) => {
    setYearRange(nextRange)
  }

  const openStoryStep = (index) => {
    const step = STORY_STOPS[index]
    if (!step) return

    setViewMode(step.view)
    setYearRange(step.yearRange)
    setSelectedEvent(eventsById.get(step.id) ?? null)
    setStoryStep(index)
  }

  const startStoryTour = () => {
    openStoryStep(0)
  }

  const nextStoryStep = () => {
    if (storyStep === null) {
      startStoryTour()
      return
    }

    const nextStep = Math.min(storyStep + 1, STORY_STOPS.length - 1)
    openStoryStep(nextStep)
  }

  const isStoryActive = storyStep !== null
  const isLastStoryStep = storyStep === STORY_STOPS.length - 1

  const SURPRISE_CLICK_WINDOW_MS = 1400

  const handleBackgroundSurpriseClick = (event) => {
    if (showMethodology) return

    const target = event.target
    if (!(target instanceof HTMLElement)) return

    if (target.closest(NON_BACKGROUND_SELECTORS)) {
      return
    }

    const now = Date.now()
    if (now - lastSurpriseClickAtRef.current > SURPRISE_CLICK_WINDOW_MS) {
      surpriseClickCountRef.current = 0
    }

    surpriseClickCountRef.current += 1
    lastSurpriseClickAtRef.current = now

    if (surpriseClickCountRef.current >= 3) {
      surpriseClickCountRef.current = 0
      lastSurpriseClickAtRef.current = 0
      startStoryTour()
    }
  }

  return (
    <div className="app">
      {viewMode === 'home' ? (
        <div id="home" className="screen" onClick={handleBackgroundSurpriseClick}>
          <div className="home-layout">
            <div className="logo-container">
              <p className="eyebrow">Counter-Archive</p>
              <h1>Unheard Voices</h1>
              <p>History often archives power. This project highlights people and movements that reshaped it.</p>

              <div className="hero-meta">
                <span>1700-2026</span>
                <span>{events.length} curated events</span>
                <span>6 focus categories</span>
              </div>

              <p className="home-footnote">
                Curation note: this is a selective educational dataset built for narrative exploration rather than
                exhaustive historical coverage.
              </p>
            </div>

            <aside className="home-story-panel" aria-label="Project context">
              <h2>Project Intent</h2>
              <p>
                Instead of repeating dominant historical summaries, this timeline foregrounds organizers, artists,
                legal challengers, and scientists whose influence is substantial but frequently underrepresented.
              </p>
              <ul>
                <li>Cross-movement organizing across race, labor, gender, and disability justice</li>
                <li>Indigenous sovereignty, resistance, and language revitalization</li>
                <li>Art, science, and journalism as engines of social change</li>
              </ul>
            </aside>
          </div>

          <p className="home-kicker">Choose a lens and explore the archive from two complementary perspectives.</p>

          <div className="home-options">
            {VIEW_OPTIONS.map((option) => (
              <button key={option.id} type="button" className="option" onClick={() => openView(option.id)}>
                <h3>{option.name}</h3>
                <p>{option.description}</p>
                <span className="option-cta">Explore</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="visualization-container" onClick={handleBackgroundSurpriseClick}>
          <div className="topbar">
            <button type="button" className="home-link" onClick={() => openView('home')}>
              Home
            </button>
            <div className="view-switch">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`view-pill ${viewMode === option.id ? 'active' : ''}`}
                  onClick={() => openView(option.id)}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <div className="topbar-actions">
              <button type="button" className="view-pill" onClick={() => setShowMethodology(true)}>
                Curation Method
              </button>
            </div>
          </div>

          <HistographyVisualization
            events={events}
            viewMode={viewMode}
            yearRange={yearRange}
            onYearChange={handleYearChange}
            onEventSelect={setSelectedEvent}
            selectedEvent={selectedEvent}
            minYear={START_YEAR}
            maxYear={END_YEAR}
          />

          {isStoryActive && (
            <button
              type="button"
              className="demo-next-btn"
              onClick={isLastStoryStep ? startStoryTour : nextStoryStep}
            >
              {isLastStoryStep ? 'Restart Tour' : 'Next Tour Stop'}
            </button>
          )}
        </div>
      )}

      {showMethodology && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Project methodology">
          <div className="methodology-modal">
            <button type="button" className="close-btn" onClick={() => setShowMethodology(false)}>
              ×
            </button>
            <h2>Curation Method</h2>
            <p>
              Unheard Voices is a curated educational timeline that foregrounds people and movements often compressed,
              omitted, or treated as footnotes in mainstream summaries.
            </p>
            <ul>
              <li>Events were selected for historical impact, underrepresentation, and cross-movement relevance.</li>
              <li>Categories are grouped into civil rights, labor, Indigenous, science, arts, and resistance.</li>
              <li>View modes are complementary: timeline for chronology, constellation for pattern recognition.</li>
              <li>Each event links to a public reference and can be extended with deeper citations.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
