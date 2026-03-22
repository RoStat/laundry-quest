// ============================================================
// PEDAGOGICAL CONTENT
// Tips, quiz questions, and encyclopedia entries
// ============================================================

export const LAUNDRY_TIPS = [
  { id: 1, category: 'tri', title: 'Pourquoi trier ?', text: 'Le tri évite les transferts de couleur. Un seul t-shirt rouge peut teindre toute une machine de blancs en rose !' },
  { id: 2, category: 'tri', title: 'Le test de déteinte', text: 'Pour tester si un vêtement déteint : mouille un coin, frotte-le sur un tissu blanc. Si ça colore, lave-le séparément !' },
  { id: 3, category: 'lavage', title: 'La bonne dose', text: 'Trop de lessive ne lave pas mieux ! L\'excès crée de la mousse qui piège la saleté. Suis les dosages indiqués.' },
  { id: 4, category: 'lavage', title: '30°C suffit souvent', text: '80% des vêtements du quotidien se lavent très bien à 30°C. Tu économises de l\'énergie et tes vêtements durent plus longtemps !' },
  { id: 5, category: 'lavage', title: 'Retourner les vêtements', text: 'Lave tes jeans et t-shirts imprimés à l\'envers pour protéger les couleurs et les motifs.' },
  { id: 6, category: 'sechage', title: 'Jamais de laine au sèche-linge', text: 'La laine rétrécit énormément au sèche-linge. Fais-la toujours sécher à plat !' },
  { id: 7, category: 'sechage', title: 'Le soleil blanchit', text: 'Le soleil est un blanchisseur naturel ! Étends tes blancs au soleil pour les raviver. Mais attention aux couleurs qui peuvent pâlir.' },
  { id: 8, category: 'pliage', title: 'Plie tout de suite', text: 'Plus tu attends pour plier, plus les plis s\'incrustent. Plie dès la fin du séchage !' },
  { id: 9, category: 'general', title: 'Les poches !', text: 'TOUJOURS vérifier les poches avant le lavage. Mouchoirs en papier = cauchemar. Stylo = catastrophe.' },
  { id: 10, category: 'general', title: 'Le filet de lavage', text: 'Investis dans des filets de lavage : ils protègent la lingerie, les chaussettes (anti-disparition !) et les vêtements délicats.' },
  { id: 11, category: 'general', title: 'Ferme les zips', text: 'Les fermetures éclair ouvertes abîment les autres vêtements. Ferme-les toujours avant le lavage !' },
  { id: 12, category: 'ecolo', title: 'Lessiver moins', text: 'Un jean peut être porté 5-10 fois avant d\'être lavé. Les pulls aussi ! Aère-les entre les utilisations.' },
  { id: 13, category: 'ecolo', title: 'Programme éco', text: 'Le programme éco dure plus longtemps mais consomme beaucoup moins d\'eau et d\'énergie. Privilégie-le !' },
  { id: 14, category: 'symbols', title: 'Le triangle', text: '△ = blanchiment autorisé. △ barré = pas de blanchiment. △ avec Cl = javel OK.' },
  { id: 15, category: 'symbols', title: 'Le cercle', text: '○ = nettoyage à sec professionnel. Ne mets pas ce vêtement en machine !' },
  { id: 16, category: 'symbols', title: 'Le carré', text: '□ avec cercle = sèche-linge. Un point = basse temp. Deux points = haute temp. Barré = interdit.' },
]

export const QUIZ_QUESTIONS = [
  {
    question: 'À quelle température laver un pull en laine ?',
    answers: ['20°C', '30°C', '60°C', '90°C'],
    correct: 1,
    explanation: 'La laine se lave à 30°C maximum, avec un programme délicat. Au-dessus, elle rétrécit !',
  },
  {
    question: 'Que signifie ce symbole : 🔲 barré ?',
    answers: ['Pas de repassage', 'Pas de sèche-linge', 'Pas de lavage', 'Pas de javel'],
    correct: 1,
    explanation: 'Le carré barré signifie que le sèche-linge est interdit pour ce vêtement.',
  },
  {
    question: 'Pourquoi retourner un jean avant le lavage ?',
    answers: ['Pour le fun', 'Pour protéger la couleur', 'Pour qu\'il sèche plus vite', 'Par superstition'],
    correct: 1,
    explanation: 'Retourner le jean protège la couleur du tissu et réduit l\'usure visible.',
  },
  {
    question: 'Combien de fois peut-on porter un jean avant lavage ?',
    answers: ['1 fois', '2-3 fois', '5-10 fois', 'Jamais le laver'],
    correct: 2,
    explanation: 'Un jean peut être porté 5-10 fois avant lavage. Moins on le lave, plus il dure !',
  },
  {
    question: 'Que faire si on a trop mis de lessive ?',
    answers: ['Relancer un cycle', 'Ajouter du vinaigre au rinçage', 'C\'est pas grave', 'Essorer 3 fois'],
    correct: 1,
    explanation: 'Le vinaigre blanc aide à éliminer l\'excès de lessive et assouplit le linge naturellement.',
  },
  {
    question: 'Le cuir va-t-il en machine à laver ?',
    answers: ['Oui à 30°C', 'Oui en programme délicat', 'Non jamais', 'Seulement le simili-cuir'],
    correct: 2,
    explanation: 'Le cuir ne va JAMAIS en machine ! Il nécessite un nettoyage spécialisé.',
  },
  {
    question: 'Quel est le meilleur moment pour plier le linge ?',
    answers: ['Le lendemain', 'Dès la fin du séchage', 'Quand on a le temps', 'Jamais, on pend tout'],
    correct: 1,
    explanation: 'Plier dès la fin du séchage évite que les plis ne s\'incrustent.',
  },
  {
    question: 'Les chaussettes disparaissent-elles vraiment en machine ?',
    answers: ['Non c\'est un mythe', 'Oui, dans la 4ème dimension', 'Elles glissent dans le joint', 'C\'est le chat'],
    correct: 2,
    explanation: 'Les petits vêtements peuvent glisser entre le tambour et le joint de la porte !',
  },
  {
    question: 'Quelle lessive pour un bébé ?',
    answers: ['La plus puissante', 'Celle qui sent le plus bon', 'Hypoallergénique sans parfum', 'Du liquide vaisselle'],
    correct: 2,
    explanation: 'Pour les bébés, toujours une lessive hypoallergénique sans parfum ni colorant.',
  },
  {
    question: 'Comment enlever une tache de vin rouge ?',
    answers: ['Eau chaude', 'Sel + eau froide', 'Vin blanc', 'Ignorer et prier'],
    correct: 1,
    explanation: 'Le sel absorbe le vin rouge. Appliquer immédiatement avec de l\'eau froide (jamais chaude !).',
  },
]

export const ENCYCLOPEDIA = {
  fabrics: [
    { name: 'Coton', icon: '🌱', temp: '30-60°C', care: 'Facile d\'entretien, supporte hautes températures' },
    { name: 'Laine', icon: '🐑', temp: '20-30°C', care: 'Programme délicat, séchage à plat' },
    { name: 'Soie', icon: '🦋', temp: '20-30°C', care: 'Lavage à la main ou filet, jamais d\'essorage fort' },
    { name: 'Polyester', icon: '🧪', temp: '30-40°C', care: 'Sèche vite, résistant, peu de repassage' },
    { name: 'Lin', icon: '🌾', temp: '30-40°C', care: 'Se froisse facilement, repasser humide' },
    { name: 'Denim', icon: '👖', temp: '20-30°C', care: 'Laver à l\'envers, pas trop souvent' },
    { name: 'Élasthanne', icon: '🤸', temp: '20-30°C', care: 'Jamais de sèche-linge, perd son élasticité' },
    { name: 'Dentelle', icon: '🎀', temp: '20-30°C', care: 'Filet obligatoire, programme délicat' },
  ],
  symbols: [
    { symbol: '🔲', name: 'Lavage en machine', desc: 'Le chiffre indique la température max' },
    { symbol: '✋', name: 'Lavage à la main', desc: 'Ne pas dépasser 40°C' },
    { symbol: '🚫', name: 'Ne pas laver', desc: 'Nettoyage à sec uniquement' },
    { symbol: '△', name: 'Blanchiment', desc: 'Triangle = autorisé, barré = interdit' },
    { symbol: '□', name: 'Séchage', desc: 'Carré avec cercle = sèche-linge' },
    { symbol: '♨️', name: 'Repassage', desc: 'Points = température (1 = basse, 3 = haute)' },
    { symbol: '⭕', name: 'Nettoyage à sec', desc: 'Cercle = professionnel uniquement' },
  ],
}
