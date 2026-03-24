import { useState, useEffect } from 'react'
import { Sun, Moon, RotateCcw, User, Palette, Info, ChevronRight, Check } from 'lucide-react'
import { getSettings, updateSettings, applyTheme } from '../store/useSettings'
import { getState, updateCharacter } from '../store/useStore'
import { version } from '../../package.json'

export default function Settings() {
  const [currentTheme, setCurrentTheme] = useState(() => getSettings().theme)
  const [characterName, setCharacterName] = useState(() => getState().character?.name || '')
  const [originalName] = useState(() => getState().character?.name || '')
  const [nameSaved, setNameSaved] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const nameChanged = characterName !== originalName && !nameSaved

  function handleTheme(theme) {
    updateSettings({ theme })
    applyTheme(theme)
    setCurrentTheme(theme)
  }

  function handleSaveName() {
    updateCharacter({ name: characterName })
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  function handleExport() {
    const data = localStorage.getItem('quest-life-data')
    if (!data) return
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quest-life-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    localStorage.removeItem('quest-life-data')
    window.location.reload()
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Apparence */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">Apparence</h3>
        <div className="bg-bg-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            {currentTheme === 'dark' ? (
              <Moon size={16} strokeWidth={1.5} className="text-text-secondary flex-shrink-0" />
            ) : (
              <Sun size={16} strokeWidth={1.5} className="text-text-secondary flex-shrink-0" />
            )}
            <span className="text-[13px] font-medium flex-1">Thème</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTheme === 'dark'
                  ? 'bg-text-primary text-bg-primary'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              <Moon size={13} strokeWidth={1.5} />
              Sombre
              {currentTheme === 'dark' && <Check size={12} strokeWidth={2.5} />}
            </button>
            <button
              onClick={() => handleTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                currentTheme === 'light'
                  ? 'bg-text-primary text-bg-primary'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sun size={13} strokeWidth={1.5} />
              Clair
              {currentTheme === 'light' && <Check size={12} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Personnage */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">Personnage</h3>
        <div className="bg-bg-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <User size={16} strokeWidth={1.5} className="text-text-secondary flex-shrink-0" />
            <span className="text-[13px] font-medium">Nom du personnage</span>
          </div>
          <input
            type="text"
            value={characterName}
            onChange={e => { setCharacterName(e.target.value); setNameSaved(false) }}
            placeholder="Ton nom de héros..."
            className="w-full bg-bg-elevated text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors"
          />
          {(nameChanged || nameSaved) && (
            <button
              onClick={handleSaveName}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all active:scale-[0.98] ${
                nameSaved
                  ? 'bg-xp/20 text-xp'
                  : 'bg-text-primary text-bg-primary hover:opacity-90'
              }`}
            >
              {nameSaved ? (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  Sauvegardé
                </>
              ) : (
                'Sauvegarder'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Données */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">Données</h3>
        <div className="bg-bg-card rounded-2xl p-4 space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between py-2.5 px-1 text-[13px] font-medium hover:text-text-secondary transition-colors active:scale-[0.99]"
          >
            <span>Exporter mes données</span>
            <ChevronRight size={15} strokeWidth={1.5} className="text-text-tertiary" />
          </button>

          <div className="h-px bg-separator" />

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center justify-between py-2.5 px-1 text-[13px] font-medium text-health hover:opacity-80 transition-all active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <RotateCcw size={14} strokeWidth={1.5} />
                Réinitialiser
              </span>
              <ChevronRight size={15} strokeWidth={1.5} className="opacity-60" />
            </button>
          ) : (
            <div className="space-y-2 pt-1">
              <p className="text-[12px] text-text-secondary leading-relaxed">
                Toutes tes données seront supprimées. Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-bg-elevated text-text-secondary text-[13px] font-medium hover:text-text-primary transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-health/15 text-health text-[13px] font-semibold hover:bg-health/25 transition-colors active:scale-[0.98]"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* À propos */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">À propos</h3>
        <div className="bg-bg-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center flex-shrink-0">
            <Info size={18} strokeWidth={1.5} className="text-text-secondary" />
          </div>
          <div>
            <p className="text-[14px] font-semibold">Quest Life</p>
            <p className="text-[11px] text-text-tertiary">Transforme ta vie en RPG</p>
            <p className="text-[10px] text-text-tertiary mt-0.5">Version {version}</p>
          </div>
        </div>
      </div>

    </div>
  )
}
