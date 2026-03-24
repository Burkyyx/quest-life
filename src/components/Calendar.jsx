import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthCalendar } from '../store/useStore'

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function Calendar({ onSelectDate }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(null)

  const days = getMonthCalendar(year, month)
  const today = now.toISOString().split('T')[0]

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function handleSelect(day) {
    if (!day) return
    setSelected(day.date)
    onSelectDate?.(day)
  }

  return (
    <div className="bg-bg-card rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <span className="text-[13px] font-semibold">{MONTHS[month]} {year}</span>
        <button onClick={next} className="p-1.5 text-text-tertiary hover:text-text-primary transition-colors">
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-text-tertiary font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />
          const isToday = day.date === today
          const isSelected = day.date === selected
          const isFuture = day.date > today

          // Color intensity based on completion ratio
          let bg = 'bg-transparent'
          let textColor = 'text-text-secondary'
          if (isFuture) {
            textColor = 'text-text-tertiary/30'
          } else if (day.ratio >= 1) {
            bg = 'bg-xp/30'
            textColor = 'text-xp'
          } else if (day.ratio >= 0.5) {
            bg = 'bg-xp/15'
            textColor = 'text-xp/80'
          } else if (day.ratio > 0) {
            bg = 'bg-xp/8'
            textColor = 'text-text-secondary'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(day)}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-[11px] font-medium transition-all
                ${bg} ${textColor}
                ${isToday ? 'ring-1 ring-text-primary' : ''}
                ${isSelected ? 'ring-1 ring-xp' : ''}
                ${!isFuture ? 'hover:bg-bg-card-hover active:scale-90' : ''}
              `}
            >
              {day.day}
              {day.ratio >= 1 && !isFuture && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-xp" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selected && (() => {
        const day = days.find(d => d && d.date === selected)
        if (!day) return null
        return (
          <div className="mt-3 pt-3 border-t border-separator text-center">
            <p className="text-[12px] text-text-secondary">
              {new Date(day.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-[13px] font-semibold mt-1">
              {day.completed}/{day.total} quêtes
              {day.ratio >= 1 && <span className="text-xp ml-2">Parfait</span>}
            </p>
          </div>
        )
      })()}
    </div>
  )
}
