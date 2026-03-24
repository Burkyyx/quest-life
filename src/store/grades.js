// Grade system with real rewards
const GRADES = [
  {
    id: 'apprenti', name: 'Apprenti Stoïcien', minLevel: 1,
    desc: 'Tu débutes ton voyage.',
    rewards: [],
    pixelColor: '#48484a',
  },
  {
    id: 'disciple', name: 'Disciple de la Vertu', minLevel: 5,
    desc: 'Tu as prouvé ta constance.',
    rewards: [
      { id: 'custom_quests', name: 'Quêtes personnalisées illimitées', icon: 'swords' },
      { id: 'theme_blue', name: 'Thème Bleu débloqué', icon: 'palette' },
    ],
    pixelColor: '#3b82f6',
  },
  {
    id: 'gardien', name: 'Gardien de la Discipline', minLevel: 10,
    desc: 'Ta discipline inspire le respect.',
    rewards: [
      { id: 'daily_challenge', name: 'Défi quotidien bonus', icon: 'target' },
      { id: 'note_pin', name: 'Épingler des notes', icon: 'pin' },
      { id: 'stat_details', name: 'Stats détaillées', icon: 'bar-chart' },
    ],
    pixelColor: '#8b5cf6',
  },
  {
    id: 'chevalier', name: 'Chevalier de la Sagesse', minLevel: 15,
    desc: 'La sagesse guide tes pas.',
    rewards: [
      { id: 'profile_badge', name: 'Badge profil doré', icon: 'award' },
      { id: 'project_bonus', name: 'Bonus XP projets (+25%)', icon: 'folder' },
      { id: 'theme_purple', name: 'Thème Violet débloqué', icon: 'palette' },
    ],
    pixelColor: '#a855f7',
  },
  {
    id: 'maitre', name: 'Maître de la Volonté', minLevel: 20,
    desc: 'Ta volonté est inébranlable.',
    rewards: [
      { id: 'stat_respec', name: 'Redistribution de stats', icon: 'refresh-cw' },
      { id: 'streak_shield', name: 'Bouclier de série (1 jour de grâce)', icon: 'shield' },
      { id: 'custom_title', name: 'Titre personnalisé', icon: 'crown' },
    ],
    pixelColor: '#f59e0b',
  },
  {
    id: 'sage', name: 'Sage Philosophe', minLevel: 30,
    desc: 'Tu as atteint la maîtrise.',
    rewards: [
      { id: 'mentor_mode', name: 'Mode Mentor (visible par les amis)', icon: 'users' },
      { id: 'theme_gold', name: 'Thème Or débloqué', icon: 'palette' },
      { id: 'infinite_notes', name: 'Notes illimitées', icon: 'file-text' },
    ],
    pixelColor: '#eab308',
  },
  {
    id: 'legende', name: 'Légende Stoïque', minLevel: 40,
    desc: 'Les légendes parlent de toi.',
    rewards: [
      { id: 'all_themes', name: 'Tous les thèmes débloqués', icon: 'palette' },
      { id: 'xp_multiplier', name: 'Multiplicateur XP x1.5', icon: 'zap' },
      { id: 'special_avatar', name: 'Avatar légendaire', icon: 'user' },
    ],
    pixelColor: '#f97316',
  },
  {
    id: 'empereur', name: 'Empereur de la Vertu', minLevel: 50,
    desc: 'Tu es au sommet. Absolu.',
    rewards: [
      { id: 'golden_profile', name: 'Profil entièrement doré', icon: 'crown' },
      { id: 'xp_multiplier_2', name: 'Multiplicateur XP x2', icon: 'zap' },
      { id: 'create_challenges', name: 'Créer des défis pour les amis', icon: 'swords' },
    ],
    pixelColor: '#dc2626',
  },
]

function getCurrentGrade(level) {
  let current = GRADES[0]
  for (const grade of GRADES) {
    if (level >= grade.minLevel) current = grade
  }
  return current
}

function getNextGrade(level) {
  for (const grade of GRADES) {
    if (level < grade.minLevel) return grade
  }
  return null
}

function getAllUnlockedRewards(level) {
  const rewards = []
  for (const grade of GRADES) {
    if (level >= grade.minLevel) {
      rewards.push(...grade.rewards.map(r => ({ ...r, grade: grade.name })))
    }
  }
  return rewards
}

function hasReward(level, rewardId) {
  return getAllUnlockedRewards(level).some(r => r.id === rewardId)
}

export { GRADES, getCurrentGrade, getNextGrade, getAllUnlockedRewards, hasReward }
