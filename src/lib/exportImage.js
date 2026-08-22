const sanitize = (value) => String(value).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'timeline'

/**
 * Derive the download filename for a canvas snapshot.
 * Pure so it can be unit-tested without a DOM.
 */
export function exportFileName(selectedId) {
  return selectedId == null
    ? 'unheard-voices-timeline.png'
    : `unheard-voices-event-${sanitize(selectedId)}.png`
}

/**
 * Trigger a PNG download of the given canvas.
 * Returns true on success, false when the browser lacks support
 * (jsdom and some older browsers have no canvas.toBlob).
 */
export function downloadCanvasAsPng(canvas, filename) {
  if (!canvas || typeof canvas.toBlob !== 'function') {
    return false
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, 'image/png')

  return true
}
