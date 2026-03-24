import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Star, Trophy, ChevronRight, Zap, Pencil, Trash2 } from 'lucide-react'
import QuestIcon from '../components/QuestIcon'
import PixelAvatar, { PixelStar } from '../components/PixelAvatar'
import { getState, xpForLevel, getTitle, toggleQuest, saveDayHistory, removeQuest, STAT_TYPES } from '../store/useStore'
import { getDailyQuote } from '../store/quotes'
import { getCurrentGrade, getNextGrade } from '../store/grades'

export default function Dashboard() {
  const [state, setLocalState] = useState(getState)
  const [levelUp, setLevelUp] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { quest, x, y }
  const longPressTimer = useRef(null)
  const longPressFired = useRef(false)
  const touchStart = useRef(null)

  const today = new Date().toISOString().split('T')[0]
  const todayCompleted = state.completedQuests[today] || []
  const xpNeeded = xpForLevel(state.character.level)
  const xpPercent = Math.min(100, (state.character.xp / xpNeeded) * 100)
  const quote = getDailyQuote()
  const questsDone = todayCompleted.length
  const totalQuests = state.quests.length
  const dayPercent = totalQuests > 0 ? Math.round((questsDone / totalQuests) * 100) : 0

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [contextMenu])

  function refresh() { setLocalState({ ...getState() }) }

  function handleToggle(questId) {
    const prevLevel = state.character.level
    const newState = toggleQuest(questId)
    setLocalState({ ...newState })
    if (newState.character.level > prevLevel) {
      setLevelUp(true)
      setTimeout(() => setLevelUp(false), 3000)
    }
    saveDayHistory()
  }

  function handleRemove(questId) {
    setContextMenu(null)
    removeQuest(questId)
    refresh()
  }

  function handleTouchStart(e, quest) {
    // No preventDefault → scroll works normally
    longPressFired.current = false
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      setContextMenu({ quest, x: touch.clientX, y: touch.clientY })
    }, 550)
  }
  function handleTouchMove(e) {
    if (!touchStart.current) return
    const touch = e.touches[0]
    const dy = Math.abs(touch.clientY - touchStart.current.y)
    const dx = Math.abs(touch.clientX - touchStart.current.x)
    if (dy > 8 || dx > 8) {
      clearTimeout(longPressTimer.current)
      touchStart.current = null
    }
  }
  function handleTouchEnd(e, questId) {
    clearTimeout(longPressTimer.current)
    if (!longPressFired.current && touchStart.current) handleToggle(questId)
    touchStart.current = null
  }

  function openContextMenu(e, quest) {
    e.preventDefault()
    setContextMenu({ quest, x: e.clientX, y: e.clientY })
  }

  const quickQuests = state.quests.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quote */}
      <div className="pt-1">
        <p className="text-[13px] text-text-secondary leading-relaxed italic">"{quote.text}"</p>
        <p className="text-[11px] text-text-tertiary mt-1.5">— {quote.author}</p>
      </div>

      {/* Character card with pixel avatar */}
      <div className={`bg-bg-card rounded-2xl p-5 ${levelUp ? 'animate-level-up' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <PixelAvatar level={state.character.level} size={56} />
            {/* Level stars decoration */}
            <div className="absolute -top-1 -right-1">
              <PixelStar size={12} color={state.character.level >= 10 ? '#fbbf24' : '#48484a'} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-semibold tracking-tight">{state.character.name}</h2>
              <span className="text-[11px] text-text-secondary bg-bg-elevated px-2 py-0.5 rounded-full font-medium">
                Niv. {state.character.level}
              </span>
            </div>
            <p className="text-[12px] text-text-tertiary mt-0.5">{getTitle(state.character.level)}</p>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-text-tertiary mb-1.5">
                <span>Expérience</span>
                <span className="tabular-nums">{state.character.xp}/{xpNeeded}</span>
              </div>
              <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-xp to-emerald-300 rounded-full animate-xp-fill transition-all duration-700"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-around mt-5 pt-4 border-t border-separator">
          <Stat icon={<Star size={13} strokeWidth={1.5} />} value={state.character.totalXp} label="XP Total" />
          <Stat icon={<Flame size={13} strokeWidth={1.5} />} value={state.character.streak} label="Série" />
          <Stat icon={<Trophy size={13} strokeWidth={1.5} />} value={state.character.bestStreak} label="Record" />
        </div>
      </div>

      {/* Level up */}
      {levelUp && (
        <div className="bg-bg-card rounded-2xl p-4 text-center border border-xp/20 animate-level-up">
          <PixelStar size={20} color="#34d399" />
          <p className="font-semibold text-xp text-sm mt-1">Niveau supérieur !</p>
          <p className="text-[12px] text-text-secondary mt-1">
            Niveau {state.character.level} — {getTitle(state.character.level)}
          </p>
        </div>
      )}

      {/* Grade progress */}
      {(() => {
        const grade = getCurrentGrade(state.character.level)
        const next = getNextGrade(state.character.level)
        return (
          <div className="bg-bg-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ background: grade.pixelColor }} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold" style={{ color: grade.pixelColor }}>{grade.name}</p>
              {next ? (
                <p className="text-[10px] text-text-tertiary mt-0.5">Prochain : {next.name} (Niv. {next.minLevel})</p>
              ) : (
                <p className="text-[10px] text-text-tertiary mt-0.5">Grade maximal atteint</p>
              )}
            </div>
            <Link to="/profile" className="text-[10px] text-text-secondary hover:text-text-primary transition-colors flex items-center gap-0.5">
              Détails <ChevronRight size={12} strokeWidth={1.5} />
            </Link>
          </div>
        )
      })()}

      {/* Quick stats preview */}
      <div className="grid grid-cols-3 gap-2">
        {STAT_TYPES.slice(0, 3).map(s => (
          <div key={s.id} className="bg-bg-card rounded-xl p-3 text-center">
            <p className="text-[16px] font-bold tabular-nums" style={{ color: s.color }}>{Math.floor(state.character.stats?.[s.id] || 1)}</p>
            <p className="text-[9px] text-text-tertiary font-medium mt-0.5">{s.name}</p>
          </div>
        ))}
      </div>

      {/* Daily quests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold tracking-tight">Aujourd'hui</h3>
            <span className="text-[11px] text-text-tertiary tabular-nums">{questsDone}/{totalQuests}</span>
          </div>
          <div className="h-1 w-20 bg-bg-card rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${dayPercent}%`, background: dayPercent === 100 ? '#34d399' : '#ffffff' }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          {quickQuests.map(quest => {
            const done = todayCompleted.includes(quest.id)
            const statInfo = STAT_TYPES.find(s => s.id === quest.stat)
            return (
              <div
                key={quest.id}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-200 select-none ${
                  done ? 'bg-xp-dim' : 'bg-bg-card'
                }`}
                style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                onContextMenu={e => openContextMenu(e, quest)}
                onTouchStart={e => handleTouchStart(e, quest)}
                onTouchEnd={e => handleTouchEnd(e, quest.id)}
                onTouchMove={handleTouchMove}
              >
                <button
                  onClick={() => handleToggle(quest.id)}
                  onTouchStart={e => e.stopPropagation()}
                  className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                    done ? 'bg-xp border-xp' : 'border-text-tertiary'
                  }`}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="animate-check">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <QuestIcon name={quest.icon} size={16} className={done ? 'text-xp' : 'text-text-secondary'} />
                <span className={`flex-1 text-left text-[13px] ${done ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                  {quest.name}
                </span>
                {statInfo && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: statInfo.color + '20', color: statInfo.color }}>
                    {statInfo.name}
                  </span>
                )}
                <span className="text-[11px] text-text-tertiary font-medium tabular-nums">+{quest.xp}</span>
              </div>
            )
          })}
        </div>

        {totalQuests > 5 && (
          <Link to="/quests" className="flex items-center justify-center gap-1 mt-3 text-[12px] text-text-secondary hover:text-text-primary transition-colors">
            Voir tout <ChevronRight size={14} strokeWidth={1.5} />
          </Link>
        )}
      </div>

      {dayPercent === 100 && (
        <div className="bg-bg-card rounded-2xl p-5 text-center border border-xp/10">
          <Zap size={20} className="text-xp mx-auto mb-2" strokeWidth={1.5} />
          <p className="font-semibold text-[14px]">Journée parfaite</p>
          <p className="text-[12px] text-text-tertiary mt-1">Toutes tes quêtes sont accomplies.</p>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (() => {
        const MENU_W = 200, MENU_H = 112
        const left = Math.min(Math.max(contextMenu.x - MENU_W / 2, 8), window.innerWidth - MENU_W - 8)
        const top = Math.max(contextMenu.y - MENU_H - 16, 8)
        return (
          <div
            className="fixed z-50 overflow-hidden animate-fade-in"
            style={{ left, top, width: MENU_W, background: 'rgba(30,30,32,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            onPointerDown={e => e.stopPropagation()}
          >
            <Link
              to="/quests"
              onClick={() => setContextMenu(null)}
              className="w-full flex items-center gap-3.5 px-5 py-4 text-[15px] font-medium text-text-primary active:bg-bg-card-hover transition-colors"
            >
              <Pencil size={18} strokeWidth={1.5} className="text-text-secondary" />
              Modifier
            </Link>
            <div className="h-px bg-separator mx-3" />
            <button
              onClick={() => handleRemove(contextMenu.quest.id)}
              className="w-full flex items-center gap-3.5 px-5 py-4 text-[15px] font-medium text-health active:bg-bg-card-hover transition-colors"
            >
              <Trash2 size={18} strokeWidth={1.5} />
              Supprimer
            </button>
          </div>
        )
      })()}
    </div>
  )
}

function Stat({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 text-text-secondary">
        {icon}
        <span className="text-[14px] font-semibold text-text-primary tabular-nums">{value}</span>
      </div>
      <span className="text-[10px] text-text-tertiary font-medium">{label}</span>
    </div>
  )
}
