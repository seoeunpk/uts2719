export interface EmptyStateProps {
  onReset: () => void
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h3 className="text-lg font-semibold">No dishes match your search</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">Try a different keyword or loosen a few filters.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 h-10 rounded-xl bg-nus-blue px-5 text-sm font-semibold text-white hover:bg-nus-blue-dark"
      >
        Clear filters
      </button>
    </div>
  )
}
