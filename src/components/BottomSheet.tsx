import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { getSheetHeights, type SheetSnap } from '../lib/sheet'

const HANDLE_HEIGHT = 28

export interface BottomSheetProps {
  snap: SheetSnap
  onSnapChange: (snap: SheetSnap) => void
  viewportHeight: number
  /** Changes to this value scroll the content back to the top. */
  contentKey?: string
  children: ReactNode
}

/** Draggable mobile panel with peek / half / full snap points. */
export function BottomSheet({ snap, onSnapChange, viewportHeight, contentKey, children }: BottomSheetProps) {
  const heights = getSheetHeights(viewportHeight)
  const [dragDelta, setDragDelta] = useState<number | null>(null)
  const dragStartY = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [contentKey])

  const visible = Math.min(Math.max(heights[snap] - (dragDelta ?? 0), heights.peek - 40), heights.full)

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStartY.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null) return
    setDragDelta(event.clientY - dragStartY.current)
  }

  function handlePointerUp() {
    if (dragStartY.current === null) return
    const delta = dragDelta ?? 0
    dragStartY.current = null
    setDragDelta(null)

    if (Math.abs(delta) < 6) {
      onSnapChange(snap === 'peek' ? 'half' : snap === 'half' ? 'full' : 'half')
      return
    }
    const nearest = (Object.keys(heights) as SheetSnap[]).reduce((best, key) =>
      Math.abs(heights[key] - visible) < Math.abs(heights[best] - visible) ? key : best,
    )
    onSnapChange(nearest)
  }

  return (
    <section
      aria-label="Results"
      style={{ height: heights.full, transform: `translateY(${heights.full - visible}px)` }}
      className={`absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl bg-white shadow-[0_-4px_24px_rgb(0_0_0/0.14)] ${
        dragDelta === null ? 'transition-transform duration-300 ease-out' : ''
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={snap === 'full' ? 'Collapse results' : 'Expand results'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSnapChange(snap === 'full' ? 'half' : 'full')
          }
        }}
        style={{ height: HANDLE_HEIGHT }}
        className="flex shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      >
        <span className="h-1.5 w-10 rounded-full bg-slate-300" />
      </div>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        // Off-screen part of the sheet would otherwise hide the last items.
        style={{ paddingBottom: heights.full - heights[snap] }}
      >
        {children}
      </div>
    </section>
  )
}
