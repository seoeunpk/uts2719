export type SheetSnap = 'peek' | 'half' | 'full'

/** Space left above a fully open sheet so the search bar stays visible. */
const TOP_GAP = 128

/** Visible bottom-sheet height (px) for each snap point. */
export function getSheetHeights(viewportHeight: number): Record<SheetSnap, number> {
  const full = Math.max(viewportHeight - TOP_GAP, 320)
  return { peek: 136, half: Math.min(Math.round(viewportHeight * 0.48), full), full }
}
