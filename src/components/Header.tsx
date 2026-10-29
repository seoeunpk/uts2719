export interface HeaderProps {
  /** Shows a badge so nobody mistakes mock data for real menus. */
  isPreviewData?: boolean
}

export function Header({ isPreviewData = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="size-8" />
          <span className="text-lg font-extrabold tracking-tight text-nus-blue">
            NUS <span className="text-nus-orange">Food</span> Finder
          </span>
        </a>
        {isPreviewData && (
          <span
            title="Showing mock data for UI preview, not real menus"
            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
          >
            Preview data
          </span>
        )}
      </div>
    </header>
  )
}
