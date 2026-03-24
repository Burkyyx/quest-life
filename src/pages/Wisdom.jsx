import { useState } from 'react'
import { RefreshCw, Quote, Crown, Scroll, Link2, Shield, Flame, Brain, Mountain, Zap, Clock, Wind, Eye, Ghost, Heart, Sparkles, Layers } from 'lucide-react'
import { QUOTES, WISDOM_THEMES, getDailyQuote } from '../store/quotes'

const THEME_ICONS = {
  layers: Layers, shield: Shield, flame: Flame, brain: Brain, mountain: Mountain,
  zap: Zap, clock: Clock, wind: Wind, eye: Eye, ghost: Ghost, heart: Heart, sparkles: Sparkles,
}

const AUTHOR_INFO = {
  'Marc Aurèle': { icon: Crown, desc: 'Empereur romain (121-180)' },
  'Sénèque': { icon: Scroll, desc: 'Philosophe romain (4 av. J.-C. - 65)' },
  'Épictète': { icon: Link2, desc: 'Ancien esclave, philosophe (50-135)' },
  'Nietzsche': { icon: Zap, desc: 'Philosophe allemand (1844-1900)' },
  'Confucius': { icon: Brain, desc: 'Philosophe chinois (551-479 av. J.-C.)' },
  'Socrate': { icon: Eye, desc: 'Philosophe grec (470-399 av. J.-C.)' },
}

export default function Wisdom() {
  const dailyQuote = getDailyQuote()
  const [randomQuote, setRandomQuote] = useState(null)
  const [activeTheme, setActiveTheme] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const filtered = activeTheme === 'all'
    ? QUOTES
    : QUOTES.filter(q => q.themes.includes(activeTheme))

  function getRandomQuote() {
    const pool = filtered.filter(q => q.text !== (randomQuote || dailyQuote).text)
    setRandomQuote(pool[Math.floor(Math.random() * pool.length)])
  }

  const authors = [...new Set(QUOTES.map(q => q.author))]

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-[20px] font-semibold tracking-tight">Sagesse</h1>

      {/* Daily quote */}
      <div className="bg-bg-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Quote size={13} strokeWidth={1.5} className="text-text-tertiary" />
          <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-[0.1em]">Citation du jour</span>
        </div>
        <p className="text-[16px] text-text-primary leading-relaxed font-light italic">"{dailyQuote.text}"</p>
        <p className="text-[12px] text-text-secondary mt-4 font-medium">— {dailyQuote.author}</p>
      </div>

      {/* Theme filters */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">Thèmes</h3>
        <div className="flex flex-wrap gap-1.5">
          {WISDOM_THEMES.map(theme => {
            const Icon = THEME_ICONS[theme.icon] || Layers
            const count = theme.id === 'all' ? QUOTES.length : QUOTES.filter(q => q.themes.includes(theme.id)).length
            return (
              <button
                key={theme.id}
                onClick={() => { setActiveTheme(theme.id); setShowAll(false) }}
                className={`pill flex items-center gap-1.5 text-[11px] transition-all ${
                  activeTheme === theme.id
                    ? 'bg-text-primary text-bg-primary'
                    : 'bg-bg-card text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={11} strokeWidth={1.5} />
                {theme.name}
                <span className="text-[9px] opacity-60">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Random generator */}
      <div className="bg-bg-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold">Inspiration</span>
          <button
            onClick={getRandomQuote}
            className="pill bg-bg-elevated text-text-secondary flex items-center gap-1.5 hover:text-text-primary active:scale-95 transition-all"
          >
            <RefreshCw size={12} strokeWidth={1.5} />
            Nouvelle
          </button>
        </div>
        {randomQuote ? (
          <div className="animate-fade-in">
            <p className="text-[13px] italic text-text-secondary leading-relaxed">"{randomQuote.text}"</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[11px] text-text-tertiary font-medium">— {randomQuote.author}</p>
              <div className="flex gap-1">
                {randomQuote.themes.map(t => (
                  <span key={t} className="text-[9px] bg-bg-elevated text-text-tertiary px-1.5 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-text-tertiary">Génère une citation aléatoire</p>
        )}
      </div>

      {/* Philosophers */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">Auteurs</h3>
        <div className="space-y-1.5">
          {authors.map(author => {
            const quotes = QUOTES.filter(q => q.author === author)
            const info = AUTHOR_INFO[author]
            const AuthorIcon = info?.icon || Scroll
            return (
              <div key={author} className="bg-bg-card rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center border border-border-light">
                  <AuthorIcon size={18} strokeWidth={1.5} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold">{author}</h4>
                  <p className="text-[11px] text-text-tertiary">{info?.desc || 'Philosophe'}</p>
                </div>
                <span className="text-[11px] text-text-tertiary bg-bg-elevated px-2.5 py-1 rounded-full tabular-nums">{quotes.length}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filtered quotes */}
      <div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[13px] font-semibold flex items-center gap-2 hover:text-text-secondary transition-colors mb-3"
        >
          {activeTheme === 'all' ? 'Toutes les citations' : WISDOM_THEMES.find(t => t.id === activeTheme)?.name}
          <span className="text-[11px] text-text-tertiary tabular-nums">({filtered.length})</span>
          <span className={`text-text-tertiary transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
        {showAll && (
          <div className="space-y-1.5 animate-fade-in">
            {filtered.map((quote, i) => (
              <div key={i} className="bg-bg-card rounded-xl p-3.5">
                <p className="text-[12px] italic text-text-secondary leading-relaxed">"{quote.text}"</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-[10px] text-text-tertiary font-medium">— {quote.author}</p>
                  <div className="flex gap-1 flex-wrap">
                    {quote.themes.map(t => (
                      <span key={t} className="text-[8px] bg-bg-elevated text-text-tertiary px-1.5 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
