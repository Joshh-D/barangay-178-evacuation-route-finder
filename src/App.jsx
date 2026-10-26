
import EvacuationMap from './components/EvacuationMap'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-5 text-slate-900 sm:p-8">
      <header className="mx-auto mb-6 max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
          Community Safety Project
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Barangay 178 Evacuation Route Finder
        </h1>

        <p className="mt-2 text-slate-600">
          Explore local facilities, view estimated capacities, and find a
          route to your selected destination.
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Note: Facility capacities are estimates for this project and
          are not official occupancy limits.
        </p>
      </header>

      <main className="mx-auto max-w-7xl">
        <EvacuationMap />
      </main>
    </div>
  )
}

export default App
