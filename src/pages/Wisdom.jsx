import { useState } from 'react'
import {
  RefreshCw, Quote, Crown, Scroll, Link2, Shield, Flame, Brain,
  Mountain, Zap, Clock, Wind, Eye, Ghost, Heart, Sparkles, Layers,
  X, ChevronRight,
} from 'lucide-react'
import { QUOTES, WISDOM_THEMES, getDailyQuote } from '../store/quotes'
import PixelPhilosopher from '../components/PixelPhilosopher'

const AUTHOR_DATA = {
  'Marc Aurèle': {
    born: '121',
    died: '180 apr. J.-C.',
    school: 'Stoïcisme',
    role: 'Empereur romain et philosophe',
    bio: "Considéré comme l'un des plus grands empereurs romains, Marc Aurèle a gouverné avec sagesse tout en pratiquant le stoïcisme. Ses « Pensées » — un journal intime jamais destiné à la publication — restent l'une des œuvres les plus lues de l'histoire.",
    key: 'La vraie liberté vient de la maîtrise de ses pensées, pas des circonstances extérieures.',
    color: '#7c3aed',
  },
  'Sénèque': {
    born: '4 av. J.-C.',
    died: '65 apr. J.-C.',
    school: 'Stoïcisme',
    role: "Philosophe, dramaturge et homme d'État romain",
    bio: "Conseiller de l'empereur Néron, Sénèque a écrit de nombreuses lettres sur la sagesse stoïcienne. Ses « Lettres à Lucilius » offrent une sagesse pratique sur le temps, la mort et le bonheur.",
    key: "Le temps est notre seule richesse véritable — apprends à ne pas le gaspiller.",
    color: '#3b82f6',
  },
  'Épictète': {
    born: '50',
    died: '135 apr. J.-C.',
    school: 'Stoïcisme',
    role: 'Philosophe esclave affranchi',
    bio: "Né esclave, Épictète a enseigné que la liberté intérieure est accessible à tous. Son « Manuel » est fondamental dans la tradition stoïcienne.",
    key: "Certaines choses dépendent de toi, d'autres non — cette distinction est le début de la sagesse.",
    color: '#10b981',
  },
  'Nietzsche': {
    born: '1844',
    died: '1900',
    school: 'Philosophie continentale',
    role: 'Philosophe allemand',
    bio: "Nietzsche a remis en question les valeurs morales traditionnelles. Son concept du Surhomme et de la volonté de puissance ont profondément influencé la philosophie moderne.",
    key: 'Deviens ce que tu es — trouve ta propre valeur au lieu de suivre la morale imposée.',
    color: '#ef4444',
  },
  'Confucius': {
    born: '551 av. J.-C.',
    died: '479 av. J.-C.',
    school: 'Confucianisme',
    role: 'Philosophe et éducateur chinois',
    bio: "Fondateur du confucianisme, Confucius a enseigné l'importance de la vertu et des relations humaines. Ses « Entretiens » ont façonné la culture asiatique pendant plus de 2000 ans.",
    key: "La vertu s'acquiert par l'effort — celui qui se maîtrise peut ensuite guider les autres.",
    color: '#ea580c',
  },
  'Socrate': {
    born: '470 av. J.-C.',
    died: '399 av. J.-C.',
    school: 'Philosophie grecque classique',
    role: 'Père de la philosophie occidentale',
    bio: "Socrate n'a jamais écrit, mais ses dialogues rapportés par Platon ont fondé la philosophie occidentale. Il fut condamné à mort pour avoir « corrompu la jeunesse ».",
    key: "La vraie sagesse commence par reconnaître son ignorance — « Je sais que je ne sais rien ».",
    color: '#0d9488',
  },
}

const AUTHOR_INFO = {
  'Marc Aurèle': { icon: Crown, desc: 'Empereur romain (121-180)' },
  'Sénèque': { icon: Scroll, desc: 'Philosophe stoïcien (4 av. J.-C. - 65)' },
  'Épictète': { icon: Link2, desc: 'Philosophe esclave (50-135)' },
  'Nietzsche': { icon: Zap, desc: 'Philosophe allemand (1844-1900)' },
  'Confucius': { icon: Mountain, desc: 'Philosophe chinois (551-479 av. J.-C.)' },
  'Socrate': { icon: Eye, desc: 'Philosophe grec (470-399 av. J.-C.)' },
}

const THEME_ICONS = {
  layers: Layers,
  shield: Shield,
  flame: Flame,
  brain: Brain,
  mountain: Mountain,
  zap: Zap,
  clock: Clock,
  wind: Wind,
  eye: Eye,
  ghost: Ghost,
  heart: Heart,
  sparkles: Sparkles,
}

export default function Wisdom() {
  const [dailyQuote] = useState(() => getDailyQuote())
  const [randomQuote, setRandomQuote] = useState(null)
  const [activeTheme, setActiveTheme] = useState('all')
  const [showAll, setShowAll] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState(null)

  const filtered = activeTheme === 'all'
    ? QUOTES
    : QUOTES.filter(q => q.themes && q.themes.includes(activeTheme))

  function getRandomQuote() {
    const pool = filtered.filter(q => q.text !== randomQuote?.text && q.text !== dailyQuote?.text)
    if (pool.length === 0) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    setRandomQuote(pick)
  }

  const authors = [...new Set(QUOTES.map(q => q.author))]

  const displayedQuotes = showAll ? filtered : filtered.slice(0, 5)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Title */}
      <h1 className="text-[20px] font-semibold tracking-tight">Sagesse</h1>

      {/* Daily quote card */}
      {dailyQuote && (
        <div className="bg-bg-card rounded-2xl p-4 active:bg-bg-card-hover transition-colors cursor-default select-text">
          <div className="flex items-center gap-2 mb-3">
            <Quote size={14} className="text-text-tertiary" strokeWidth={1.5} />
            <span className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.08em]">Citation du jour</span>
          </div>
          <p className="text-[14px] leading-relaxed text-text-primary font-medium">"{dailyQuote.text}"</p>
          <p className="text-[11px] text-text-tertiary mt-2 font-medium">— {dailyQuote.author}</p>
        </div>
      )}

      {/* Theme filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => { setActiveTheme('all'); setShowAll(false) }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
            activeTheme === 'all'
              ? 'bg-text-primary text-bg-primary'
              : 'bg-bg-card text-text-secondary hover:text-text-primary'
          }`}
        >
          Tout
        </button>
        {WISDOM_THEMES && WISDOM_THEMES.map(theme => {
          const IconComp = THEME_ICONS[theme.icon]
          return (
            <button
              key={theme.id}
              onClick={() => { setActiveTheme(theme.id); setShowAll(theme.id !== 'all') }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                activeTheme === theme.id
                  ? 'bg-text-primary text-bg-primary'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary'
              }`}
            >
              {IconComp && <IconComp size={11} strokeWidth={2} />}
              {theme.name || theme.label}
            </button>
          )
        })}
      </div>

      {/* Random quote generator */}
      <div className="bg-bg-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold">Citation aléatoire</span>
          <button
            onClick={getRandomQuote}
            className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary transition-colors active:scale-95"
          >
            <RefreshCw size={13} strokeWidth={2} />
            Nouvelle
          </button>
        </div>
        {randomQuote ? (
          <>
            <p className="text-[13px] leading-relaxed text-text-primary">"{randomQuote.text}"</p>
            <p className="text-[11px] text-text-tertiary mt-2 font-medium">— {randomQuote.author}</p>
          </>
        ) : (
          <p className="text-[12px] text-text-tertiary">Appuie sur "Nouvelle" pour découvrir une citation.</p>
        )}
      </div>

      {/* Authors section */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">Philosophes</h3>
        <div className="space-y-1.5">
          {authors.map(author => {
            const info = AUTHOR_INFO[author]
            const count = QUOTES.filter(q => q.author === author).length
            return (
              <div
                key={author}
                onClick={() => setSelectedAuthor(author)}
                className="flex items-center gap-3 bg-bg-card p-3.5 rounded-xl cursor-pointer active:bg-bg-card-hover transition-colors"
              >
                <div className="rounded-xl bg-bg-elevated w-10 h-10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <PixelPhilosopher author={author} size={40} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{author}</p>
                  {info && <p className="text-[11px] text-text-tertiary truncate">{info.desc}</p>}
                </div>
                <span className="text-[10px] text-text-tertiary bg-bg-elevated px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  {count}
                </span>
                <ChevronRight size={14} className="text-text-tertiary flex-shrink-0" strokeWidth={1.5} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Filtered quotes section */}
      <div>
        <h3 className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.1em] mb-3">
          Citations
          {activeTheme !== 'all' && WISDOM_THEMES && (
            <span className="ml-1 normal-case font-normal">
              — {WISDOM_THEMES.find(t => t.id === activeTheme)?.name || WISDOM_THEMES.find(t => t.id === activeTheme)?.label || activeTheme}
            </span>
          )}
          <span className="ml-1 normal-case font-normal">({filtered.length})</span>
        </h3>
        <div className="space-y-1.5">
          {displayedQuotes.map((quote, i) => (
            <div key={i} className="bg-bg-card rounded-xl p-4">
              <p className="text-[13px] leading-relaxed text-text-primary">"{quote.text}"</p>
              <p className="text-[11px] text-text-tertiary mt-2 font-medium">— {quote.author}</p>
            </div>
          ))}
        </div>
        {!showAll && filtered.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-2 py-2.5 text-[12px] text-text-secondary hover:text-text-primary transition-colors"
          >
            Voir les {filtered.length - 5} autres citations
          </button>
        )}
      </div>

      {/* Author detail modal */}
      {selectedAuthor && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end animate-fade-in"
          onClick={() => setSelectedAuthor(null)}
        >
          <div
            className="bg-bg-elevated rounded-t-3xl w-full max-h-[85vh] overflow-y-auto pb-24"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5">
              {/* Header row */}
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-bg-card w-16 h-16 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <PixelPhilosopher author={selectedAuthor} size={64} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[17px] font-semibold leading-tight">{selectedAuthor}</h2>
                  {AUTHOR_DATA[selectedAuthor] && (
                    <>
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        {AUTHOR_DATA[selectedAuthor].born} – {AUTHOR_DATA[selectedAuthor].died}
                      </p>
                      <span
                        className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: AUTHOR_DATA[selectedAuthor].color + '22',
                          color: AUTHOR_DATA[selectedAuthor].color,
                        }}
                      >
                        {AUTHOR_DATA[selectedAuthor].school}
                      </span>
                      <p className="text-[11px] text-text-secondary mt-1">{AUTHOR_DATA[selectedAuthor].role}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSelectedAuthor(null)}
                  className="text-text-tertiary hover:text-text-primary transition-colors p-1.5 flex-shrink-0"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Bio */}
              {AUTHOR_DATA[selectedAuthor] && (
                <p className="text-[13px] text-text-secondary leading-relaxed mt-4">
                  {AUTHOR_DATA[selectedAuthor].bio}
                </p>
              )}

              {/* Key thought */}
              {AUTHOR_DATA[selectedAuthor] && (
                <div className="mt-4">
                  <p className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.08em] mb-2">Pensée clé</p>
                  <div
                    className="bg-bg-card rounded-xl p-4 border-l-2"
                    style={{ borderColor: AUTHOR_DATA[selectedAuthor].color }}
                  >
                    <p className="text-[13px] text-text-primary leading-relaxed italic">
                      "{AUTHOR_DATA[selectedAuthor].key}"
                    </p>
                  </div>
                </div>
              )}

              {/* Author's quotes */}
              <div className="mt-5">
                <p className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.08em] mb-3">
                  Citations ({QUOTES.filter(q => q.author === selectedAuthor).length})
                </p>
                <div className="space-y-2">
                  {QUOTES.filter(q => q.author === selectedAuthor).map((quote, i) => (
                    <div key={i} className="bg-bg-card rounded-xl p-4">
                      <p className="text-[13px] leading-relaxed text-text-primary">"{quote.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
