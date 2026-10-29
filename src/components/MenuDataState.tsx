export function MenuDataState({ loading, error, onRetry }: { loading: boolean; error: Error | null; onRetry: () => void }) {
  return (
    <div className="px-4 py-12 text-center" role={error ? 'alert' : 'status'}>
      <h2 className="text-lg font-semibold text-slate-900">
        {loading ? 'Loading menus…' : error ? 'Menus could not be loaded' : 'Menus are not available yet'}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {loading ? 'Getting the latest menu information.' : error ? 'Please try again in a moment.' : 'Please check back when the menu information has been added.'}
      </p>
      {!loading && <button type="button" onClick={onRetry}
        className="mt-5 h-10 rounded-xl bg-nus-blue px-5 text-sm font-semibold text-white hover:bg-nus-blue-dark">
        Try again
      </button>}
    </div>
  )
}
