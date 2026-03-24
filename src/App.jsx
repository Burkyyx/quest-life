import { useState, useRef, useCallback, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Shield, Swords, BarChart3, BookOpen, User } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Quests from './pages/Quests'
import Notes from './pages/Notes'
import Stats from './pages/Stats'
import Wisdom from './pages/Wisdom'
import Profile from './pages/Profile'

const NAV_ITEMS = [
  { to: '/', icon: Shield, label: 'Accueil' },
  { to: '/quests', icon: Swords, label: 'Quêtes' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/wisdom', icon: BookOpen, label: 'Sagesse' },
  { to: '/profile', icon: User, label: 'Profil' },
]

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <main className="flex-1 pb-28 px-5 pt-6 max-w-lg mx-auto w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/wisdom" element={<Wisdom />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      <LiquidGlassNav />
    </div>
  )
}

function LiquidGlassNav() {
  const location = useLocation()
  const navRef = useRef(null)
  const itemRefs = useRef([])
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const [glowPos, setGlowPos] = useState({ x: -200, y: -200 })
  const [isHovering, setIsHovering] = useState(false)

  // Find active index
  const activeIndex = NAV_ITEMS.findIndex(item =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )

  // Update pill position when active tab changes
  const updatePill = useCallback(() => {
    const idx = activeIndex >= 0 ? activeIndex : 0
    const el = itemRefs.current[idx]
    const nav = navRef.current
    if (!el || !nav) return
    const navRect = nav.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setPillStyle({
      left: elRect.left - navRect.left,
      width: elRect.width,
      opacity: 1,
    })
  }, [activeIndex])

  useEffect(() => {
    updatePill()
    window.addEventListener('resize', updatePill)
    return () => window.removeEventListener('resize', updatePill)
  }, [updatePill])

  // Track pointer for glow effect
  const handlePointerMove = useCallback((e) => {
    const nav = navRef.current
    if (!nav) return
    const rect = nav.getBoundingClientRect()
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom)]">
      <div
        ref={navRef}
        className="liquid-glass-nav relative max-w-lg mx-auto mb-2"
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        {/* Liquid glass background layers */}
        <div className="liquid-glass-bg" />
        <div className="liquid-glass-border" />

        {/* Pointer glow that follows cursor/finger */}
        <div
          className="liquid-glass-glow"
          style={{
            left: `${glowPos.x}px`,
            top: `${glowPos.y}px`,
            opacity: isHovering ? 1 : 0,
          }}
        />

        {/* Active pill indicator that slides between tabs */}
        <div
          className="liquid-glass-pill"
          style={{
            transform: `translateX(${pillStyle.left}px)`,
            width: `${pillStyle.width}px`,
            opacity: pillStyle.opacity,
          }}
        />

        {/* Nav items */}
        <div className="relative z-10 flex justify-around items-center py-2 px-1">
          {NAV_ITEMS.map((item, i) => {
            const Icon = item.icon
            const isActive = i === activeIndex
            return (
              <NavLink
                key={item.to}
                to={item.to}
                ref={el => itemRefs.current[i] = el}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-300 relative ${
                  isActive
                    ? 'text-white liquid-nav-active'
                    : 'text-[#636366] hover:text-[#aeaeb2]'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 1.8 : 1.5} />
                <span className={`text-[9px] font-medium tracking-wide transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default App
