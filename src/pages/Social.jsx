import { useState, useEffect } from 'react'
import { Search, UserPlus, UserMinus, UserCheck, X, Users, Trophy, Flame } from 'lucide-react'
import PixelAvatar from '../components/PixelAvatar'
import { getState } from '../store/useStore'
import { getCurrentGrade } from '../store/grades'
import {
  isConfigured, onAuthChange, searchUsers, sendFriendRequest,
  acceptFriend, removeFriend, getUserProfile, getFriendProgress,
} from '../store/firebase'

export default function Social() {
  const [state] = useState(getState)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [friendData, setFriendData] = useState({})

  useEffect(() => {
    if (!isConfigured()) { setLoading(false); return }
    const unsub = onAuthChange(async (u) => {
      setUser(u)
      setLoading(false)
      if (u) await loadFriends(u.uid)
    })
    return unsub
  }, [])

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
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-[20px] font-semibold tracking-tight">Social</h1>
        <div className="bg-bg-card rounded-2xl p-6 text-center">
          <Users size={28} strokeWidth={1.5} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-[13px] text-text-secondary">Firebase non configuré</p>
          <p className="text-[11px] text-text-tertiary mt-1.5 leading-relaxed">
            Pour utiliser les fonctionnalités sociales, configure Firebase dans le fichier firebase.js avec ta propre config.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-[20px] font-semibold tracking-tight">Social</h1>
        <p className="text-[12px] text-text-tertiary text-center py-8">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-[20px] font-semibold tracking-tight">Social</h1>
        <div className="bg-bg-card rounded-2xl p-6 text-center">
          <Users size={28} strokeWidth={1.5} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-[13px] text-text-secondary">Connecte-toi pour ajouter des amis</p>
          <p className="text-[11px] text-text-tertiary mt-1.5">Va dans Profil pour te connecter avec Google.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-[20px] font-semibold tracking-tight">Social</h1>

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
