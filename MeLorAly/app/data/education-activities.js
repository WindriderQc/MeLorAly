const categories = [
  {
    id: 'preschool',
    name: 'Soutien pré-scolaire',
    icon: 'toys',
    iconColorClass: 'text-blue-600',
    viewAllPath: '/education/preschool'
  },
  {
    id: 'primary',
    name: 'Soutien scolaire',
    icon: 'menu_book',
    iconColorClass: 'text-purple-600',
    viewAllPath: '/education/school'
  }
];

const activities = [
  {
    id: 'coloriage-creatif',
    categoryId: 'preschool',
    title: 'Coloriage créatif',
    summary: 'Développez la créativité et la motricité fine avec des coloriages ludiques.',
    description: 'Encouragez votre enfant à explorer les couleurs et les formes en coloriant des dessins adaptés à son âge. Laissez-le choisir ses propres couleurs et félicitez ses efforts.',
    icon: 'palette',
    gradient: 'from-blue-200 to-purple-200',
    badgeClass: 'bg-blue-100 text-blue-700',
    ageRanges: ['3-6'],
    durationMinutes: 20,
    learningGoals: [
      'Développer la motricité fine',
      'Renforcer la coordination main-oeil',
      'Encourager la créativité'
    ],
    materials: [
      'Feuilles de coloriage',
      'Crayons de couleur ou feutres',
      'Gommettes décoratives (optionnel)'
    ],
    steps: [
      'Choisir un dessin adapté à l’âge de l’enfant.',
      'Proposer plusieurs couleurs et laisser l’enfant sélectionner celles qu’il préfère.',
      'Encourager l’enfant à colorier en suivant les contours, sans viser la perfection.',
      'Féliciter l’enfant et afficher son oeuvre dans un endroit visible.'
    ],
    tips: 'Invitez l’enfant à raconter l’histoire de son dessin pour développer le langage.',
    skillTags: ['Créativité', 'Motricité fine'],
    recommended: true
  },
  {
    id: 'apprentissage-lettres',
    categoryId: 'preschool',
    title: 'Apprentissage des lettres',
    summary: 'Découvrez l’alphabet grâce à des jeux de reconnaissance et de sonorités.',
    description: 'Cette activité vise à familiariser l’enfant avec les lettres de l’alphabet et leurs sons à travers des jeux simples et amusants.',
    icon: 'abc',
    gradient: 'from-green-200 to-teal-200',
    badgeClass: 'bg-green-100 text-green-700',
    ageRanges: ['3-6'],
    durationMinutes: 15,
    learningGoals: [
      'Reconnaître les lettres de l’alphabet',
      'Associer lettres et sons',
      'Enrichir le vocabulaire'
    ],
    materials: [
      'Cartes alphabet ou lettres magnétiques',
      'Affiches ou livres illustrés',
      'Chansons de l’alphabet'
    ],
    steps: [
      'Présenter 3 à 4 lettres et les prononcer clairement.',
      'Demander à l’enfant de répéter les lettres et les sons associés.',
      'Associer chaque lettre à un mot connu (A comme avion, B comme ballon).',
      'Terminer par une chanson de l’alphabet pour mémoriser.'
    ],
    tips: 'Variez les supports (lettres en mousse, pâte à modeler) pour maintenir l’attention.',
    skillTags: ['Langage', 'Conscience phonologique']
  },
  {
    id: 'lecture-comprehension',
    categoryId: 'primary',
    title: 'Lecture et compréhension',
    summary: 'Renforcez la compréhension écrite grâce à des questions adaptées.',
    description: 'Lire un court texte avec votre enfant puis échanger sur les personnages, le déroulé et les émotions permet d’améliorer la compréhension globale.',
    icon: 'import_contacts',
    gradient: 'from-indigo-200 to-blue-300',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    ageRanges: ['6-12'],
    durationMinutes: 25,
    learningGoals: [
      'Améliorer la fluidité de lecture',
      'Identifier les informations clés',
      'Développer la capacité à résumer'
    ],
    materials: [
      'Livre ou texte court adapté au niveau',
      'Questions de compréhension préparées',
      'Carnet pour noter les nouvelles idées'
    ],
    steps: [
      'Lire le texte ensemble ou en autonomie selon le niveau.',
      'Poser des questions de compréhension (qui, quoi, quand, où, pourquoi).',
      'Demander à l’enfant de résumer l’histoire avec ses propres mots.',
      'Identifier un nouveau mot et chercher sa définition ensemble.'
    ],
    tips: 'Encouragez votre enfant à choisir lui-même un livre pour renforcer sa motivation.',
    skillTags: ['Lecture', 'Analyse'],
    recommended: true
  },
  {
    id: 'atelier-mathematiques',
    categoryId: 'primary',
    title: 'Mathématiques ludiques',
    summary: 'Travaillez les mathématiques par le jeu : calcul mental, géométrie et logique.',
    description: 'Transformez les devoirs de mathématiques en mini-défis avec des récompenses simples pour maintenir l’engagement.',
    icon: 'functions',
    gradient: 'from-red-200 to-orange-300',
    badgeClass: 'bg-red-100 text-red-700',
    ageRanges: ['6-12'],
    durationMinutes: 30,
    learningGoals: [
      'Renforcer le calcul mental',
      'Comprendre les formes géométriques',
      'Développer la logique'
    ],
    materials: [
      'Cartes de calcul mental',
      'Règle et papier quadrillé',
      'Petits objets pour manipuler'
    ],
    steps: [
      'Commencer par 5 minutes de calcul mental rapide.',
      'Introduire une notion (ex: périmètre) avec un exemple concret.',
      'Laisser l’enfant résoudre un exercice guidé.',
      'Terminer par un mini-défi chronométré ou un jeu.'
    ],
    tips: 'Utilisez un tableau de progression visible pour valoriser les efforts.',
    skillTags: ['Mathématiques', 'Logique']
  },
  {
    id: 'experiences-scientifiques',
    categoryId: 'primary',
    title: 'Expériences scientifiques',
    summary: 'Découvrez les sciences à travers des expériences simples et sécurisées.',
    description: 'Réalisez une expérience de volcan miniature pour expliquer les réactions chimiques et le vocabulaire associé.',
    icon: 'science',
    gradient: 'from-teal-200 to-green-300',
    badgeClass: 'bg-teal-100 text-teal-700',
    ageRanges: ['6-12'],
    durationMinutes: 25,
    learningGoals: [
      'Comprendre une réaction chimique simple',
      'Observer et décrire un phénomène',
      'Utiliser un vocabulaire scientifique'
    ],
    materials: [
      'Bicarbonate de soude',
      'Vinaigre',
      'Colorant alimentaire',
      'Petit récipient'
    ],
    steps: [
      'Préparer le matériel ensemble et expliquer le déroulé.',
      'Verser le bicarbonate dans le récipient.',
      'Ajouter doucement le vinaigre coloré pour observer la réaction.',
      'Discuter de ce qui s’est passé et noter les observations.'
    ],
    tips: 'Prenez des photos des étapes pour créer un carnet scientifique.',
    skillTags: ['Sciences', 'Observation']
  },
  {
    id: 'histoire-geographie',
    categoryId: 'primary',
    title: 'Histoire et géographie',
    summary: 'Explorez le monde grâce à des récits et des cartes interactives.',
    description: 'Choisissez un pays ou une époque historique et découvrez ensemble ses événements clés, sa culture et ses lieux emblématiques.',
    icon: 'history_edu',
    gradient: 'from-violet-200 to-purple-300',
    badgeClass: 'bg-violet-100 text-violet-700',
    ageRanges: ['6-12', '12+'],
    durationMinutes: 30,
    learningGoals: [
      'Situer un événement sur une frise chronologique',
      'Comprendre la notion de carte',
      'Développer la culture générale'
    ],
    materials: [
      'Atlas ou globe terrestre',
      'Frise chronologique',
      'Images ou vidéos'
    ],
    steps: [
      'Choisir un thème (ex: Les châteaux forts).',
      'Localiser le lieu sur une carte ou un globe.',
      'Lire ou visionner un contenu adapté.',
      'Demander à l’enfant de présenter ce qu’il a retenu.'
    ],
    tips: 'Créez un carnet de voyage où l’enfant colle des images et écrit ses découvertes.',
    skillTags: ['Culture', 'Analyse'],
    recommended: true
  }
];

const activitiesById = activities.reduce((acc, activity) => {
  acc[activity.id] = activity;
  return acc;
}, {});

function getActivitiesByCategory() {
  return categories.reduce((acc, category) => {
    acc[category.id] = activities.filter(activity => activity.categoryId === category.id);
    return acc;
  }, {});
}

function getActivityById(activityId) {
  return activitiesById[activityId] || null;
}

function getAgeFilters() {
  return [
    { id: 'all', label: 'Tous les âges' },
    { id: '0-3', label: '0-3 ans' },
    { id: '3-6', label: '3-6 ans' },
    { id: '6-12', label: '6-12 ans' },
    { id: '12+', label: '12+ ans' }
  ];
}

module.exports = {
  categories,
  activities,
  getActivitiesByCategory,
  getActivityById,
  getAgeFilters
};
