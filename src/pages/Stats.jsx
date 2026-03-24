import { useState } from 'react'
import { TrendingUp, Calendar as CalIcon, Target, Zap } from 'lucide-react'
import RadarChart from '../components/RadarChart'
import Calendar from '../components/Calendar'
import { PixelShield } from '../components/PixelAvatar'
import { getState, getWeekHistory, xpForLevel } from '../store/useStore'

export default function Stats() {
  const [state] = useState(getState)
  const weekHistory = getWeekHistory()
  const [selectedDay, setSelectedDay] = useState(null)

  const maxXp = Math.max(...weekHistory.map(d => d.xp), 1)
  const totalWeekXp = weekHistory.reduce((s, d) => s + d.xp, 0)
  const avgCompletion = weekHistory.reduce((s, d) => {
    return s + (d.totalQuests > 0 ? d.questsCompleted / d.totalQuests : 0)
  }, 0) / 7
  const daysSinceStart = Math.max(1, Math.floor((Date.now() - new Date(state.character.createdAt).getTime()) / 86400000))
  const avgXpPerDay = Math.round(state.character.totalXp / daysSinceStart)

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-[20px] font-semibold tracking-tight">Statistiques</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<TrendingUp size={15} strokeWidth={1.5} />} value={state.character.totalXp} label="XP Total" sub={`Niv. ${state.character.level}`} />
        <StatCard icon={<CalIcon size={15} strokeWidth={1.5} />} value={daysSinceStart} label="Jours" sub={`${avgXpPerDay} XP/jour`} />
        <StatCard icon={<Target size={15} strokeWidth={1.5} />} value={`${Math.round(avgCompletion * 100)}%`} label="Complétion" sub="Cette semaine" />
        <StatCard icon={<Zap size={15} strokeWidth={1.5} />} value={totalWeekXp} label="XP semaine" sub={`${Math.round(totalWeekXp / 7)}/jour`} />
      </div>

      {/* Radar chart - Stats */}
      <div className="bg-bg-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <PixelShield size={16} color="#60a5fa" />
          <h3 className="text-[13px] font-semibold">Attributs</h3>
        </div>
        <div className="flex justify-center">
          <RadarChart stats={state.character.stats || {}} size={240} />
        </div>
      </div>

      {/* Calendar */}
      <div>
        <h3 className="text-[13px] font-semibold mb-3">Calendrier</h3>
        <Calendar onSelectDate={setSelectedDay} />
      </div>

      {/* Weekly chart */}
      <div className="bg-bg-card rounded-2xl p-5">
        <h3 className="text-[13px] font-semibold mb-5">7 derniers jours</h3>
        <div className="flex items-end gap-2 h-28">
          {weekHistory.map((day, i) => {
            const height = maxXp > 0 ? (day.xp / maxXp) * 100 : 0
            const isToday = i === weekHistory.length - 1
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-text-tertiary tabular-nums">{day.xp || ''}</span>
                <div className="w-full rounded-lg overflow-hidden bg-bg-elevated" style={{ height: '80px' }}>
                  <div
                    className="w-full rounded-lg transition-all duration-700"
                    style={{
                      height: `${height}%`, marginTop: `${100 - height}%`,
                      background: isToday ? '#f5f5f7' : '#2c2c2e',
                    }}
                  />
                </div>
                <span className={`text-[10px] ${isToday ? 'text-text-primary font-semibold' : 'text-text-tertiary'}`}>
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-bg-card rounded-2xl p-5">
        <h3 className="text-[13px] font-semibold mb-4">Progression</h3>
        <div className="flex items-center gap-4">
          <span className="text-[24px] font-bold tabular-nums">{state.character.level}</span>
          <div className="flex-1">
            <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-text-primary rounded-full animate-xp-fill"
                style={{ width: `${(state.character.xp / xpForLevel(state.character.level)) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-text-tertiary mt-2 tabular-nums">
              {state.character.xp} / {xpForLevel(state.character.level)} XP
            </p>
          </div>
          <span className="text-[24px] font-bold text-text-tertiary tabular-nums">{state.character.level + 1}</span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, sub }) {
  return (
    <div className="bg-bg-card rounded-2xl p-4">
      <div className="text-text-tertiary mb-3">{icon}</div>
      <p className="text-[18px] font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-text-tertiary mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-text-tertiary/60">{sub}</p>}
    </div>
  )
}
