import { describe, it, expect, beforeAll, vi } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import App from '../src/App'
import events from '../src/data/events.json'

const FIRST_EVENT = [...events].sort((a, b) => a.date - b.date)[0]
const SECOND_EVENT = [...events].sort((a, b) => a.date - b.date)[1]

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {}
    })
  }

  const noop2d = new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'measureText') return () => ({ width: 0 })
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return () => ({ addColorStop: () => {} })
        }
        return () => {}
      },
      set: () => true
    }
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(noop2d)
})

const renderApp = async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  await act(async () => {
    createRoot(container).render(<App />)
  })
  return container
}

const press = async (canvas, key) => {
  await act(async () => {
    canvas.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true
      })
    )
  })
}

const panelTitle = (container) => container.querySelector('.event-detail-panel h2, .event-detail-panel h3, .event-detail-panel')?.textContent ?? ''

describe('canvas keyboard navigation', () => {
  it('reaches the first event with ArrowRight, not the second', async () => {
    const container = await renderApp()
    const canvas = container.querySelector('canvas')

    // Regression: currentIndex was coerced to 0 when nothing was hovered, so
    // the first ArrowRight skipped past the opening event.
    await press(canvas, 'ArrowRight')
    await press(canvas, 'Enter')

    expect(panelTitle(container)).toContain(FIRST_EVENT.title)
    expect(panelTitle(container)).not.toContain(SECOND_EVENT.title)
    container.remove()
  })

  it('opens the first event on Enter with nothing highlighted', async () => {
    const container = await renderApp()
    const canvas = container.querySelector('canvas')

    await press(canvas, 'Enter')

    expect(panelTitle(container)).toContain(FIRST_EVENT.title)
    container.remove()
  })

  it('walks forward one event at a time', async () => {
    const container = await renderApp()
    const canvas = container.querySelector('canvas')

    await press(canvas, 'ArrowRight')
    await press(canvas, 'ArrowRight')
    await press(canvas, 'Enter')

    expect(panelTitle(container)).toContain(SECOND_EVENT.title)
    container.remove()
  })

  it('jumps to the last event with End and back to the first with Home', async () => {
    const container = await renderApp()
    const canvas = container.querySelector('canvas')

    await press(canvas, 'End')
    await press(canvas, 'Enter')
    const lastTitle = panelTitle(container)

    await press(canvas, 'Home')
    await press(canvas, 'Enter')
    const firstTitle = panelTitle(container)

    expect(lastTitle).not.toBe(firstTitle)
    expect(firstTitle).toContain(FIRST_EVENT.title)
    container.remove()
  })

  it('closes the detail panel with Escape', async () => {
    const container = await renderApp()
    const canvas = container.querySelector('canvas')

    await press(canvas, 'Enter')
    expect(container.querySelector('.event-detail-panel')).not.toBeNull()

    await press(canvas, 'Escape')
    expect(container.querySelector('.event-detail-panel')).toBeNull()
    container.remove()
  })
})
describe('dismissal', () => {
  it('closes the detail panel on Escape even when focus is outside the canvas', async () => {
    // The panel declares aria-modal, so Escape has to work wherever focus
    // happens to be. It used to be bound to the canvas alone, so clicking a
    // related event (which re-renders the panel and drops focus to body)
    // left the panel stuck open.
    const container = await renderApp()
    await act(async () => {
      window.history.replaceState(null, '', '?event=4')
    })

    const reopen = async () => {
      const target = container.querySelector('canvas')
      await press(target, 'Enter')
    }
    await reopen()
    expect(container.querySelector('.event-detail-panel')).not.toBeNull()

    // Focus lands on the document body, not the canvas.
    document.body.focus()
    await act(async () => {
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true
        })
      )
    })

    expect(container.querySelector('.event-detail-panel')).toBeNull()
    container.remove()
  })

  it('closes the detail panel on Escape from a related-event button', async () => {
    const container = await renderApp()
    const canvas = container.querySelector('canvas')
    await press(canvas, 'Enter')
    expect(container.querySelector('.event-detail-panel')).not.toBeNull()

    // Focus a control inside the dialog, then dismiss.
    const inner = container.querySelector('.event-detail-panel button')
    inner.focus()
    await act(async () => {
      inner.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true
        })
      )
    })

    expect(container.querySelector('.event-detail-panel')).toBeNull()
    container.remove()
  })
})
