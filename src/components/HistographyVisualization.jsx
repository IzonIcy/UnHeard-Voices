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

const SEARCH_SCOPE_LABELS = {
  title: 'Title',
  person: 'Person',
  movement: 'Movement',
  place: 'Place'
}

const MOVEMENT_LABELS = {
  maroon_resistance: 'Maroon resistance',
  black_literature: 'Black literary history',
  abolition: 'Abolition',
  anti_lynching: 'Anti-lynching activism',
  school_desegregation: 'School desegregation',
  civil_rights: 'Civil rights',
  labor_rights: 'Labor rights',
  indigenous_sovereignty: 'Indigenous sovereignty',
  black_feminism: 'Black feminism',
  indigenous_rights: 'Indigenous rights',
  public_health: 'Public health',
  disability_rights: 'Disability rights',
  environmental_justice: 'Environmental justice',
  survivor_justice: 'Survivor justice',
  language_revitalization: 'Language revitalization'
}

const REGION_LABELS = {
  caribbean: 'Caribbean',
  north_america: 'North America',
  latin_america: 'Latin America',
  africa: 'Africa'
}

const EMPTY_METADATA = {
  people: [],
  places: [],
  movements: [],
  regions: [],
  influencedBy: []
}

const EVENT_METADATA = {
  1: {
    people: ['Nanny of the Maroons'],
    places: ['Jamaica'],
    movements: ['maroon_resistance', 'indigenous_sovereignty'],
    regions: ['caribbean'],
    influencedBy: []
  },
  2: {
    people: ['Phillis Wheatley'],
    places: ['Boston', 'United States'],
    movements: ['black_literature', 'abolition'],
    regions: ['north_america'],
    influencedBy: []
  },
  3: {
    people: ['Mary Prince'],
    places: ['Bermuda', 'Caribbean'],
    movements: ['abolition'],
    regions: ['caribbean'],
    influencedBy: [1]
  },
  4: {
    people: ['Frederick Douglass'],
    places: ['United States'],
    movements: ['abolition'],
    regions: ['north_america'],
    influencedBy: [2, 3]
  },
  5: {
    people: ['Sojourner Truth'],
    places: ['United States'],
    movements: ['abolition', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [4]
  },
  6: {
    people: ['Harriet Tubman'],
    places: ['United States'],
    movements: ['abolition', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [4, 5]
  },
  7: {
    people: ['Susan La Flesche Picotte'],
    places: ['Nebraska', 'United States'],
    movements: ['public_health', 'indigenous_sovereignty'],
    regions: ['north_america'],
    influencedBy: [6]
  },
  8: {
    people: ['Ida B. Wells'],
    places: ['United States'],
    movements: ['anti_lynching', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [4, 5]
  },
  9: {
    people: ['Yuri Kochiyama'],
    places: ['United States'],
    movements: ['civil_rights'],
    regions: ['north_america'],
    influencedBy: [8]
  },
  10: {
    people: ['Zora Neale Hurston'],
    places: ['United States'],
    movements: ['black_literature', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [2]
  },
  11: {
    people: ['Mendez family'],
    places: ['California', 'United States'],
    movements: ['school_desegregation', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [4]
  },
  12: {
    people: ['Claudette Colvin'],
    places: ['Alabama', 'United States'],
    movements: ['civil_rights'],
    regions: ['north_america'],
    influencedBy: [8, 11]
  },
  13: {
    people: ['Dolores Huerta'],
    places: ['California', 'United States'],
    movements: ['labor_rights', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [12]
  },
  14: {
    people: ['Nina Simone'],
    places: ['United States'],
    movements: ['civil_rights', 'black_literature'],
    regions: ['north_america'],
    influencedBy: [8, 12]
  },
  15: {
    people: ['American Indian Movement'],
    places: ['United States'],
    movements: ['indigenous_sovereignty', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [7]
  },
  16: {
    people: ['Combahee River Collective'],
    places: ['United States'],
    movements: ['black_feminism', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [5, 14]
  },
  17: {
    people: ['Rigoberta Menchu'],
    places: ['Guatemala'],
    movements: ['indigenous_rights', 'civil_rights'],
    regions: ['latin_america'],
    influencedBy: [15]
  },
  18: {
    people: ['Flossie Wong-Staal'],
    places: ['United States'],
    movements: ['public_health'],
    regions: ['north_america'],
    influencedBy: [7]
  },
  19: {
    people: ['Disability Rights Movement'],
    places: ['United States'],
    movements: ['disability_rights', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [12, 13]
  },
  20: {
    people: ['Wangari Maathai'],
    places: ['Kenya'],
    movements: ['environmental_justice', 'civil_rights'],
    regions: ['africa'],
    influencedBy: [16]
  },
  21: {
    people: ['Tarana Burke'],
    places: ['United States'],
    movements: ['survivor_justice', 'civil_rights'],
    regions: ['north_america'],
    influencedBy: [16, 19]
  },
  22: {
    people: ['Land Back organizers'],
    places: ['North America'],
    movements: ['language_revitalization', 'indigenous_sovereignty'],
    regions: ['north_america'],
    influencedBy: [15, 17]
  }
}

const formatCategoryLabel = (category) =>
  category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatTagLabel = (tag, labels) =>
  labels[tag] ??
  tag
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const stableValue = (id, salt) => {
  const raw = Math.sin((id + 1) * (salt + 17) * 12.9898) * 43758.5453
  return raw - Math.floor(raw)
}

const decadeLabel = (year) => `${Math.floor(year / 10) * 10}s`

const sharesTag = (sourceTags, targetTags) => {
  if (!sourceTags?.length || !targetTags?.length) {
    return false
  }

  const sourceSet = new Set(sourceTags)
  return targetTags.some((tag) => sourceSet.has(tag))
}

function HistographyVisualization({
  events,
  viewMode,
  yearRange,
  onYearChange,
  onEventSelect,
  selectedEvent,
  minYear,
  maxYear,
  activeCategories,
  onActiveCategoriesChange,
  searchQuery,
  onSearchQueryChange,
  searchScopes,
  onSearchScopesChange
}) {
  const [hoveredEventId, setHoveredEventId] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)

  const canvasRef = useRef(null)
  const pointMapRef = useRef({})
  const touchStartEventIdRef = useRef(null)

  const allCategories = useMemo(() => Array.from(new Set(events.map((event) => event.category))), [events])
  const eventsById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events])

  const eventMetadata = useMemo(() => {
    const map = {}
    events.forEach((event) => {
      const metadata = EVENT_METADATA[event.id] ?? EMPTY_METADATA
      map[event.id] = {
        people: metadata.people ?? [],
        places: metadata.places ?? [],
        movements: metadata.movements ?? [],
        regions: metadata.regions ?? [],
        influencedBy: metadata.influencedBy ?? []
      }
    })
    return map
  }, [events])

  const [startYear, endYear] = yearRange

  const yearFilteredEvents = useMemo(() => {
    return events
      .filter((event) => event.date >= startYear && event.date <= endYear)
      .sort((a, b) => a.date - b.date)
  }, [events, startYear, endYear])

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()

  const searchEligibleEvents = useMemo(() => {
    if (!normalizedSearchQuery) {
      return yearFilteredEvents
    }

    const activeSearchScopes = new Set(searchScopes)

    return yearFilteredEvents.filter((event) => {
      const metadata = eventMetadata[event.id] ?? EMPTY_METADATA

      if (activeSearchScopes.has('title')) {
        const titleText = `${event.title} ${event.description} ${event.wikiLink}`.toLowerCase()
        if (titleText.includes(normalizedSearchQuery)) {
          return true
        }
      }

      if (activeSearchScopes.has('person')) {
        if (metadata.people.some((person) => person.toLowerCase().includes(normalizedSearchQuery))) {
          return true
        }
      }

      if (activeSearchScopes.has('movement')) {
        const movementMatches = metadata.movements.some((movementTag) =>
          formatTagLabel(movementTag, MOVEMENT_LABELS).toLowerCase().includes(normalizedSearchQuery)
        )
        if (movementMatches) {
          return true
        }
      }

      if (activeSearchScopes.has('place')) {
        const placeMatches = metadata.places.some((place) => place.toLowerCase().includes(normalizedSearchQuery))
        const regionMatches = metadata.regions.some((regionTag) =>
          formatTagLabel(regionTag, REGION_LABELS).toLowerCase().includes(normalizedSearchQuery)
        )
        if (placeMatches || regionMatches) {
          return true
        }
      }

      return false
    })
  }, [eventMetadata, normalizedSearchQuery, searchScopes, yearFilteredEvents])

  const visibleEvents = useMemo(() => {
    const activeSet = new Set(activeCategories)
    return searchEligibleEvents.filter((event) => activeSet.has(event.category))
  }, [activeCategories, searchEligibleEvents])

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
    [hoveredEventId, visibleEvents]
  )

  const visibleCategories = useMemo(() => {
    const seen = new Set()
    visibleEvents.forEach((event) => seen.add(event.category))
    return Array.from(seen)
  }, [visibleEvents])

  const categoryStats = useMemo(() => {
    const totals = {}
    searchEligibleEvents.forEach((event) => {
      totals[event.category] = (totals[event.category] ?? 0) + 1
    })

    return allCategories.map((category) => ({
      category,
      count: totals[category] ?? 0
    }))
  }, [allCategories, searchEligibleEvents])

  const insightCards = useMemo(() => {
    if (visibleEvents.length === 0) {
      return [
        { label: 'Events In View', value: '0', detail: 'No events match current filters' },
        { label: 'Leading Category', value: 'None', detail: 'Try re-enabling categories' },
        { label: 'Peak Decade', value: 'N/A', detail: 'Adjust year range or search' },
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
        detail: `${searchEligibleEvents.length} match search/range`
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
  }, [searchEligibleEvents.length, visibleEvents])

  const relationshipGroups = useMemo(() => {
    if (!selectedEvent) {
      return []
    }

    const selectedMetadata = eventMetadata[selectedEvent.id] ?? EMPTY_METADATA

    const influencedByEvents = selectedMetadata.influencedBy
      .map((id) => eventsById.get(id))
      .filter(Boolean)
      .sort((a, b) => a.date - b.date)

    const sameMovementEvents = events
      .filter((event) => {
        if (event.id === selectedEvent.id) {
          return false
        }

        const metadata = eventMetadata[event.id] ?? EMPTY_METADATA
        return sharesTag(selectedMetadata.movements, metadata.movements)
      })
      .sort((a, b) => a.date - b.date)

    const sameRegionEvents = events
      .filter((event) => {
        if (event.id === selectedEvent.id) {
          return false
        }

        const metadata = eventMetadata[event.id] ?? EMPTY_METADATA
        return sharesTag(selectedMetadata.regions, metadata.regions)
      })
      .sort((a, b) => a.date - b.date)

    return [
      { key: 'influencedBy', label: 'Influenced by', events: influencedByEvents },
      { key: 'sameMovement', label: 'Same movement', events: sameMovementEvents },
      { key: 'sameRegion', label: 'Same region', events: sameRegionEvents }
    ]
  }, [eventMetadata, events, eventsById, selectedEvent])

  const selectedEventMetadata = selectedEvent ? eventMetadata[selectedEvent.id] ?? EMPTY_METADATA : EMPTY_METADATA

  const toggleCategory = (category) => {
    onActiveCategoriesChange((previous) => {
      if (previous.includes(category)) {
        return previous.filter((item) => item !== category)
      }

      return [...previous, category]
    })
  }

  const toggleSearchScope = (scope) => {
    onSearchScopesChange((previous) => {
      if (previous.includes(scope)) {
        return previous.length === 1 ? previous : previous.filter((item) => item !== scope)
      }

      return [...previous, scope]
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

    if (viewMode === 'timeline') {
      drawTimelineView(ctx, width, height, points)
    } else {
      drawConstellationView(ctx, width, height, points)
    }

    pointMapRef.current = points
  }, [endYear, hoveredEventId, selectedEvent, stableLayout, startYear, viewMode, visibleEvents])

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

  const drawTimelineView = (ctx, width, height, points) => {
    const paddingX = 52
    const paddingY = 42
    const chartWidth = width - paddingX * 2
    const chartHeight = height - paddingY * 2
    const denominator = Math.max(endYear - startYear, 1)
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

      const progress = (event.date - startYear) / denominator
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

  const getCanvasPoint = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const updateHoverFromPointer = (clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return null
    }

    const { x, y } = getCanvasPoint(canvas, clientX, clientY)
    const found = findEventAtPoint(x, y)
    setHoveredEventId(found?.id ?? null)
    setTooltipPos({ x: clientX, y: clientY })
    return found
  }

  const handleCanvasMouseMove = (event) => {
    setShowTooltip(true)
    updateHoverFromPointer(event.clientX, event.clientY)
  }

  const handleCanvasClick = (event) => {
    const found = updateHoverFromPointer(event.clientX, event.clientY)
    if (found) {
      onEventSelect(found)
    }
  }

  const handleCanvasTouchStart = (event) => {
    const touch = event.touches[0]
    if (!touch) return

    setShowTooltip(false)
    const found = updateHoverFromPointer(touch.clientX, touch.clientY)
    touchStartEventIdRef.current = found?.id ?? null
  }

  const handleCanvasTouchMove = (event) => {
    const touch = event.touches[0]
    if (!touch) return
    updateHoverFromPointer(touch.clientX, touch.clientY)
  }

  const handleCanvasTouchEnd = () => {
    if (touchStartEventIdRef.current === null) {
      return
    }

    const touchedEvent = visibleEvents.find((event) => event.id === touchStartEventIdRef.current)
    touchStartEventIdRef.current = null
    if (touchedEvent) {
      onEventSelect(touchedEvent)
    }
  }

  const handleCanvasKeyDown = (event) => {
    if (!visibleEvents.length) {
      return
    }

    const currentIndex = Math.max(visibleEvents.findIndex((item) => item.id === hoveredEventId), 0)
    const maxIndex = visibleEvents.length - 1

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      setShowTooltip(false)
      setHoveredEventId(visibleEvents[Math.min(currentIndex + 1, maxIndex)].id)
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      setShowTooltip(false)
      setHoveredEventId(visibleEvents[Math.max(currentIndex - 1, 0)].id)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setShowTooltip(false)
      setHoveredEventId(visibleEvents[0].id)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setShowTooltip(false)
      setHoveredEventId(visibleEvents[maxIndex].id)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const selected = visibleEvents[currentIndex]
      if (selected) {
        onEventSelect(selected)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setHoveredEventId(null)
      setShowTooltip(false)
    }
  }

  const handleStartYearChange = (event) => {
    const nextStart = Number(event.target.value)
    onYearChange([Math.min(nextStart, endYear), endYear])
  }

  const handleEndYearChange = (event) => {
    const nextEnd = Number(event.target.value)
    onYearChange([startYear, Math.max(nextEnd, startYear)])
  }

  const wikiUrl = selectedEvent
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(selectedEvent.wikiLink.replaceAll(' ', '_'))}`
    : null

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 720

  return (
    <div className="histography-container">
      <div className="timeline-shell">
        <aside className="category-rail" aria-label="Category and search controls">
          <h2 className="rail-title">Unheard Voices</h2>
          <p className="rail-range">{minYear}-{maxYear}</p>

          <div className="search-controls">
            <label className="search-label" htmlFor="event-search">
              Search
            </label>
            <div className="search-input-row">
              <input
                id="event-search"
                className="search-input"
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search events, people, movements, places"
              />
              {searchQuery.trim().length > 0 && (
                <button className="search-clear-btn" type="button" onClick={() => onSearchQueryChange('')}>
                  Clear
                </button>
              )}
            </div>

            <div className="scope-grid" role="group" aria-label="Search scope">
              {Object.entries(SEARCH_SCOPE_LABELS).map(([scope, label]) => {
                const isActive = searchScopes.includes(scope)
                return (
                  <button
                    key={scope}
                    type="button"
                    className={`scope-chip ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => toggleSearchScope(scope)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rail-groups">
            {categoryStats.map((item) => {
              const isActive = activeCategories.includes(item.category)
              return (
                <button
                  key={item.category}
                  type="button"
                  className={`rail-category ${isActive ? 'active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => toggleCategory(item.category)}
                >
                  <span>{formatCategoryLabel(item.category)}</span>
                  <span>{item.count}</span>
                </button>
              )
            })}
          </div>

          <div className="time-slider-container">
            <div className="slider-years">
              <div>Start {Math.floor(startYear)}</div>
              <div>End {Math.floor(endYear)}</div>
            </div>
            <label className="visually-hidden" htmlFor="start-year-slider">
              Start year
            </label>
            <input
              id="start-year-slider"
              type="range"
              min={minYear}
              max={endYear}
              value={startYear}
              onChange={handleStartYearChange}
              className="time-slider"
            />
            <label className="visually-hidden" htmlFor="end-year-slider">
              End year
            </label>
            <input
              id="end-year-slider"
              type="range"
              min={startYear}
              max={maxYear}
              value={endYear}
              onChange={handleEndYearChange}
              className="time-slider time-slider-secondary"
            />
          </div>

          <div className="events-count">{visibleEvents.length} events in view</div>

          <section className="event-browser" aria-label="Keyboard and screen reader event list">
            <h3 className="event-browser-title">Browse Events</h3>
            {visibleEvents.length === 0 ? (
              <p className="event-browser-empty">No events to browse with current filters.</p>
            ) : (
              <ul className="event-browser-list">
                {visibleEvents.map((event) => {
                  const isSelected = selectedEvent?.id === event.id
                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        className={`event-browser-item ${isSelected ? 'active' : ''}`}
                        onClick={() => onEventSelect(event)}
                      >
                        <span className="event-browser-year">{event.year}</span>
                        <span className="event-browser-name">{event.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </aside>

        <div className="timeline-stage">
          <div className="year-badge">
            {startYear} - {endYear}
          </div>

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
            tabIndex={0}
            role="img"
            aria-label="Interactive visualization of curated historical events. Use arrow keys to move through points and Enter to open a selected event."
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => {
              setHoveredEventId(null)
              setShowTooltip(false)
            }}
            onClick={handleCanvasClick}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            onKeyDown={handleCanvasKeyDown}
          />

          {visibleEvents.length === 0 && (
            <div className="empty-state" role="status" aria-live="polite">
              <h3>No voices match this filter</h3>
              <p>Expand the year range, broaden search terms, or re-enable categories to continue the story.</p>
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

      {hoveredEvent && showTooltip && (
        <div
          className="hover-tooltip"
          style={{
            display: 'block',
            left: `${Math.min(tooltipPos.x + 14, viewportWidth - 260)}px`,
            top: `${Math.min(tooltipPos.y + 14, viewportHeight - 150)}px`
          }}
        >
          <strong>{hoveredEvent.title}</strong>
          <p>{hoveredEvent.year}</p>
          <p>{hoveredEvent.description.substring(0, 100)}...</p>
        </div>
      )}

      {selectedEvent && (
        <div className="event-detail-panel">
          <button className="close-btn" type="button" aria-label="Close event details" onClick={() => onEventSelect(null)}>
            ×
          </button>
          <h2>{selectedEvent.title}</h2>
          <p className="year">{selectedEvent.year}</p>
          <p className="category">{formatCategoryLabel(selectedEvent.category)}</p>
          <p className="description">{selectedEvent.description}</p>

          {(selectedEventMetadata.movements.length > 0 || selectedEventMetadata.regions.length > 0) && (
            <div className="event-meta-pills" aria-label="Event tags">
              {selectedEventMetadata.movements.map((movement) => (
                <span key={movement} className="meta-pill">
                  {formatTagLabel(movement, MOVEMENT_LABELS)}
                </span>
              ))}
              {selectedEventMetadata.regions.map((region) => (
                <span key={region} className="meta-pill region">
                  {formatTagLabel(region, REGION_LABELS)}
                </span>
              ))}
            </div>
          )}

          <div className="related-events" aria-label="Related events">
            {relationshipGroups.map((group) => (
              <section key={group.key} className="related-group">
                <h3>{group.label}</h3>
                {group.events.length === 0 ? (
                  <p className="related-empty">No linked events available.</p>
                ) : (
                  <ul className="related-list">
                    {group.events.slice(0, 4).map((event) => (
                      <li key={`${group.key}-${event.id}`}>
                        <button type="button" onClick={() => onEventSelect(event)}>
                          <span>{event.year}</span>
                          <span>{event.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {wikiUrl && (
            <a className="source-link" href={wikiUrl} target="_blank" rel="noreferrer">
              Open source reference
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default HistographyVisualization
