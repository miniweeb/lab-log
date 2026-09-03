import { useEffect, useState } from 'react'
import Home from './pages/Home'
import EtlLab from './pages/EtlLab'
import Foundations from './pages/Foundations'
import Vocab from './pages/Vocab'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { LangSwitch } from './components/ui'

export type Route = 'home' | 'etl' | 'vocab' | 'foundations' | 'reports' | 'settings'

const NAV: Array<{ id: Route; ico: string; label: string }> = [
  { id: 'home', ico: '🏠', label: 'Trang chủ' },
  { id: 'etl', ico: '🧪', label: 'ETL Lab' },
  { id: 'vocab', ico: '📖', label: 'Vocab' },
  { id: 'foundations', ico: '📚', label: 'Foundations' },
  { id: 'reports', ico: '📮', label: 'Report' },
  { id: 'settings', ico: '⚙️', label: 'Cài đặt' },
]

const fromHash = (): Route => {
  const h = location.hash.replace('#/', '') as Route
  return NAV.some((n) => n.id === h) ? h : 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(fromHash)

  useEffect(() => {
    const on = () => setRoute(fromHash())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])

  const go = (r: Route) => { location.hash = `#/${r}`; setRoute(r) }

  return (
    <div className="app">
      <nav className="rail" aria-label="Điều hướng chính">
        {NAV.map((n) => (
          <button key={n.id} className="rail-item" aria-current={route === n.id} onClick={() => go(n.id)}>
            <span className="ico">{n.ico}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="sheet">
          <header className="brand">
            <h1>Lab Log</h1>
            <LangSwitch />
          </header>

          {route === 'home' && <Home go={go} />}
          {route === 'etl' && <EtlLab />}
          {route === 'vocab' && <Vocab />}
          {route === 'foundations' && <Foundations />}
          {route === 'reports' && <Reports />}
          {route === 'settings' && <Settings />}

          <footer className="foot">Dữ liệu lưu ngay trên máy này · không cần đăng nhập</footer>
        </div>
      </main>
    </div>
  )
}
