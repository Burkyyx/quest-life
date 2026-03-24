// Citations organisées par thème
const QUOTES = [
  // DISCIPLINE
  { text: "N'attends pas d'être motivé. La discipline est plus fiable que la motivation.", author: "Épictète", themes: ["discipline"] },
  { text: "Nous souffrons plus souvent en imagination qu'en réalité.", author: "Sénèque", themes: ["discipline", "peur"] },
  { text: "Fais peu, mais fais-le bien.", author: "Marc Aurèle", themes: ["discipline"] },
  { text: "Supporte et abstiens-toi.", author: "Épictète", themes: ["discipline", "résilience"] },
  { text: "Ne gaspille plus de temps à discuter de ce que devrait être un homme bien. Sois-en un.", author: "Marc Aurèle", themes: ["discipline", "action"] },
  { text: "Il faut toute la vie pour apprendre à vivre.", author: "Sénèque", themes: ["discipline", "sagesse"] },
  { text: "L'homme qui se domine est plus puissant que celui qui prend des villes.", author: "Proverbe stoïcien", themes: ["discipline"] },
  { text: "Sans musique, la vie serait une erreur. Mais sans discipline, la musique elle-même serait du bruit.", author: "Nietzsche", themes: ["discipline"] },

  // COURAGE
  { text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", author: "Sénèque", themes: ["courage", "peur"] },
  { text: "Tu peux briser tes chaînes à tout moment. Il te suffit de le vouloir.", author: "Marc Aurèle", themes: ["courage", "liberté"] },
  { text: "Ce qui ne me tue pas me rend plus fort.", author: "Nietzsche", themes: ["courage", "résilience"] },
  { text: "Il faut avoir du chaos en soi pour accoucher d'une étoile qui danse.", author: "Nietzsche", themes: ["courage", "création"] },
  { text: "L'homme qui a le courage de ses opinions a toujours de la force.", author: "Nietzsche", themes: ["courage"] },
  { text: "Les difficultés renforcent l'esprit, comme le travail renforce le corps.", author: "Sénèque", themes: ["courage", "résilience"] },
  { text: "Vis dangeureusement ! Construis ta ville au pied du Vésuve !", author: "Nietzsche", themes: ["courage", "action"] },

  // SAGESSE
  { text: "Le bonheur de ta vie dépend de la qualité de tes pensées.", author: "Marc Aurèle", themes: ["sagesse", "esprit"] },
  { text: "L'âme devient teinte de la couleur de ses pensées.", author: "Marc Aurèle", themes: ["sagesse", "esprit"] },
  { text: "La vie est longue si tu sais t'en servir.", author: "Sénèque", themes: ["sagesse", "temps"] },
  { text: "Ce qui trouble les hommes, ce ne sont pas les choses, mais les jugements qu'ils portent sur les choses.", author: "Épictète", themes: ["sagesse", "esprit"] },
  { text: "Que ta joie soit dans la simplicité.", author: "Marc Aurèle", themes: ["sagesse"] },
  { text: "La richesse ne consiste pas à avoir de grandes possessions, mais à avoir peu de besoins.", author: "Épictète", themes: ["sagesse"] },
  { text: "Celui qui a un pourquoi pour vivre peut supporter presque n'importe quel comment.", author: "Nietzsche", themes: ["sagesse", "résilience"] },
  { text: "Le serpent qui ne peut changer de peau meurt. De même les esprits qui ne changent pas d'opinion.", author: "Nietzsche", themes: ["sagesse"] },

  // RÉSILIENCE
  { text: "L'obstacle sur le chemin devient le chemin.", author: "Marc Aurèle", themes: ["résilience", "courage"] },
  { text: "Tu as du pouvoir sur ton esprit, pas sur les événements extérieurs. Réalise cela, et tu trouveras la force.", author: "Marc Aurèle", themes: ["résilience", "esprit"] },
  { text: "Ne demande pas que les événements arrivent comme tu le veux, mais veuille les événements comme ils arrivent.", author: "Épictète", themes: ["résilience", "sagesse"] },
  { text: "Le sage ne se laisse jamais emporter par le succès ni abattre par l'échec.", author: "Sénèque", themes: ["résilience"] },
  { text: "L'homme supérieur est celui qui s'impose d'abord ce qu'il veut enseigner aux autres.", author: "Confucius", themes: ["résilience", "discipline"] },
  { text: "Notre plus grande gloire n'est point de tomber, mais de savoir nous relever chaque fois que nous tombons.", author: "Confucius", themes: ["résilience"] },

  // ACTION
  { text: "Commence par le nécessaire, puis fais le possible, et soudain tu feras l'impossible.", author: "Marc Aurèle", themes: ["action", "discipline"] },
  { text: "Agis comme si chaque journée était la dernière. Un jour, tu auras raison.", author: "Marc Aurèle", themes: ["action", "temps"] },
  { text: "Il n'est pas de vent favorable pour celui qui ne sait pas où il va.", author: "Sénèque", themes: ["action", "sagesse"] },
  { text: "Les paroles sont des naines, les actes sont des géants.", author: "Proverbe", themes: ["action"] },
  { text: "Le monde ne te doit rien. C'est toi qui dois quelque chose au monde.", author: "Nietzsche", themes: ["action"] },
  { text: "Toute personne qui n'a jamais commis d'erreur n'a jamais rien essayé de nouveau.", author: "Einstein", themes: ["action", "courage"] },

  // TEMPS
  { text: "Chaque nuit, avant de dormir, passe en revue ta journée. Qu'as-tu appris ? Qu'as-tu accompli ?", author: "Sénèque", themes: ["temps", "discipline"] },
  { text: "Le temps découvre la vérité.", author: "Sénèque", themes: ["temps", "sagesse"] },
  { text: "Quand tu te lèves le matin, pense au précieux privilège d'être en vie.", author: "Marc Aurèle", themes: ["temps", "gratitude"] },
  { text: "Ce n'est pas que nous ayons peu de temps, c'est que nous en perdons beaucoup.", author: "Sénèque", themes: ["temps"] },
  { text: "L'éternité est un enfant qui joue.", author: "Héraclite", themes: ["temps", "sagesse"] },

  // LIBERTÉ
  { text: "Si tu veux être libre, commence par être l'esclave de la philosophie.", author: "Épictète", themes: ["liberté", "sagesse"] },
  { text: "Il ne faut pas avoir peur de la pauvreté, ni de l'exil, ni de la prison, ni de la mort. Ce qu'il faut craindre, c'est la crainte elle-même.", author: "Épictète", themes: ["liberté", "peur"] },
  { text: "Ce n'est pas l'homme qui a peu qui est pauvre, mais celui qui désire plus.", author: "Sénèque", themes: ["liberté", "sagesse"] },
  { text: "L'individu a toujours dû lutter pour ne pas être submergé par la tribu.", author: "Nietzsche", themes: ["liberté", "courage"] },
  { text: "La liberté, c'est la possibilité d'être et non l'obligation d'être.", author: "René Magritte", themes: ["liberté"] },

  // ESPRIT
  { text: "Souviens-toi que tu es un acteur dans un drame. Joue bien ton rôle.", author: "Épictète", themes: ["esprit", "sagesse"] },
  { text: "Perds ton temps à t'améliorer grâce aux écrits des autres, tu gagneras facilement ce pour quoi d'autres ont travaillé dur.", author: "Sénèque", themes: ["esprit", "sagesse"] },
  { text: "Le meilleur moyen de se venger d'un ennemi, c'est de ne pas lui ressembler.", author: "Marc Aurèle", themes: ["esprit"] },
  { text: "Deviens qui tu es.", author: "Nietzsche", themes: ["esprit"] },
  { text: "On ne trouve pas le sens de la vie. On le crée.", author: "Nietzsche", themes: ["esprit", "création"] },
  { text: "Celui qui combat les monstres doit prendre garde de ne pas devenir monstre lui-même.", author: "Nietzsche", themes: ["esprit", "sagesse"] },
  { text: "Connais-toi toi-même.", author: "Socrate", themes: ["esprit", "sagesse"] },

  // PEUR
  { text: "On souffre plus souvent en imagination qu'en réalité.", author: "Sénèque", themes: ["peur", "esprit"] },
  { text: "La peur est le chemin vers le côté obscur. La peur mène à la colère, la colère mène à la haine.", author: "Yoda", themes: ["peur"] },
  { text: "Celui qui craint la souffrance souffre déjà de ce qu'il craint.", author: "Montaigne", themes: ["peur", "esprit"] },

  // GRATITUDE
  { text: "Quand tu bois de l'eau, pense à la source.", author: "Proverbe", themes: ["gratitude"] },
  { text: "Ne cherche pas à ce que les événements arrivent comme tu le veux, mais accepte-les comme ils arrivent, et tu vivras heureux.", author: "Épictète", themes: ["gratitude", "résilience"] },

  // CRÉATION
  { text: "L'art est la plus haute forme d'espoir.", author: "Nietzsche", themes: ["création"] },
  { text: "Toute création commence par la destruction.", author: "Nietzsche", themes: ["création", "courage"] },
  { text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci", themes: ["création", "sagesse"] },
]

const WISDOM_THEMES = [
  { id: 'all', name: 'Tout', icon: 'layers' },
  { id: 'discipline', name: 'Discipline', icon: 'shield' },
  { id: 'courage', name: 'Courage', icon: 'flame' },
  { id: 'sagesse', name: 'Sagesse', icon: 'brain' },
  { id: 'résilience', name: 'Résilience', icon: 'mountain' },
  { id: 'action', name: 'Action', icon: 'zap' },
  { id: 'temps', name: 'Temps', icon: 'clock' },
  { id: 'liberté', name: 'Liberté', icon: 'wind' },
  { id: 'esprit', name: 'Esprit', icon: 'eye' },
  { id: 'peur', name: 'Peur', icon: 'ghost' },
  { id: 'gratitude', name: 'Gratitude', icon: 'heart' },
  { id: 'création', name: 'Création', icon: 'sparkles' },
]

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return QUOTES[dayOfYear % QUOTES.length]
}

export { QUOTES, WISDOM_THEMES, getDailyQuote }
