import { useState, useEffect } from 'react'
import { LogIn, LogOut, Lock, Check, Search, UserPlus, UserMinus, UserCheck, Users, Trophy, Flame } from 'lucide-react'
import Settings from './Settings'
import QuestIcon from '../components/QuestIcon'
import PixelAvatar, { PixelStar } from '../components/PixelAvatar'
import { getState, xpForLevel, getTitle } from '../store/useStore'
import { GRADES, getCurrentGrade, getNextGrade, getAllUnlockedRewards } from '../store/grades'
import {
  isConfigured, loginWithGoogle, logout, onAuthChange,
  searchUsers, sendFriendRequest, acceptFriend, removeFriend,
  getUserProfile, getFriendProgress,
} from '../store/firebase'

export default function Profile() {
  const [state] = useState(getState)
  const [tab, setTab] = useState('profile') // 'profile' | 'social' | 'settings'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured()) { setLoading(false); return }
    const unsub = onAuthChange((u) => { setUser(u); setLoading(false) })
    return unsub
  }, [])

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-[20px] font-semibold tracking-tight">Profil & Social</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-bg-card rounded-xl p-1">
        <TabBtn active={tab === 'profile'} onClick={() => setTab('profile')}>Profil</TabBtn>
        <TabBtn active={tab === 'social'} onClick={() => setTab('social')}>Social</TabBtn>
        <TabBtn active={tab === 'settings'} onClick={() => setTab('settings')}>Réglages</TabBtn>
      </div>

      {tab === 'profile' ? (
        <ProfileTab state={state} user={user} loading={loading} setUser={setUser} setLoading={setLoading} />
      ) : tab === 'social' ? (
        <SocialTab user={user} loading={loading} />
      ) : (
        <Settings />
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

/* ============ PROFILE TAB ============ */
function ProfileTab({ state, user, loading, setUser, setLoading }) {
  const level = state.character.level
  const grade = getCurrentGrade(level)
  const nextGrade = getNextGrade(level)
  const unlockedRewards = getAllUnlockedRewards(level)
  const xpNeeded = xpForLevel(level)

  async function handleLogin() {
    setLoading(true)
    await loginWithGoogle()
    setLoading(false)
  }

  async function handleLogout() {
    await logout()
    setUser(null)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Character card */}
      <div className="bg-bg-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <PixelAvatar level={level} size={64} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold">{user?.displayName || state.character.name}</h2>
              <span className="text-[11px] bg-bg-elevated px-2 py-0.5 rounded-full font-medium text-text-secondary">
                Niv. {level}
              </span>
            </div>
            <p className="text-[12px] mt-0.5" style={{ color: grade.pixelColor }}>{grade.name}</p>
            <div className="mt-2.5">
              <div className="flex justify-between text-[10px] text-text-tertiary mb-1">
                <span>XP</span>
                <span className="tabular-nums">{state.character.xp}/{xpNeeded}</span>
              </div>
              <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-xp to-emerald-300 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (state.character.xp / xpNeeded) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-separator">
          <MiniStat label="XP Total" value={state.character.totalXp} />
          <MiniStat label="Série" value={state.character.streak} />
          <MiniStat label="Record" value={state.character.bestStreak} />
        </div>
      </div>

      {/* Google account */}
      <div className="bg-bg-card rounded-2xl p-4">
        <h3 className="text-[12px] font-semibold mb-3">Compte</h3>
        {!isConfigured() ? (
          <p className="text-[11px] text-text-tertiary">Firebase non configuré. Ajoute ta config dans firebase.js pour activer la connexion.</p>
        ) : loading ? (
          <p className="text-[11px] text-text-tertiary">Chargement...</p>
        ) : user ? (
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{user.displayName}</p>
              <p className="text-[11px] text-text-tertiary truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="text-text-tertiary hover:text-health transition-colors p-2">
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-bg-elevated hover:bg-bg-card-hover text-text-primary py-2.5 rounded-xl text-[13px] font-medium transition-all active:scale-[0.98]"
          >
            <LogIn size={15} strokeWidth={1.5} />
            Connexion avec Google
          </button>
        )}
      </div>

      {/* Grade progression */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">Grades</h3>
        <div className="space-y-1.5">
          {GRADES.map((g) => {
            const unlocked = level >= g.minLevel
            const isCurrent = g.id === grade.id
            return (
              <div
                key={g.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCurrent ? 'bg-bg-card ring-1' : unlocked ? 'bg-bg-card opacity-70' : 'bg-bg-card opacity-30'
                }`}
                style={isCurrent ? { ringColor: g.pixelColor + '40' } : {}}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: unlocked ? g.pixelColor : '#2a2a2a' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold" style={{ color: unlocked ? g.pixelColor : '#48484a' }}>{g.name}</p>
                  <p className="text-[10px] text-text-tertiary">{g.desc}</p>
                </div>
                <span className="text-[10px] text-text-tertiary font-medium tabular-nums">Niv. {g.minLevel}</span>
                {unlocked ? (
                  <Check size={14} strokeWidth={2} className="text-xp flex-shrink-0" />
                ) : (
                  <Lock size={13} strokeWidth={1.5} className="text-text-tertiary flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Unlocked rewards */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">
          Récompenses débloquées ({unlockedRewards.length})
        </h3>
        {unlockedRewards.length === 0 ? (
          <p className="text-[11px] text-text-tertiary bg-bg-card rounded-xl p-4 text-center">
            Atteins le niveau 5 pour débloquer tes premières récompenses.
          </p>
        ) : (
          <div className="space-y-1.5">
            {unlockedRewards.map(r => (
              <div key={r.id} className="flex items-center gap-3 bg-bg-card p-3 rounded-xl">
                <QuestIcon name={r.icon} size={15} className="text-xp" />
                <div className="flex-1">
                  <p className="text-[12px] font-medium">{r.name}</p>
                  <p className="text-[10px] text-text-tertiary">{r.grade}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next rewards preview */}
      {nextGrade && (
        <div className="bg-bg-card rounded-2xl p-4">
          <p className="text-[11px] text-text-tertiary font-medium mb-2">Prochaines récompenses — {nextGrade.name}</p>
          <div className="space-y-1.5">
            {nextGrade.rewards.map(r => (
              <div key={r.id} className="flex items-center gap-2 opacity-50">
                <Lock size={11} strokeWidth={1.5} className="text-text-tertiary" />
                <QuestIcon name={r.icon} size={13} className="text-text-tertiary" />
                <span className="text-[11px] text-text-tertiary">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[15px] font-bold tabular-nums">{value}</p>
      <p className="text-[9px] text-text-tertiary font-medium mt-0.5">{label}</p>
    </div>
  )
}

/* ============ SOCIAL TAB ============ */
function SocialTab({ user, loading }) {
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])

  useEffect(() => {
    if (user) loadFriends(user.uid)
  }, [user])

  async function loadFriends(uid) {
    const profile = await getUserProfile(uid)
    if (!profile) return

    const friendUids = profile.friends || []
    const requestUids = profile.friendRequests || []

    const friendProfiles = await Promise.all(friendUids.map(async fid => {
      const fp = await getUserProfile(fid)
      const progress = await getFriendProgress(fid)
      return { ...(fp || {}), uid: fid, progress }
    }))

    const requestProfiles = await Promise.all(requestUids.map(async rid => {
      const rp = await getUserProfile(rid)
      return { ...(rp || {}), uid: rid }
    }))

    setFriends(friendProfiles)
    setRequests(requestProfiles)
  }

  async function handleSearch() {
    if (!searchEmail.trim()) return
    setSearching(true)
    const results = await searchUsers(searchEmail.trim())
    setSearchResults(results.filter(r => r.uid !== user?.uid))
    setSearching(false)
  }

  async function handleSendRequest(toUid) {
    if (!user) return
    await sendFriendRequest(user.uid, toUid)
    setSearchResults(prev => prev.map(r => r.uid === toUid ? { ...r, requestSent: true } : r))
  }

  async function handleAccept(friendUid) {
    if (!user) return
    await acceptFriend(user.uid, friendUid)
    await loadFriends(user.uid)
  }

  async function handleRemove(friendUid) {
    if (!user) return
    await removeFriend(user.uid, friendUid)
    setFriends(prev => prev.filter(f => f.uid !== friendUid))
  }

  if (!isConfigured()) {
    return (
      <div className="bg-bg-card rounded-2xl p-6 text-center animate-fade-in">
        <Users size={28} strokeWidth={1.5} className="text-text-tertiary mx-auto mb-3" />
        <p className="text-[13px] text-text-secondary">Firebase non configuré</p>
        <p className="text-[11px] text-text-tertiary mt-1.5 leading-relaxed">
          Configure Firebase dans firebase.js pour activer les fonctionnalités sociales.
        </p>
      </div>
    )
  }

  if (loading) {
    return <p className="text-[12px] text-text-tertiary text-center py-8 animate-fade-in">Chargement...</p>
  }

  if (!user) {
    return (
      <div className="bg-bg-card rounded-2xl p-6 text-center animate-fade-in">
        <Users size={28} strokeWidth={1.5} className="text-text-tertiary mx-auto mb-3" />
        <p className="text-[13px] text-text-secondary">Connecte-toi pour ajouter des amis</p>
        <p className="text-[11px] text-text-tertiary mt-1.5">Va dans l'onglet Profil pour te connecter avec Google.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search */}
      <div className="bg-bg-card rounded-2xl p-4">
        <p className="text-[12px] font-semibold mb-3">Ajouter un ami</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email de ton ami..."
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-bg-elevated text-text-primary px-3.5 py-2.5 rounded-xl border border-border-light focus:border-text-tertiary outline-none text-[13px] transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="bg-text-primary text-bg-primary px-4 py-2.5 rounded-xl font-medium text-[13px] hover:opacity-90 active:scale-95 transition-all"
          >
            <Search size={15} strokeWidth={2} />
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {searchResults.map(r => (
              <div key={r.uid} className="flex items-center gap-3 bg-bg-elevated p-3 rounded-xl">
                {r.photoURL ? (
                  <img src={r.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center">
                    <Users size={14} className="text-text-tertiary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate">{r.displayName || 'Utilisateur'}</p>
                  <p className="text-[10px] text-text-tertiary truncate">{r.email}</p>
                </div>
                {r.requestSent ? (
                  <span className="text-[10px] text-text-tertiary">Envoyé</span>
                ) : (
                  <button
                    onClick={() => handleSendRequest(r.uid)}
                    className="text-xp hover:text-emerald-300 transition-colors p-1.5"
                  >
                    <UserPlus size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friend requests */}
      {requests.length > 0 && (
        <div>
          <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">
            Demandes ({requests.length})
          </h3>
          <div className="space-y-1.5">
            {requests.map(r => (
              <div key={r.uid} className="flex items-center gap-3 bg-bg-card p-3.5 rounded-xl">
                {r.photoURL ? (
                  <img src={r.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center">
                    <Users size={14} className="text-text-tertiary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate">{r.displayName || 'Utilisateur'}</p>
                </div>
                <button
                  onClick={() => handleAccept(r.uid)}
                  className="text-xp hover:text-emerald-300 transition-colors p-1.5"
                >
                  <UserCheck size={16} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">
          Amis ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <div className="bg-bg-card rounded-2xl p-6 text-center">
            <p className="text-[12px] text-text-tertiary">Aucun ami pour l'instant</p>
            <p className="text-[10px] text-text-tertiary mt-1">Recherche par email pour ajouter des amis.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {friends.map(f => {
              const prog = f.progress
              const friendGrade = prog ? getCurrentGrade(prog.level || 1) : null
              return (
                <div key={f.uid} className="bg-bg-card rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    {f.photoURL ? (
                      <img src={f.photoURL} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <PixelAvatar level={prog?.level || 1} size={40} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">{f.displayName || 'Ami'}</p>
                      {friendGrade && (
                        <p className="text-[10px] font-medium" style={{ color: friendGrade.pixelColor }}>
                          {friendGrade.name} — Niv. {prog.level}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(f.uid)}
                      className="text-text-tertiary hover:text-health transition-colors p-1.5"
                    >
                      <UserMinus size={15} strokeWidth={1.5} />
                    </button>
                  </div>

                  {prog && (
                    <div className="flex justify-around mt-3 pt-3 border-t border-separator">
                      <div className="flex items-center gap-1.5 text-text-tertiary">
                        <Trophy size={12} strokeWidth={1.5} />
                        <span className="text-[11px] font-medium tabular-nums">{prog.totalXp || 0} XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-tertiary">
                        <Flame size={12} strokeWidth={1.5} />
                        <span className="text-[11px] font-medium tabular-nums">{prog.streak || 0} jours</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
