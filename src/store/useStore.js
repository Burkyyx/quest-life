const STORAGE_KEY = 'quest-life-data'

const DEFAULT_QUESTS = [
  { id: '1', name: 'Aller au sport', icon: 'dumbbell', xp: 30, category: 'health', stat: 'force' },
  { id: '2', name: 'Prendre ses compléments', icon: 'pill', xp: 10, category: 'health', stat: 'vitalite' },
  { id: '3', name: 'Travailler sur mes projets', icon: 'laptop', xp: 25, category: 'work', stat: 'intelligence' },
  { id: '4', name: 'Lire 20 minutes', icon: 'book-open', xp: 15, category: 'mind', stat: 'sagesse' },
  { id: '5', name: 'Méditer 10 minutes', icon: 'brain', xp: 15, category: 'mind', stat: 'sagesse' },
  { id: '6', name: 'Bien manger', icon: 'apple', xp: 10, category: 'health', stat: 'vitalite' },
  { id: '7', name: 'Se coucher avant minuit', icon: 'moon', xp: 10, category: 'health', stat: 'vitalite' },
  { id: '8', name: 'Pas de réseaux sociaux inutiles', icon: 'shield-off', xp: 20, category: 'discipline', stat: 'discipline' },
]

const QUEST_ICONS = [
  'dumbbell', 'pill', 'laptop', 'book-open', 'brain', 'apple', 'moon',
  'shield-off', 'target', 'pen-line', 'heart', 'flame', 'droplets',
  'sun', 'walk', 'music', 'palette', 'coins', 'clock', 'check-circle',
]

const STAT_TYPES = [
  { id: 'force', name: 'Force', icon: 'dumbbell', color: '#ef4444' },
  { id: 'intelligence', name: 'Intelligence', icon: 'brain', color: '#60a5fa' },
  { id: 'sagesse', name: 'Sagesse', icon: 'book-open', color: '#a78bfa' },
  { id: 'discipline', name: 'Discipline', icon: 'shield', color: '#f59e0b' },
  { id: 'vitalite', name: 'Vitalité', icon: 'heart', color: '#34d399' },
  { id: 'charisme', name: 'Charisme', icon: 'star', color: '#ec4899' },
]

const NOTE_CATEGORIES = [
  { id: 'all', name: 'Toutes', icon: 'layers' },
  { id: 'personal', name: 'Personnel', icon: 'user' },
  { id: 'ideas', name: 'Idées', icon: 'lightbulb' },
  { id: 'journal', name: 'Journal', icon: 'book-open' },
  { id: 'goals', name: 'Objectifs', icon: 'target' },
  { id: 'reflections', name: 'Réflexions', icon: 'brain' },
]

function xpForLevel(level) {
  return Math.floor(100 * Math.pow(1.2, level - 1))
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) { console.error('Failed to load data', e) }
  return null
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }
  catch (e) { console.error('Failed to save data', e) }
}

function createInitialState() {
  return {
    character: {
      name: 'Héros',
      level: 1, xp: 0, totalXp: 0,
      streak: 0, bestStreak: 0,
      stats: { force: 1, intelligence: 1, sagesse: 1, discipline: 1, vitalite: 1, charisme: 1 },
      createdAt: getToday(),
    },
    quests: DEFAULT_QUESTS,
    completedQuests: {},
    notes: [],
    projects: [],
    health: {},
    history: [],
  }
}

function getState() {
  const data = loadData()
  if (!data) return createInitialState()
  // Migrate old data
  if (!data.character.stats) {
    data.character.stats = { force: 1, intelligence: 1, sagesse: 1, discipline: 1, vitalite: 1, charisme: 1 }
  }
  if (!data.projects) data.projects = []
  if (!data.health) data.health = {}
  // Migrate quests: backfill stat from defaults
  data.quests = data.quests.map(q => {
    if (!q.stat) {
      const def = DEFAULT_QUESTS.find(d => d.id === q.id)
      return { ...q, stat: def ? def.stat : 'discipline' }
    }
    return q
  })
  return data
}

function setState(updater) {
  const current = getState()
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
  saveData(next)
  return next
}

function getTodayCompleted() {
  const state = getState()
  return state.completedQuests[getToday()] || []
}

function toggleQuest(questId) {
  return setState(state => {
    const today = getToday()
    const todayCompleted = [...(state.completedQuests[today] || [])]
    const quest = state.quests.find(q => q.id === questId)
    if (!quest) return state

    const wasCompleted = todayCompleted.includes(questId)
    let xpDelta = 0

    if (wasCompleted) {
      todayCompleted.splice(todayCompleted.indexOf(questId), 1)
      xpDelta = -quest.xp
    } else {
      todayCompleted.push(questId)
      xpDelta = quest.xp
    }

    let { xp, totalXp, level, stats } = state.character
    xp += xpDelta
    totalXp += xpDelta
    stats = { ...stats }

    // Stat boost
    const statKey = quest.stat || 'discipline'
    if (!wasCompleted) {
      stats[statKey] = (stats[statKey] || 1) + 0.2
    } else {
      stats[statKey] = Math.max(1, (stats[statKey] || 1) - 0.2)
    }
    // Round stats
    Object.keys(stats).forEach(k => { stats[k] = Math.round(stats[k] * 10) / 10 })

    while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level++ }
    while (xp < 0 && level > 1) { level--; xp += xpForLevel(level) }
    if (xp < 0) xp = 0

    return {
      ...state,
      character: { ...state.character, level, xp, totalXp: Math.max(0, totalXp), stats },
      completedQuests: { ...state.completedQuests, [today]: todayCompleted },
    }
  })
}

function addQuest(name, icon, xp, category, stat) {
  return setState(state => ({
    ...state,
    quests: [...state.quests, {
      id: Date.now().toString(), name, icon: icon || 'target',
      xp: xp || 15, category: category || 'custom', stat: stat || 'discipline',
    }],
  }))
}

function removeQuest(questId) {
  return setState(state => ({ ...state, quests: state.quests.filter(q => q.id !== questId) }))
}

function updateQuest(questId, updates) {
  return setState(state => ({
    ...state,
    quests: state.quests.map(q => q.id === questId ? { ...q, ...updates } : q),
  }))
}

function reorderQuests(fromId, toId) {
  return setState(state => {
    const quests = [...state.quests]
    const fromIdx = quests.findIndex(q => q.id === fromId)
    const toIdx = quests.findIndex(q => q.id === toId)
    if (fromIdx === -1 || toIdx === -1) return state
    const [removed] = quests.splice(fromIdx, 1)
    quests.splice(toIdx, 0, removed)
    return { ...state, quests }
  })
}

// Notes
function addNote(title, content, category) {
  return setState(state => ({
    ...state,
    notes: [{ id: Date.now().toString(), title: title || 'Sans titre', content: content || '',
      category: category || 'personal', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }, ...state.notes],
  }))
}

function updateNote(noteId, updates) {
  return setState(state => ({
    ...state,
    notes: state.notes.map(n => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
  }))
}

function deleteNote(noteId) {
  return setState(state => ({ ...state, notes: state.notes.filter(n => n.id !== noteId) }))
}

// Projects
function addProject(name, description, milestones) {
  return setState(state => ({
    ...state,
    projects: [...state.projects, {
      id: Date.now().toString(), name, description: description || '',
      milestones: (milestones || []).map((m, i) => ({ id: `${Date.now()}-${i}`, name: m, completed: false })),
      xpReward: 50, completed: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }],
  }))
}

function updateProject(projectId, updates) {
  return setState(state => ({
    ...state,
    projects: state.projects.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p),
  }))
}

function toggleMilestone(projectId, milestoneId) {
  return setState(state => {
    const project = state.projects.find(p => p.id === projectId)
    if (!project) return state
    const milestones = project.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    )
    const allDone = milestones.length > 0 && milestones.every(m => m.completed)

    let { xp, totalXp, level, stats } = state.character
    // If project just completed, grant XP
    if (allDone && !project.completed) {
      xp += project.xpReward || 50
      totalXp += project.xpReward || 50
      stats = { ...stats }
      stats.intelligence = (stats.intelligence || 1) + 1
      while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level++ }
    }

    return {
      ...state,
      character: { ...state.character, xp, totalXp, level, stats },
      projects: state.projects.map(p =>
        p.id === projectId ? { ...p, milestones, completed: allDone, updatedAt: new Date().toISOString() } : p
      ),
    }
  })
}

function deleteProject(projectId) {
  return setState(state => ({ ...state, projects: state.projects.filter(p => p.id !== projectId) }))
}

// Health logging
function logHealth(date, data) {
  return setState(state => ({
    ...state,
    health: { ...state.health, [date]: { ...(state.health[date] || {}), ...data } },
  }))
}

function updateCharacter(updates) {
  return setState(state => ({ ...state, character: { ...state.character, ...updates } }))
}

function saveDayHistory() {
  return setState(state => {
    const today = getToday()
    const todayCompleted = state.completedQuests[today] || []
    const xpEarned = todayCompleted.reduce((sum, qId) => {
      const quest = state.quests.find(q => q.id === qId)
      return sum + (quest ? quest.xp : 0)
    }, 0)

    const existingIndex = state.history.findIndex(h => h.date === today)
    const entry = { date: today, xpEarned, questsCompleted: todayCompleted.length, totalQuests: state.quests.length }
    const history = [...state.history]
    if (existingIndex >= 0) { history[existingIndex] = entry } else { history.push(entry) }

    let streak = state.character.streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const yesterdayCompleted = state.completedQuests[yesterday] || []
    if (todayCompleted.length > 0 && todayCompleted.length >= Math.ceil(state.quests.length / 2)) {
      if (yesterdayCompleted.length >= Math.ceil(state.quests.length / 2) || streak === 0) streak++
    }

    return {
      ...state, history: history.slice(-90),
      character: { ...state.character, streak, bestStreak: Math.max(state.character.bestStreak, streak) },
    }
  })
}

function getTitle(level) {
  if (level < 5) return 'Apprenti Stoïcien'
  if (level < 10) return 'Disciple de la Vertu'
  if (level < 15) return 'Gardien de la Discipline'
  if (level < 20) return 'Chevalier de la Sagesse'
  if (level < 30) return 'Maître de la Volonté'
  if (level < 40) return 'Sage Philosophe'
  if (level < 50) return 'Légende Stoïque'
  return 'Empereur de la Vertu'
}

function getWeekHistory() {
  const state = getState()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
    const completed = state.completedQuests[date] || []
    const xp = completed.reduce((sum, qId) => {
      const quest = state.quests.find(q => q.id === qId)
      return sum + (quest ? quest.xp : 0)
    }, 0)
    days.push({
      date, label: new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' }),
      questsCompleted: completed.length, totalQuests: state.quests.length, xp,
    })
  }
  return days
}

// Calendar data for the month
function getMonthCalendar(year, month) {
  const state = getState()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  // Pad start
  const startDow = (firstDay.getDay() + 6) % 7 // Monday = 0
  for (let i = 0; i < startDow; i++) days.push(null)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const completed = state.completedQuests[date] || []
    const total = state.quests.length
    const ratio = total > 0 ? completed.length / total : 0
    days.push({ date, day: d, completed: completed.length, total, ratio })
  }
  return days
}

export {
  getState, setState, getToday, getTodayCompleted, toggleQuest,
  addQuest, removeQuest, updateQuest, reorderQuests, addNote, updateNote, deleteNote,
  addProject, updateProject, toggleMilestone, deleteProject,
  logHealth, updateCharacter, saveDayHistory,
  getTitle, getWeekHistory, getMonthCalendar, xpForLevel,
  DEFAULT_QUESTS, QUEST_ICONS, NOTE_CATEGORIES, STAT_TYPES,
}
