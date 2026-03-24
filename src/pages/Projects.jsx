import { useState } from 'react'
import { Plus, Trash2, X, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { PixelStar } from '../components/PixelAvatar'
import { getState, addProject, toggleMilestone, deleteProject } from '../store/useStore'

export default function Projects() {
  const [state, setLocalState] = useState(getState)
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
    const newState = addProject(newName.trim(), newDesc.trim(), milestones)
    setLocalState({ ...newState })
    setNewName('')
    setNewDesc('')
    setNewMilestones([''])
    setShowAdd(false)
  }

  function handleToggleMilestone(projectId, milestoneId) {
    const newState = toggleMilestone(projectId, milestoneId)
    setLocalState({ ...newState })
  }

  function handleDelete(projectId) {
    const newState = deleteProject(projectId)
    setLocalState({ ...newState })
  }

  function addMilestoneField() {
    setNewMilestones([...newMilestones, ''])
  }

  function updateMilestoneField(index, value) {
    const updated = [...newMilestones]
    updated[index] = value
    setNewMilestones(updated)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold tracking-tight">Projets</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="pill bg-text-primary text-bg-primary font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={2} />
          Nouveau
        </button>
      </div>

      {/* Add form */}
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
                  onChange={e => updateMilestoneField(i, e.target.value)}
                  className="w-full bg-bg-elevated text-text-primary px-3.5 py-2 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors"
                />
              ))}
            </div>
            <button
              onClick={addMilestoneField}
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

      {/* Active projects */}
      {active.length === 0 && completed.length === 0 && !showAdd && (
        <div className="text-center py-16">
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
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Circular progress */}
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

        {project.completed && (
          <div className="mr-1">
            <PixelStar size={16} color="#34d399" />
          </div>
        )}

        {expanded ? <ChevronUp size={14} className="text-text-tertiary" strokeWidth={1.5} /> : <ChevronDown size={14} className="text-text-tertiary" strokeWidth={1.5} />}
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
