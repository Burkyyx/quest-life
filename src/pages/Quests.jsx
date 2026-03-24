import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, Trash2, X, Trophy, ChevronDown, ChevronUp, GripVertical, Pencil, ArrowUpDown } from 'lucide-react'
import QuestIcon from '../components/QuestIcon'
import { PixelStar } from '../components/PixelAvatar'
import {
  getState, toggleQuest, addQuest, removeQuest, updateQuest, reorderQuests, saveDayHistory,
  addProject, toggleMilestone, deleteProject,
  QUEST_ICONS, STAT_TYPES
} from '../store/useStore'

const CATEGORIES = {
  health: { label: 'Santé', color: 'text-red-400' },
  work: { label: 'Travail', color: 'text-blue-400' },
  mind: { label: 'Esprit', color: 'text-purple-400' },
  discipline: { label: 'Discipline', color: 'text-orange-400' },
  custom: { label: 'Perso', color: 'text-text-secondary' },
}

export default function Quests() {
  const [state, setLocalState] = useState(getState)
  const [tab, setTab] = useState('quests') // 'quests' | 'projects'

  function refresh() { setLocalState({ ...getState() }) }

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-[20px] font-semibold tracking-tight">Quêtes & Projets</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-bg-card rounded-xl p-1">
        <TabBtn active={tab === 'quests'} onClick={() => setTab('quests')}>Quêtes</TabBtn>
        <TabBtn active={tab === 'projects'} onClick={() => setTab('projects')}>Projets</TabBtn>
      </div>

      {tab === 'quests' ? (
        <QuestsTab state={state} refresh={refresh} />
      ) : (
        <ProjectsTab state={state} refresh={refresh} />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
        active
          ? 'bg-bg-elevated text-text-primary shadow-sm'
          : 'text-text-tertiary hover:text-text-secondary'
      }`}
    >
      {children}
    </button>
  )
}

/* ============ QUESTS TAB ============ */
function QuestsTab({ state, refresh }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('target')
  const [newXp, setNewXp] = useState(15)
  const [newCategory, setNewCategory] = useState('custom')
  const [newStat, setNewStat] = useState('discipline')

  // Context menu
  const [contextMenu, setContextMenu] = useState(null) // { quest, x, y }
  const [pressedId, setPressedId] = useState(null)
  const longPressTimer = useRef(null)
  const longPressFired = useRef(false)
  const touchStart = useRef(null) // { x, y }

  // Edit modal
  const [editState, setEditState] = useState(null)

  // Sort / drag state
  const [sortMode, setSortMode] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const todayCompleted = state.completedQuests[today] || []

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [contextMenu])

  function handleToggle(questId) {
    if (navigator.vibrate) navigator.vibrate(10)
    setPressedId(questId)
    setTimeout(() => setPressedId(null), 280)
    toggleQuest(questId)
    saveDayHistory()
    refresh()
  }

  function handleAdd() {
    if (!newName.trim()) return
    addQuest(newName.trim(), newIcon, newXp, newCategory, newStat)
    refresh()
    setNewName('')
    setNewIcon('target')
    setNewXp(15)
    setShowAdd(false)
  }

  function handleRemove(questId) {
    setContextMenu(null)
    removeQuest(questId)
    refresh()
  }

  function openContextMenu(e, quest) {
    e.preventDefault()
    e.stopPropagation()
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    setContextMenu({ quest, x, y })
  }

  // Long press + scroll detection for touch
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
    // If finger moved → it's a scroll, cancel everything
    if (dy > 8 || dx > 8) {
      clearTimeout(longPressTimer.current)
      touchStart.current = null
    }
  }
  function handleTouchEnd(e, questId) {
    clearTimeout(longPressTimer.current)
    // Only toggle if it was a real tap (finger didn't scroll) and long press didn't fire
    if (!longPressFired.current && touchStart.current && !sortMode) {
      handleToggle(questId)
    }
    touchStart.current = null
  }

  function openEdit(quest) {
    setContextMenu(null)
    setEditState({ id: quest.id, name: quest.name, icon: quest.icon, xp: quest.xp, category: quest.category, stat: quest.stat })
  }

  function saveEdit() {
    updateQuest(editState.id, { name: editState.name, icon: editState.icon, xp: editState.xp, category: editState.category, stat: editState.stat })
    refresh()
    setEditState(null)
  }

  // Drag reorder (mouse + touch)
  const dragListeners = useRef([])
  function startDrag(e, questId) {
    if (e.type === 'mousedown') e.preventDefault()
    setDragId(questId)
    setDragOverId(questId)

    function getY(ev) { return ev.touches ? ev.touches[0].clientY : ev.clientY }

    function onMove(ev) {
      const y = getY(ev)
      const items = document.querySelectorAll('[data-quest-id]')
      items.forEach(el => {
        const rect = el.getBoundingClientRect()
        if (y >= rect.top && y <= rect.bottom) setDragOverId(el.dataset.questId)
      })
    }
    function onEnd(ev) {
      const y = ev.changedTouches ? ev.changedTouches[0].clientY : ev.clientY
      let targetId = null
      const items = document.querySelectorAll('[data-quest-id]')
      items.forEach(el => {
        const rect = el.getBoundingClientRect()
        if (y >= rect.top && y <= rect.bottom) targetId = el.dataset.questId
      })
      if (targetId && targetId !== questId) {
        reorderQuests(questId, targetId)
        refresh()
      }
      setDragId(null)
      setDragOverId(null)
      dragListeners.current.forEach(([ev, fn]) => document.removeEventListener(ev, fn))
      dragListeners.current = []
    }

    const pairs = [['mousemove', onMove], ['touchmove', onMove], ['mouseup', onEnd], ['touchend', onEnd]]
    dragListeners.current = pairs
    pairs.forEach(([ev, fn]) => document.addEventListener(ev, fn, { passive: true }))
  }

  const grouped = {}
  state.quests.forEach(q => {
    const cat = q.category || 'custom'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(q)
  })

  return (
    <div className="space-y-5 animate-fade-in" onClick={() => contextMenu && setContextMenu(null)}>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => setSortMode(v => !v)}
          className={`pill flex items-center gap-1.5 transition-all ${
            sortMode ? 'bg-text-primary text-bg-primary' : 'bg-bg-card text-text-secondary hover:text-text-primary'
          }`}
        >
          <ArrowUpDown size={13} strokeWidth={2} />
          Trier
        </button>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="pill bg-text-primary text-bg-primary font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={2} />
          Ajouter
        </button>
      </div>

      {sortMode && (
        <p className="text-[11px] text-text-tertiary text-center -mt-2">
          Maintiens le ≡ et glisse pour réorganiser
        </p>
      )}

      {showAdd && (
        <div className="bg-bg-card rounded-2xl p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">Nouvelle quête</span>
            <button onClick={() => setShowAdd(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Nom de la quête..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full bg-bg-elevated text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors"
            autoFocus
          />
          <div>
            <p className="text-[11px] text-text-tertiary mb-2 font-medium">Icône</p>
            <div className="flex flex-wrap gap-1.5">
              {QUEST_ICONS.map(icon => (
                <button key={icon} onClick={() => setNewIcon(icon)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${newIcon === icon ? 'bg-text-primary text-bg-primary' : 'bg-bg-elevated text-text-secondary hover:bg-bg-card-hover'}`}>
                  <QuestIcon name={icon} size={16} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-text-tertiary mb-2 font-medium">XP</p>
              <input type="number" value={newXp} onChange={e => setNewXp(Number(e.target.value))} min={5} max={100}
                className="w-full bg-bg-elevated text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-text-tertiary mb-2 font-medium">Catégorie</p>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                className="w-full bg-bg-elevated text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors">
                {Object.entries(CATEGORIES).map(([key, cat]) => <option key={key} value={key}>{cat.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-text-tertiary mb-2 font-medium">Stat associée</p>
            <div className="flex flex-wrap gap-1.5">
              {STAT_TYPES.map(stat => (
                <button key={stat.id} onClick={() => setNewStat(stat.id)}
                  className={`pill text-[11px] transition-all ${newStat === stat.id ? 'text-bg-primary font-semibold' : 'bg-bg-elevated text-text-secondary'}`}
                  style={newStat === stat.id ? { background: stat.color } : {}}>
                  {stat.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAdd} className="w-full bg-text-primary text-bg-primary py-2.5 rounded-xl font-semibold text-[13px] hover:opacity-90 active:scale-[0.98] transition-all">
            Créer
          </button>
        </div>
      )}

      {/* Quest list — flat in sort mode, grouped otherwise */}
      {sortMode ? (
        <div className="space-y-1.5">
          {state.quests.map(quest => {
            const isDragging = dragId === quest.id
            const isOver = dragOverId === quest.id && dragId !== quest.id
            return (
              <div
                key={quest.id}
                data-quest-id={quest.id}
                className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-150 bg-bg-card select-none ${
                  isDragging ? 'opacity-40 scale-[0.98]' : ''
                } ${isOver ? 'ring-1 ring-white/20 translate-y-[-2px]' : ''}`}
              >
                <div
                  onMouseDown={e => startDrag(e, quest.id)}
                  onTouchStart={e => startDrag(e, quest.id)}
                  className="text-text-tertiary cursor-grab active:cursor-grabbing touch-none p-1 -ml-1"
                >
                  <GripVertical size={16} strokeWidth={1.5} />
                </div>
                <QuestIcon name={quest.icon} size={16} className="text-text-secondary" />
                <span className="flex-1 text-[13px]">{quest.name}</span>
                <StatBadge statId={quest.stat} />
                <span className="text-[11px] text-text-tertiary font-medium tabular-nums">+{quest.xp}</span>
              </div>
            )
          })}
        </div>
      ) : (
        Object.entries(grouped).map(([catKey, quests]) => {
          const cat = CATEGORIES[catKey] || CATEGORIES.custom
          return (
            <div key={catKey}>
              <h3 className={`text-[11px] font-semibold mb-2 uppercase tracking-wider ${cat.color}`}>{cat.label}</h3>
              <div className="space-y-1.5">
                {quests.map(quest => {
                  const done = todayCompleted.includes(quest.id)
                  return (
                    <div
                      key={quest.id}
                      data-quest-id={quest.id}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl transition-colors duration-200 select-none ${done ? 'bg-xp-dim' : 'bg-bg-card'} ${pressedId === quest.id ? 'animate-quest-tap' : ''}`}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                      onContextMenu={e => openContextMenu(e, quest)}
                      onTouchStart={e => handleTouchStart(e, quest)}
                      onTouchEnd={e => handleTouchEnd(e, quest.id)}
                      onTouchMove={handleTouchMove}
                    >
                      <button
                        onClick={() => handleToggle(quest.id)}
                        onTouchStart={e => e.stopPropagation()}
                        className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-xp border-xp' : 'border-text-tertiary hover:border-text-secondary'}`}
                      >
                        {done && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="animate-check">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <QuestIcon name={quest.icon} size={16} className={done ? 'text-xp' : 'text-text-secondary'} />
                      <span className={`flex-1 text-[13px] ${done ? 'line-through text-text-tertiary' : ''}`}>{quest.name}</span>
                      <StatBadge statId={quest.stat} />
                      <span className="text-[11px] text-text-tertiary font-medium tabular-nums">+{quest.xp}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}

      {/* Floating context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => openEdit(contextMenu.quest)}
          onDelete={() => handleRemove(contextMenu.quest.id)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Edit modal */}
      {editState && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pt-4 pb-24 bg-black/60 animate-fade-in" onClick={() => setEditState(null)}>
          <div className="bg-bg-elevated rounded-2xl p-5 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold">Modifier la quête</span>
              <button onClick={() => setEditState(null)} className="text-text-tertiary hover:text-text-primary transition-colors">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
            <input
              type="text"
              value={editState.name}
              onChange={e => setEditState(s => ({ ...s, name: e.target.value }))}
              className="w-full bg-bg-card text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors"
              autoFocus
            />
            <div>
              <p className="text-[11px] text-text-tertiary mb-2 font-medium">Icône</p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {QUEST_ICONS.map(icon => (
                  <button key={icon} onClick={() => setEditState(s => ({ ...s, icon }))}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${editState.icon === icon ? 'bg-text-primary text-bg-primary' : 'bg-bg-card text-text-secondary hover:bg-bg-card-hover'}`}>
                    <QuestIcon name={icon} size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-[11px] text-text-tertiary mb-2 font-medium">XP</p>
                <input type="number" value={editState.xp} min={5} max={100}
                  onChange={e => setEditState(s => ({ ...s, xp: Number(e.target.value) }))}
                  className="w-full bg-bg-card text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-text-tertiary mb-2 font-medium">Catégorie</p>
                <select value={editState.category} onChange={e => setEditState(s => ({ ...s, category: e.target.value }))}
                  className="w-full bg-bg-card text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors">
                  {Object.entries(CATEGORIES).map(([key, cat]) => <option key={key} value={key}>{cat.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-text-tertiary mb-2 font-medium">Stat associée</p>
              <div className="flex flex-wrap gap-1.5">
                {STAT_TYPES.map(stat => (
                  <button key={stat.id} onClick={() => setEditState(s => ({ ...s, stat: stat.id }))}
                    className={`pill text-[11px] transition-all ${editState.stat === stat.id ? 'text-bg-primary font-semibold' : 'bg-bg-card text-text-secondary'}`}
                    style={editState.stat === stat.id ? { background: stat.color } : {}}>
                    {stat.name}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={saveEdit} className="w-full bg-text-primary text-bg-primary py-2.5 rounded-xl font-semibold text-[13px] hover:opacity-90 active:scale-[0.98] transition-all">
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ContextMenu({ x, y, onEdit, onDelete, onClose }) {
  const MENU_W = 200
  const MENU_H = 112 // ~2 rows × 56px
  const left = Math.min(Math.max(x - MENU_W / 2, 8), window.innerWidth - MENU_W - 8)
  const top = Math.max(y - MENU_H - 16, 8) // above the finger
  return (
    <div
      className="fixed z-50 overflow-hidden animate-fade-in"
      style={{
        left,
        top,
        width: MENU_W,
        background: 'rgba(30,30,32,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      <button
        onClick={onEdit}
        className="w-full flex items-center gap-3.5 px-5 py-4 text-[15px] font-medium text-text-primary active:bg-bg-card-hover transition-colors"
      >
        <Pencil size={18} strokeWidth={1.5} className="text-text-secondary" />
        Modifier
      </button>
      <div className="h-px bg-separator mx-3" />
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-3.5 px-5 py-4 text-[15px] font-medium text-health active:bg-bg-card-hover transition-colors"
      >
        <Trash2 size={18} strokeWidth={1.5} />
        Supprimer
      </button>
    </div>
  )
}

function StatBadge({ statId }) {
  if (!statId) return null
  const statInfo = STAT_TYPES.find(s => s.id === statId)
  if (!statInfo) return null
  return (
    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: statInfo.color + '20', color: statInfo.color }}>
      {statInfo.name}
    </span>
  )
}

/* ============ PROJECTS TAB ============ */
function ProjectsTab({ state, refresh }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newMilestones, setNewMilestones] = useState([''])
  const [expandedId, setExpandedId] = useState(null)

  const active = state.projects.filter(p => !p.completed)
  const completed = state.projects.filter(p => p.completed)

  function handleAdd() {
    if (!newName.trim()) return
    const milestones = newMilestones.filter(m => m.trim())
    if (milestones.length === 0) return
    addProject(newName.trim(), newDesc.trim(), milestones)
    refresh()
    setNewName('')
    setNewDesc('')
    setNewMilestones([''])
    setShowAdd(false)
  }

  function handleToggleMilestone(projectId, milestoneId) {
    toggleMilestone(projectId, milestoneId)
    refresh()
  }

  function handleDelete(projectId) {
    deleteProject(projectId)
    refresh()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="pill bg-text-primary text-bg-primary font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={2} />
          Nouveau
        </button>
      </div>

      {showAdd && (
        <div className="bg-bg-card rounded-2xl p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">Nouveau projet</span>
            <button onClick={() => setShowAdd(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Nom du projet..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full bg-bg-elevated text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors"
            autoFocus
          />

          <textarea
            placeholder="Description (optionnel)..."
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            rows={2}
            className="w-full bg-bg-elevated text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] resize-none transition-colors"
          />

          <div>
            <p className="text-[11px] text-text-tertiary mb-2 font-medium">Étapes / Milestones</p>
            <div className="space-y-1.5">
              {newMilestones.map((m, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Étape ${i + 1}...`}
                  value={m}
                  onChange={e => {
                    const updated = [...newMilestones]
                    updated[i] = e.target.value
                    setNewMilestones(updated)
                  }}
                  className="w-full bg-bg-elevated text-text-primary px-3.5 py-2 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors"
                />
              ))}
            </div>
            <button
              onClick={() => setNewMilestones([...newMilestones, ''])}
              className="text-[11px] text-text-secondary mt-2 hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <Plus size={12} strokeWidth={1.5} /> Ajouter une étape
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-text-primary text-bg-primary py-2.5 rounded-xl font-semibold text-[13px] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Créer le projet
          </button>
        </div>
      )}

      {active.length === 0 && completed.length === 0 && !showAdd && (
        <div className="text-center py-12">
          <p className="text-[13px] text-text-tertiary">Aucun projet</p>
          <p className="text-[11px] text-text-tertiary mt-1">Crée ton premier projet pour commencer</p>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">En cours</h3>
          <div className="space-y-2">
            {active.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                expanded={expandedId === project.id}
                onToggleExpand={() => setExpandedId(expandedId === project.id ? null : project.id)}
                onToggleMilestone={(mId) => handleToggleMilestone(project.id, mId)}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">Terminés</h3>
          <div className="space-y-2">
            {completed.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                expanded={expandedId === project.id}
                onToggleExpand={() => setExpandedId(expandedId === project.id ? null : project.id)}
                onToggleMilestone={(mId) => handleToggleMilestone(project.id, mId)}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project, expanded, onToggleExpand, onToggleMilestone, onDelete }) {
  const done = project.milestones.filter(m => m.completed).length
  const total = project.milestones.length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className={`bg-bg-card rounded-2xl overflow-hidden transition-all ${project.completed ? 'opacity-60' : ''}`}>
      <button onClick={onToggleExpand} className="w-full p-4 flex items-center gap-3 text-left">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" className="absolute">
            <circle cx="20" cy="20" r="17" fill="none" stroke="#1d1d1f" strokeWidth="2.5" />
            <circle
              cx="20" cy="20" r="17" fill="none"
              stroke={project.completed ? '#34d399' : '#f5f5f7'}
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 17}`}
              strokeDashoffset={`${2 * Math.PI * 17 * (1 - percent / 100)}`}
              transform="rotate(-90 20 20)"
              className="transition-all duration-500"
            />
          </svg>
          <span className="text-[10px] font-bold tabular-nums">{percent}%</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold truncate">{project.name}</h4>
          <p className="text-[11px] text-text-tertiary">{done}/{total} étapes</p>
        </div>

        {project.completed && <PixelStar size={16} color="#34d399" />}
        {expanded
          ? <ChevronUp size={14} className="text-text-tertiary" strokeWidth={1.5} />
          : <ChevronDown size={14} className="text-text-tertiary" strokeWidth={1.5} />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          {project.description && (
            <p className="text-[12px] text-text-secondary mb-3 leading-relaxed">{project.description}</p>
          )}

          <div className="space-y-1.5">
            {project.milestones.map(milestone => (
              <button
                key={milestone.id}
                onClick={() => onToggleMilestone(milestone.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  milestone.completed ? 'bg-xp-dim' : 'bg-bg-elevated hover:bg-bg-card-hover'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                  milestone.completed ? 'bg-xp border-xp' : 'border-text-tertiary'
                }`}>
                  {milestone.completed && (
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`text-[12px] ${milestone.completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                  {milestone.name}
                </span>
              </button>
            ))}
          </div>

          {project.completed && (
            <div className="mt-3 pt-3 border-t border-separator flex items-center gap-2">
              <Trophy size={13} strokeWidth={1.5} className="text-xp" />
              <span className="text-[11px] text-xp font-medium">+{project.xpReward || 50} XP gagnés</span>
            </div>
          )}

          <button
            onClick={onDelete}
            className="mt-3 text-[11px] text-text-tertiary hover:text-health transition-colors flex items-center gap-1"
          >
            <Trash2 size={11} strokeWidth={1.5} /> Supprimer
          </button>
        </div>
      )}
    </div>
  )
}
