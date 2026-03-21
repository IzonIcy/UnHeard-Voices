import { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/timeline.css'

const CATEGORY_COLORS = {
  civil_rights: '#d94841',
  labor: '#de7c2b',
  indigenous: '#2f7d32',
  science: '#1565c0',
  arts: '#8e5ea2',
  resistance: '#90a4ae'
}

const CATEGORY_GLOWS = {
  civil_rights: 'rgba(217, 72, 65, 0.2)',
  labor: 'rgba(222, 124, 43, 0.2)',
  indigenous: 'rgba(47, 125, 50, 0.2)',
  science: 'rgba(21, 101, 192, 0.2)',
  arts: 'rgba(142, 94, 162, 0.2)',
  resistance: 'rgba(55, 71, 79, 0.2)'
}

const FALLBACK_COLOR = '#0f766e'
const FALLBACK_GLOW = 'rgba(15, 118, 110, 0.2)'

const formatCategoryLabel = (category) =>
  category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const stableValue = (id, salt) => {
  const raw = Math.sin((id + 1) * (salt + 17) * 12.9898) * 43758.5453
  return raw - Math.floor(raw)
}

const decadeLabel = (year) => `${Math.floor(year / 10) * 10}s`

function HistographyVisualization({ events, viewMode, yearRange, onYearChange, onEventSelect, selectedEvent, minYear, maxYear }) {
  const [hoveredEventId, setHoveredEventId] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [activeCategories, setActiveCategories] = useState(() => Object.keys(CATEGORY_COLORS))

  const canvasRef = useRef(null)
  const pointMapRef = useRef({})

  const yearFilteredEvents = useMemo(() => {
    const [startYear, endYear] = yearRange
    return events
      .filter((event) => event.date >= startYear && event.date <= endYear)
      .sort((a, b) => a.date - b.date)
  }, [events, yearRange])

  const visibleEvents = useMemo(() => {
    const activeSet = new Set(activeCategories)
    return yearFilteredEvents.filter((event) => activeSet.has(event.category))
  }, [yearFilteredEvents, activeCategories])

  const stableLayout = useMemo(() => {
    const layout = {}
    visibleEvents.forEach((event, index) => {
      layout[event.id] = {
        graphY: 0.12 + stableValue(event.id, 1) * 0.76,
        ringRadius: 0.26 + stableValue(event.id, 2) * 0.72,
        ringAngle: (index / Math.max(visibleEvents.length, 1)) * Math.PI * 2 + stableValue(event.id, 3) * 0.45
      }
    })
    return layout
  }, [visibleEvents])

  const hoveredEvent = useMemo(
    () => visibleEvents.find((event) => event.id === hoveredEventId) ?? null,
    [visibleEvents, hoveredEventId]
  )

  const visibleCategories = useMemo(() => {
    const seen = new Set()
    visibleEvents.forEach((event) => seen.add(event.category))
    return Array.from(seen)
  }, [visibleEvents])

  const categoryStats = useMemo(() => {
    const totals = {}
    yearFilteredEvents.forEach((event) => {
      totals[event.category] = (totals[event.category] ?? 0) + 1
    })
    return Object.keys(CATEGORY_COLORS).map((category) => ({
      category,
      count: totals[category] ?? 0
    }))
  }, [yearFilteredEvents])

  const currentYear = yearRange[1]

  const insightCards = useMemo(() => {
    if (visibleEvents.length === 0) {
      return [
        { label: 'Events In View', value: '0', detail: 'No events match current filters' },
        { label: 'Leading Category', value: 'None', detail: 'Try re-enabling categories' },
        { label: 'Peak Decade', value: 'N/A', detail: 'Move the year slider forward' },
        { label: 'Time Coverage', value: '0 years', detail: 'Expand the visible year range' }
      ]
    }

    const categoryCounts = {}
    const decadeCounts = {}

    visibleEvents.forEach((event) => {
      categoryCounts[event.category] = (categoryCounts[event.category] ?? 0) + 1
      const decade = Math.floor(event.date / 10) * 10
      decadeCounts[decade] = (decadeCounts[decade] ?? 0) + 1
    })

    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
    const topDecade = Object.entries(decadeCounts).sort((a, b) => b[1] - a[1])[0]
    const earliestYear = visibleEvents[0].date
    const latestYear = visibleEvents[visibleEvents.length - 1].date
    const coverage = Math.max(latestYear - earliestYear, 0)

    return [
      {
        label: 'Events In View',
        value: String(visibleEvents.length),
        detail: `${yearFilteredEvents.length} events in selected years`
      },
      {
        label: 'Leading Category',
        value: formatCategoryLabel(topCategory[0]),
        detail: `${topCategory[1]} events in view`
      },
      {
        label: 'Peak Decade',
        value: decadeLabel(Number(topDecade[0])),
        detail: `${topDecade[1]} events cluster here`
      },
      {
        label: 'Time Coverage',
        value: `${coverage} years`,
        detail: `${earliestYear} to ${latestYear}`
      }
    ]
  }, [visibleEvents, yearFilteredEvents])

  const toggleCategory = (category) => {
    setActiveCategories((previous) => {
      if (previous.includes(category)) {
        return previous.filter((item) => item !== category)
      }

      return [...previous, category]
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const points = {}

    ctx.clearRect(0, 0, width, height)
    drawBackdrop(ctx, width, height)

    if (viewMode === 'graph') {
      drawGraphView(ctx, width, height, points)
    } else {
      drawConstellationView(ctx, width, height, points)
    }

    pointMapRef.current = points
  }, [viewMode, visibleEvents, stableLayout, hoveredEventId, selectedEvent, yearRange])

  const drawBackdrop = (ctx, width, height) => {
    const bg = ctx.createLinearGradient(0, 0, width, height)
    bg.addColorStop(0, '#090a0d')
    bg.addColorStop(0.52, '#101317')
    bg.addColorStop(1, '#06080b')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    const accentOne = ctx.createRadialGradient(width * 0.16, height * 0.18, 10, width * 0.16, height * 0.18, width * 0.42)
    accentOne.addColorStop(0, 'rgba(54, 137, 255, 0.16)')
    accentOne.addColorStop(1, 'rgba(54, 137, 255, 0)')
    ctx.fillStyle = accentOne
    ctx.fillRect(0, 0, width, height)

    const accentTwo = ctx.createRadialGradient(width * 0.86, height * 0.06, 10, width * 0.86, height * 0.06, width * 0.36)
    accentTwo.addColorStop(0, 'rgba(0, 214, 164, 0.13)')
    accentTwo.addColorStop(1, 'rgba(0, 214, 164, 0)')
    ctx.fillStyle = accentTwo
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(222, 233, 244, 0.25)'
    ctx.lineWidth = 1.2

    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(222, 233, 244, 0.12)'
    ctx.lineWidth = 1
    for (let x = 0; x <= width; x += 120) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }

  const drawGraphView = (ctx, width, height, points) => {
    const paddingX = 52
    const paddingY = 42
    const chartWidth = width - paddingX * 2
    const chartHeight = height - paddingY * 2
    const denominator = Math.max(yearRange[1] - minYear, 1)

    const centerY = paddingY + chartHeight / 2

    ctx.strokeStyle = 'rgba(224, 236, 248, 0.35)'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(paddingX, centerY)
    ctx.lineTo(width - paddingX, centerY)
    ctx.stroke()

    visibleEvents.forEach((event) => {
      const slot = stableLayout[event.id]
      if (!slot) return

      const progress = (event.date - minYear) / denominator
      const x = paddingX + progress * chartWidth
      const y = paddingY + slot.graphY * chartHeight
      points[event.id] = { x, y, hitRadius: 14 }

      const isHovered = hoveredEventId === event.id
      const isSelected = selectedEvent?.id === event.id
      const dotSize = isHovered || isSelected ? 9 : 6

      const categoryColor = CATEGORY_COLORS[event.category] ?? FALLBACK_COLOR
      const categoryGlow = CATEGORY_GLOWS[event.category] ?? FALLBACK_GLOW

      if (isHovered || isSelected) {
        ctx.fillStyle = categoryGlow
        ctx.beginPath()
        ctx.arc(x, y, dotSize + 7, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = categoryColor
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fill()

      if (isHovered || isSelected) {
        ctx.strokeStyle = categoryColor
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  const drawConstellationView = (ctx, width, height, points) => {
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) / 2 - 54

    ctx.strokeStyle = 'rgba(70, 57, 38, 0.18)'
    ctx.lineWidth = 1
    for (let ring = 1; ring <= 5; ring += 1) {
      const r = (maxRadius / 5) * ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
      ctx.stroke()
    }

    visibleEvents.forEach((event) => {
      const slot = stableLayout[event.id]
      if (!slot) return

      const radius = slot.ringRadius * maxRadius
      const x = centerX + Math.cos(slot.ringAngle) * radius
      const y = centerY + Math.sin(slot.ringAngle) * radius
      points[event.id] = { x, y, hitRadius: 14 }

      const isHovered = hoveredEventId === event.id
      const isSelected = selectedEvent?.id === event.id
      const dotSize = isHovered || isSelected ? 9 : 6

      const categoryColor = CATEGORY_COLORS[event.category] ?? FALLBACK_COLOR
      const categoryGlow = CATEGORY_GLOWS[event.category] ?? FALLBACK_GLOW

      if (isHovered || isSelected) {
        ctx.fillStyle = categoryGlow
        ctx.beginPath()
        ctx.arc(x, y, dotSize + 7, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = categoryColor
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fill()

      if (isHovered || isSelected) {
        ctx.strokeStyle = categoryColor
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  const findEventAtPoint = (x, y) => {
    let closest = null
    let bestDistance = Number.POSITIVE_INFINITY

    visibleEvents.forEach((event) => {
      const point = pointMapRef.current[event.id]
      if (!point) return

      const dx = x - point.x
      const dy = y - point.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= point.hitRadius && distance < bestDistance) {
        bestDistance = distance
        closest = event
      }
    })

    return closest
  }

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const found = findEventAtPoint(x, y)
    setTooltipPos({ x: e.clientX, y: e.clientY })
    setHoveredEventId(found?.id ?? null)
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    const found = findEventAtPoint(x, y)

    if (found) {
      onEventSelect(found)
    }
  }

  const handleSliderChange = (e) => {
    const nextEndYear = Number(e.target.value)
    onYearChange([minYear, Math.max(minYear, Math.min(maxYear, nextEndYear))])
  }

  const wikiUrl = selectedEvent
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(selectedEvent.wikiLink.replaceAll(' ', '_'))}`
    : null

  return (
    <div className="histography-container">
      <div className="timeline-shell">
        <aside className="category-rail" aria-label="Category filters">
          <h2 className="rail-title">Unheard Voices</h2>
          <p className="rail-range">1700-2026</p>
          <div className="rail-groups">
            {categoryStats.map((item) => {
              const isActive = activeCategories.includes(item.category)
              return (
                <button
                  key={item.category}
                  type="button"
                  className={`rail-category ${isActive ? 'active' : ''}`}
                  onClick={() => toggleCategory(item.category)}
                >
                  <span>{formatCategoryLabel(item.category)}</span>
                  <span>{item.count}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="timeline-stage">
          <div className="year-badge">{currentYear}</div>

          <div className="insights-panel" aria-label="Live timeline insights">
            {insightCards.map((card) => (
              <article key={card.label} className="insight-card">
                <p className="insight-label">{card.label}</p>
                <p className="insight-value">{card.value}</p>
                <p className="insight-detail">{card.detail}</p>
              </article>
            ))}
          </div>

          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            className="event-canvas"
            role="img"
            aria-label="Interactive visualization of curated historical events"
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredEventId(null)}
            onClick={handleCanvasClick}
          />

          {visibleEvents.length === 0 && (
            <div className="empty-state" role="status" aria-live="polite">
              <h3>No voices match this filter</h3>
              <p>Expand the year range or re-enable categories to continue the story.</p>
            </div>
          )}

          <div className="legend">
            {visibleCategories.map((category) => (
              <span key={category} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: CATEGORY_COLORS[category] ?? FALLBACK_COLOR }}></span>
                {formatCategoryLabel(category)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {hoveredEvent && (
        <div
          className="hover-tooltip"
          style={{
            display: 'block',
            left: `${Math.min(tooltipPos.x + 14, window.innerWidth - 260)}px`,
            top: `${Math.min(tooltipPos.y + 14, window.innerHeight - 150)}px`
          }}
        >
          <strong>{hoveredEvent.title}</strong>
          <p>{hoveredEvent.year}</p>
          <p>{hoveredEvent.description.substring(0, 100)}...</p>
        </div>
      )}

      {selectedEvent && (
        <div className="event-detail-panel">
          <button className="close-btn" onClick={() => onEventSelect(null)}>×</button>
          <h2>{selectedEvent.title}</h2>
          <p className="year">{selectedEvent.year}</p>
          <p className="category">{formatCategoryLabel(selectedEvent.category)}</p>
          <p className="description">{selectedEvent.description}</p>
          {wikiUrl && (
            <a className="source-link" href={wikiUrl} target="_blank" rel="noreferrer">
              Open source reference
            </a>
          )}
        </div>
      )}

      <div className="time-slider-container">
        <div className="slider-years">
          <div>{Math.floor(yearRange[0])}</div>
          <div>{Math.floor(yearRange[1])}</div>
        </div>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={yearRange[1]}
          onChange={handleSliderChange}
          className="time-slider"
        />
      </div>

      <div className="events-count">
        {visibleEvents.length} events in view
      </div>
    </div>
  )
}

export default HistographyVisualization
