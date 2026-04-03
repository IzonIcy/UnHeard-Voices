import { useState, useMemo } from 'react'
import HistographyVisualization from './components/HistographyVisualization.jsx'
import eventsData from './data/events.json'

function App() {
  const [viewMode, setViewMode] = useState('timeline')
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  const minYear = useMemo(() => Math.min(...eventsData.map(e => e.date)), [])
  const maxYear = useMemo(() => Math.max(...eventsData.map(e => e.date)), [])
  
  const [yearRange, setYearRange] = useState([minYear, maxYear])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Unheard Voices</h1>
        <p>Exploring underrepresented histories from 1700-2026</p>
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
          onEventSelect={setSelectedEvent}
          selectedEvent={selectedEvent}
          minYear={minYear}
          maxYear={maxYear}
        />
      </main>
    </div>
  )
}

export default App
