import { useState } from 'react'
import { Plus, Trash2, ArrowLeft, ChevronDown, User, Lightbulb, BookOpen, Target, Brain, Layers, Search, SortDesc } from 'lucide-react'
import { getState, addNote, updateNote, deleteNote, NOTE_CATEGORIES } from '../store/useStore'

const ICON_MAP = {
  'layers': Layers,
  'user': User,
  'lightbulb': Lightbulb,
  'book-open': BookOpen,
  'target': Target,
  'brain': Brain,
}

function CatIcon({ name, size = 14 }) {
  const Icon = ICON_MAP[name] || Layers
  return <Icon size={size} strokeWidth={1.5} />
}

export default function Notes() {
  const [state, setLocalState] = useState(getState)
  const [editingNote, setEditingNote] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [noteCategory, setNoteCategory] = useState('personal')
  const [filterCat, setFilterCat] = useState('all')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest
  const [searchQuery, setSearchQuery] = useState('')

  function handleNew() {
    const newState = addNote('', '', filterCat === 'all' ? 'personal' : filterCat)
    setLocalState({ ...newState })
    const note = newState.notes[0]
    setEditingNote(note.id)
    setTitle('')
    setContent('')
    setNoteCategory(note.category)
  }

  function handleEdit(note) {
    setEditingNote(note.id)
    setTitle(note.title)
    setContent(note.content)
    setNoteCategory(note.category || 'personal')
  }

  function handleSave() {
    if (!editingNote) return
    const newState = updateNote(editingNote, { title: title || 'Sans titre', content, category: noteCategory })
    setLocalState({ ...newState })
    setEditingNote(null)
  }

  function handleDelete(noteId) {
    const newState = deleteNote(noteId)
    setLocalState({ ...newState })
    if (editingNote === noteId) setEditingNote(null)
  }

  // Filter and sort
  let filteredNotes = state.notes
  if (filterCat !== 'all') {
    filteredNotes = filteredNotes.filter(n => n.category === filterCat)
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredNotes = filteredNotes.filter(n =>
      (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
    )
  }
  filteredNotes = [...filteredNotes].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt)
    const dateB = new Date(b.updatedAt || b.createdAt)
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB
  })

  // Group by date
  const grouped = {}
  filteredNotes.forEach(note => {
    const date = new Date(note.updatedAt || note.createdAt)
    const key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(note)
  })

  // Edit view
  if (editingNote) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <span className="flex-1 text-[13px] text-text-tertiary">Édition</span>
          <button
            onClick={handleSave}
            className="pill bg-text-primary text-bg-primary font-semibold text-[12px] hover:opacity-90 transition-all"
          >
            Enregistrer
          </button>
        </div>

        {/* Category selector */}
        <div className="flex gap-1.5 flex-wrap">
          {NOTE_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
            <button
              key={cat.id}
              onClick={() => setNoteCategory(cat.id)}
              className={`pill flex items-center gap-1.5 text-[11px] transition-all ${
                noteCategory === cat.id
                  ? 'bg-text-primary text-bg-primary'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary'
              }`}
            >
              <CatIcon name={cat.icon} size={12} />
              {cat.name}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Titre"
          className="w-full bg-transparent text-text-primary text-[20px] font-semibold tracking-tight px-0 py-2 border-0 outline-none placeholder:text-text-tertiary"
          autoFocus
        />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Commence à écrire..."
          rows={18}
          className="w-full bg-transparent text-text-primary/90 px-0 py-0 border-0 outline-none text-[14px] leading-relaxed resize-none placeholder:text-text-tertiary"
        />
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold tracking-tight">Notes</h1>
        <button
          onClick={handleNew}
          className="pill bg-text-primary text-bg-primary font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={2} />
          Nouvelle
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-bg-card text-text-primary pl-9 pr-3 py-2.5 rounded-xl outline-none text-[13px] placeholder:text-text-tertiary transition-colors focus:bg-bg-card-hover"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {NOTE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`pill flex items-center gap-1.5 text-[11px] whitespace-nowrap transition-all shrink-0 ${
              filterCat === cat.id
                ? 'bg-text-primary text-bg-primary'
                : 'bg-bg-card text-text-secondary hover:text-text-primary'
            }`}
          >
            <CatIcon name={cat.icon} size={12} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-text-tertiary font-medium">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setSortBy(s => s === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <SortDesc size={12} strokeWidth={1.5} />
          {sortBy === 'newest' ? 'Plus récentes' : 'Plus anciennes'}
        </button>
      </div>

      {/* Notes list */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[13px] text-text-tertiary">Aucune note</p>
          <p className="text-[11px] text-text-tertiary mt-1">Appuie sur "Nouvelle" pour commencer</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateLabel, notes]) => (
          <div key={dateLabel}>
            <p className="text-[11px] text-text-tertiary font-medium mb-2">{dateLabel}</p>
            <div className="space-y-1.5">
              {notes.map(note => {
                const cat = NOTE_CATEGORIES.find(c => c.id === note.category)
                return (
                  <div
                    key={note.id}
                    onClick={() => handleEdit(note)}
                    className="bg-bg-card rounded-2xl p-4 cursor-pointer card-hover group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {cat && (
                            <span className="text-text-tertiary">
                              <CatIcon name={cat.icon} size={12} />
                            </span>
                          )}
                          <h3 className="text-[13px] font-semibold truncate">{note.title || 'Sans titre'}</h3>
                        </div>
                        {note.content && (
                          <p className="text-[12px] text-text-tertiary line-clamp-2 leading-relaxed">{note.content}</p>
                        )}
                        <p className="text-[10px] text-text-tertiary/60 mt-2">
                          {new Date(note.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(note.id) }}
                        className="text-text-tertiary hover:text-health transition-colors p-1 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
