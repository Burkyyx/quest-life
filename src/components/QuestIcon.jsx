import {
  Dumbbell, Pill, Laptop, BookOpen, Brain, Apple, Moon,
  ShieldOff, Target, PenLine, Heart, Flame, Droplets,
  Sun, PersonStanding, Music, Palette, Coins, Clock, CheckCircle,
  Sword, CircleDot, Shield, Star, Award, Crown, Users,
  FolderKanban, FileText, BarChart3, Pin, RefreshCw, Zap,
  Swords, Eye, Wind, Mountain, Ghost, Sparkles, Layers,
  User, Lightbulb, Scroll, Link2, ChevronRight,
} from 'lucide-react'

const ICON_MAP = {
  'dumbbell': Dumbbell, 'pill': Pill, 'laptop': Laptop, 'book-open': BookOpen,
  'brain': Brain, 'apple': Apple, 'moon': Moon, 'shield-off': ShieldOff,
  'target': Target, 'pen-line': PenLine, 'heart': Heart, 'flame': Flame,
  'droplets': Droplets, 'sun': Sun, 'walk': PersonStanding, 'music': Music,
  'palette': Palette, 'coins': Coins, 'clock': Clock, 'check-circle': CheckCircle,
  'sword': Sword, 'shield': Shield, 'star': Star, 'award': Award,
  'crown': Crown, 'users': Users, 'folder': FolderKanban, 'file-text': FileText,
  'bar-chart': BarChart3, 'pin': Pin, 'refresh-cw': RefreshCw, 'zap': Zap,
  'swords': Swords, 'eye': Eye, 'wind': Wind, 'mountain': Mountain,
  'ghost': Ghost, 'sparkles': Sparkles, 'layers': Layers, 'user': User,
  'lightbulb': Lightbulb, 'scroll': Scroll, 'link': Link2, 'chevron-right': ChevronRight,
}

export default function QuestIcon({ name, size = 18, className = '' }) {
  const Icon = ICON_MAP[name] || CircleDot
  return <Icon size={size} className={className} strokeWidth={1.5} />
}

export { ICON_MAP }
