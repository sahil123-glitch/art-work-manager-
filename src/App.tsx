import { ArtworkTable } from './components/ArtworkTable'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">Art Work Manager</div>
        <div className="app-subtitle">
          Art Institute of Chicago API • Server-side pagination • Persistent selection
        </div>
      </header>

      <main className="app-main">
        <ArtworkTable />
      </main>
    </div>
  )
}
