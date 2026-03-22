// ============================================================
// CLOTHES DATABASE
// This will eventually be fetched from Supabase.
// Each item includes real washing instructions for pedagogy.
//
// MULTI-CATEGORY SYSTEM:
// - cat: primary (correct) category → full points
// - acceptedCats: secondary valid categories → partial points
//   Format: [{ id: 'catId', score: 0.5, reason: '...' }]
//   score is a multiplier (0.5 = 50% of base points)
// - If neither cat nor acceptedCats match → harsh penalty
// ============================================================

export const CATEGORIES = [
  { id: 'blanc', icon: '⬜', name: 'Blancs', color: '#f0f0f0', desc: 'Vêtements blancs — lavage séparé pour éviter les transferts de couleur' },
  { id: 'couleur', icon: '🌈', name: 'Couleurs', color: '#e74c3c', desc: 'Vêtements colorés — trier par couleurs similaires' },
  { id: 'sombre', icon: '⬛', name: 'Sombres', color: '#2c3e50', desc: 'Vêtements sombres — laver à l\'envers pour préserver la couleur' },
  { id: 'delicat', icon: '🦢', name: 'Délicats', color: '#da70d6', desc: 'Textiles fragiles — programme délicat obligatoire' },
]

export const CLOTHES = [
  // ============================================================
  // BLANCS (primary)
  // ============================================================
  { id: 'w1', emoji: '👕', name: 'T-shirt blanc', cat: 'blanc', fabric: 'coton', maxTemp: 60,
    tip: 'Le coton blanc supporte les hautes températures. Idéal pour éliminer les bactéries !' },
  { id: 'w2', emoji: '👔', name: 'Chemise blanche', cat: 'blanc', fabric: 'coton', maxTemp: 40,
    tip: 'Une chemise se lave à 40°C max pour éviter le rétrécissement.' },
  { id: 'w3', emoji: '🩳', name: 'Short blanc', cat: 'blanc', fabric: 'coton', maxTemp: 40,
    tip: 'Les shorts en coton se lavent facilement à 40°C.' },
  { id: 'w4', emoji: '🧦', name: 'Chaussettes blanches', cat: 'blanc', fabric: 'coton', maxTemp: 60,
    tip: 'Les chaussettes en coton supportent 60°C. Lave-les à l\'envers !' },
  { id: 'w5', emoji: '🩲', name: 'Sous-vêtements blancs', cat: 'blanc', fabric: 'coton', maxTemp: 60,
    tip: 'Pour l\'hygiène, les sous-vêtements en coton se lavent à 60°C.' },
  { id: 'w6', emoji: '🧴', name: 'Torchon blanc', cat: 'blanc', fabric: 'coton', maxTemp: 90,
    tip: 'Les torchons de cuisine se lavent à 90°C pour tuer les bactéries !' },
  { id: 'w7', emoji: '🩳', name: 'Caleçon blanc', cat: 'blanc', fabric: 'coton', maxTemp: 60,
    tip: 'Le coton blanc peut même supporter un lavage à 90°C si très sale.' },
  { id: 'w8', emoji: '🧻', name: 'Drap blanc', cat: 'blanc', fabric: 'coton', maxTemp: 60,
    tip: 'Les draps en coton se lavent à 60°C. Change-les chaque semaine !' },

  // ============================================================
  // COULEURS (primary)
  // ============================================================
  { id: 'c1', emoji: '👕', name: 'T-shirt rouge', cat: 'couleur', fabric: 'coton', maxTemp: 40,
    tip: 'Les vêtements rouges déteignent facilement ! Toujours les séparer au début.' },
  { id: 'c2', emoji: '👗', name: 'Robe bleue', cat: 'couleur', fabric: 'polyester', maxTemp: 40,
    tip: 'Le polyester sèche vite et ne se froisse pas trop.' },
  { id: 'c3', emoji: '🧣', name: 'Écharpe verte', cat: 'couleur', fabric: 'acrylique', maxTemp: 30,
    tip: 'L\'acrylique est synthétique : lavage à froid recommandé.' },
  { id: 'c4', emoji: '👕', name: 'Pull jaune', cat: 'couleur', fabric: 'coton', maxTemp: 40,
    tip: 'Les couleurs vives se préservent mieux à 40°C max.' },
  { id: 'c5', emoji: '🩳', name: 'Short orange', cat: 'couleur', fabric: 'coton', maxTemp: 40,
    tip: 'Les couleurs chaudes (rouge, orange) déteignent plus que les froides.' },
  { id: 'c6', emoji: '🧢', name: 'Casquette colorée', cat: 'couleur', fabric: 'coton', maxTemp: 30,
    tip: 'Les casquettes se déforment en machine. Préfère le lavage à la main !' },
  { id: 'c7', emoji: '👕', name: 'Polo vert', cat: 'couleur', fabric: 'coton', maxTemp: 40,
    tip: 'Un polo se lave boutonné pour garder sa forme.' },
  { id: 'c8', emoji: '🧦', name: 'Chaussettes à motifs', cat: 'couleur', fabric: 'coton', maxTemp: 40,
    tip: 'Les chaussettes colorées se lavent avec les couleurs, pas les blancs !' },
  { id: 'c9', emoji: '👕', name: 'Sweat à capuche rose', cat: 'couleur', fabric: 'coton', maxTemp: 30,
    tip: 'Ferme la capuche pour éviter qu\'elle s\'emmêle en machine.' },
  { id: 'c10', emoji: '🩳', name: 'Bermuda à fleurs', cat: 'couleur', fabric: 'coton', maxTemp: 40,
    tip: 'Les imprimés se préservent mieux lavés à l\'envers.' },

  // ============================================================
  // SOMBRES (primary)
  // ============================================================
  { id: 's1', emoji: '👖', name: 'Jean foncé', cat: 'sombre', fabric: 'denim', maxTemp: 30,
    tip: 'Le denim se lave à froid, à l\'envers. Moins tu le laves, plus il dure !' },
  { id: 's2', emoji: '🧥', name: 'Manteau noir', cat: 'sombre', fabric: 'polyester', maxTemp: 30,
    tip: 'Les manteaux se lavent rarement en machine. Vérifie l\'étiquette !' },
  { id: 's3', emoji: '👕', name: 'T-shirt noir', cat: 'sombre', fabric: 'coton', maxTemp: 40,
    tip: 'Lave les noirs à l\'envers pour éviter le blanchiment.' },
  { id: 's4', emoji: '🧤', name: 'Gants noirs', cat: 'sombre', fabric: 'cuir', maxTemp: 0,
    tip: '⚠️ Le cuir ne va JAMAIS en machine ! Nettoyage spécial uniquement.' },
  { id: 's5', emoji: '🧦', name: 'Chaussettes noires', cat: 'sombre', fabric: 'coton', maxTemp: 40,
    tip: 'Regrouper les chaussettes par paire AVANT le lavage = gain de temps !' },
  { id: 's6', emoji: '👕', name: 'Hoodie noir', cat: 'sombre', fabric: 'coton', maxTemp: 30,
    tip: 'Les sweats noirs se décolorent vite : programme court à 30°C max.' },
  { id: 's7', emoji: '👖', name: 'Pantalon cargo kaki', cat: 'sombre', fabric: 'coton', maxTemp: 40,
    tip: 'Vide bien les poches des pantalons cargo avant le lavage !' },
  { id: 's8', emoji: '🧥', name: 'Veste en cuir', cat: 'sombre', fabric: 'cuir', maxTemp: 0,
    tip: '⚠️ Jamais de cuir en machine ! Utilise un chiffon humide.' },
  { id: 's9', emoji: '👕', name: 'T-shirt gris foncé', cat: 'sombre', fabric: 'coton', maxTemp: 40,
    tip: 'Le gris foncé va avec les sombres pour éviter de ternir les blancs.' },

  // ============================================================
  // DÉLICATS (primary)
  // ============================================================
  { id: 'd1', emoji: '👙', name: 'Maillot de bain', cat: 'delicat', fabric: 'élasthanne', maxTemp: 30,
    tip: 'L\'élasthanne se détériore à haute température. Toujours à froid !' },
  { id: 'd2', emoji: '🧶', name: 'Pull en laine', cat: 'delicat', fabric: 'laine', maxTemp: 30,
    tip: 'La laine rétrécit à chaud ! Programme laine/délicat obligatoire.' },
  { id: 'd3', emoji: '👗', name: 'Robe en soie', cat: 'delicat', fabric: 'soie', maxTemp: 30,
    tip: 'La soie est très fragile. Lavage à la main recommandé ou filet de lavage.' },
  { id: 'd4', emoji: '🩱', name: 'Lingerie fine', cat: 'delicat', fabric: 'dentelle', maxTemp: 30,
    tip: 'Toujours utiliser un filet de lavage pour la lingerie !' },
  { id: 'd5', emoji: '👘', name: 'Kimono', cat: 'delicat', fabric: 'soie', maxTemp: 30,
    tip: 'Les vêtements traditionnels en soie nécessitent un soin particulier.' },
  { id: 'd6', emoji: '🧣', name: 'Écharpe en cachemire', cat: 'delicat', fabric: 'cachemire', maxTemp: 20,
    tip: 'Le cachemire est encore plus fragile que la laine. Lavage à la main à froid !' },
  { id: 'd7', emoji: '👗', name: 'Robe en dentelle', cat: 'delicat', fabric: 'dentelle', maxTemp: 30,
    tip: 'La dentelle se déchire facilement. Utilise un filet et programme délicat.' },
  { id: 'd8', emoji: '🧥', name: 'Doudoune', cat: 'delicat', fabric: 'duvet', maxTemp: 30,
    tip: 'La doudoune se lave en machine mais avec des balles de tennis pour garder le gonflant !' },

  // ============================================================
  // MULTI-CATÉGORIES — Les pièges pédagogiques !
  // Certains vêtements peuvent aller dans plusieurs paniers.
  // acceptedCats = catégories alternatives valables (score partiel)
  // ============================================================

  // Gris clair → blanc OU sombre (débat classique !)
  { id: 'm1', emoji: '👕', name: 'T-shirt gris clair', cat: 'blanc', fabric: 'coton', maxTemp: 40,
    acceptedCats: [{ id: 'sombre', score: 0.5, reason: 'Acceptable avec les sombres, mais idéalement avec les blancs !' }],
    tip: 'Le gris clair se lave généralement avec les blancs, sauf si très foncé.' },

  // Jean clair → couleur OU sombre
  { id: 'm2', emoji: '👖', name: 'Jean clair', cat: 'couleur', fabric: 'denim', maxTemp: 30,
    acceptedCats: [{ id: 'sombre', score: 0.4, reason: 'Possible avec les sombres, mais risque de décoloration !' }],
    tip: 'Le jean clair se lave avec les couleurs. À l\'envers et à froid !' },

  // Pull en laine coloré → délicat OU couleur
  { id: 'm3', emoji: '🧶', name: 'Pull en laine coloré', cat: 'delicat', fabric: 'laine', maxTemp: 30,
    acceptedCats: [{ id: 'couleur', score: 0.4, reason: 'C\'est coloré oui, mais c\'est de la LAINE ! Programme délicat obligatoire.' }],
    tip: 'Même coloré, la laine reste fragile. Toujours en mode délicat !' },

  // Chemise rose pâle → couleur OU blanc
  { id: 'm4', emoji: '👔', name: 'Chemise rose pâle', cat: 'couleur', fabric: 'coton', maxTemp: 40,
    acceptedCats: [{ id: 'blanc', score: 0.5, reason: 'Le rose pâle peut aller avec les blancs si le vêtement est vieux et ne déteint plus.' }],
    tip: 'Le rose pâle est une couleur ! On le met avec les couleurs claires.' },

  // Maillot de foot → couleur OU délicat (synthétique)
  { id: 'm5', emoji: '⚽', name: 'Maillot de foot', cat: 'couleur', fabric: 'polyester', maxTemp: 30,
    acceptedCats: [{ id: 'delicat', score: 0.6, reason: 'Le synthétique est sensible à la chaleur, donc délicat est un bon choix !' }],
    tip: 'Les maillots de sport synthétiques se lavent à froid pour préserver les fibres.' },

  // Pyjama en satin → délicat OU couleur
  { id: 'm6', emoji: '🌙', name: 'Pyjama en satin', cat: 'delicat', fabric: 'satin', maxTemp: 30,
    acceptedCats: [{ id: 'couleur', score: 0.3, reason: 'C\'est coloré mais le satin est FRAGILE. Délicat = obligatoire !' }],
    tip: 'Le satin se traite comme la soie : programme délicat et filet de lavage.' },

  // Legging sport noir → sombre OU délicat
  { id: 'm7', emoji: '🦵', name: 'Legging sport noir', cat: 'sombre', fabric: 'élasthanne', maxTemp: 30,
    acceptedCats: [{ id: 'delicat', score: 0.6, reason: 'L\'élasthanne est fragile, donc délicat est un bon réflexe !' }],
    tip: 'Les leggings en élasthanne se lavent à froid pour garder leur élasticité.' },

  // Nappe brodée blanche → blanc OU délicat
  { id: 'm8', emoji: '🍽️', name: 'Nappe brodée blanche', cat: 'blanc', fabric: 'lin', maxTemp: 40,
    acceptedCats: [{ id: 'delicat', score: 0.6, reason: 'La broderie est fragile ! Le programme délicat la protège mieux.' }],
    tip: 'Le lin brodé est blanc mais fragile. Programme délicat recommandé pour les broderies.' },

  // Drap housse foncé → sombre OU couleur
  { id: 'm9', emoji: '🛏️', name: 'Drap housse bleu foncé', cat: 'sombre', fabric: 'coton', maxTemp: 60,
    acceptedCats: [{ id: 'couleur', score: 0.4, reason: 'Bleu foncé = sombres. Avec les couleurs, risque de déteinture.' }],
    tip: 'Les draps foncés se lavent avec les sombres. Ils peuvent déteindre sur les clairs.' },

  // Veste en jean → couleur OU sombre
  { id: 'm10', emoji: '🧥', name: 'Veste en jean', cat: 'couleur', fabric: 'denim', maxTemp: 30,
    acceptedCats: [{ id: 'sombre', score: 0.5, reason: 'Le denim classique peut aller avec les sombres, mais attention au transfert de couleur.' }],
    tip: 'La veste en jean se lave à l\'envers, boutonnée, à 30°C max.' },

  // Serviette de bain blanche → blanc OU délicat si brodée
  { id: 'm11', emoji: '🛁', name: 'Serviette éponge blanche', cat: 'blanc', fabric: 'coton éponge', maxTemp: 60,
    acceptedCats: [{ id: 'couleur', score: 0.3, reason: 'Blanche = avec les blancs ! Avec les couleurs, elle va rosir.' }],
    tip: 'Les serviettes blanches en éponge supportent 60°C. Lave-les seules ou avec les blancs.' },

  // Robe d'été imprimée → couleur OU délicat
  { id: 'm12', emoji: '👗', name: 'Robe d\'été imprimée', cat: 'couleur', fabric: 'viscose', maxTemp: 30,
    acceptedCats: [{ id: 'delicat', score: 0.6, reason: 'La viscose est fragile quand elle est mouillée ! Délicat est un bon choix.' }],
    tip: 'La viscose perd sa forme quand elle est mouillée. Programme délicat et essorage doux.' },

  // Costume / veston → sombre OU délicat
  { id: 'm13', emoji: '🤵', name: 'Veston de costume', cat: 'sombre', fabric: 'laine mélangée', maxTemp: 30,
    acceptedCats: [{ id: 'delicat', score: 0.7, reason: 'Excellent réflexe ! Les costumes sont effectivement des pièces délicates.' }],
    tip: 'Un costume ne se lave quasiment jamais en machine. Préfère le pressing !' },

  // Chaussures en toile → couleur OU sombre
  { id: 'm14', emoji: '👟', name: 'Baskets en toile', cat: 'couleur', fabric: 'toile', maxTemp: 30,
    acceptedCats: [{ id: 'sombre', score: 0.4, reason: 'Si elles sont foncées oui, mais la toile colorée va mieux avec les couleurs.' }],
    tip: 'Les baskets en toile se lavent en machine à 30°C. Retire les lacets et semelles !' },

  // T-shirt tie-dye → couleur (piège : il déteint !)
  { id: 'm15', emoji: '🌀', name: 'T-shirt tie-dye', cat: 'couleur', fabric: 'coton', maxTemp: 30,
    acceptedCats: [{ id: 'delicat', score: 0.3, reason: 'Le tie-dye peut déteindre. Couleurs est mieux, mais lave-le seul les premières fois !' }],
    tip: 'Le tie-dye déteint énormément les premières lessives ! Lave-le seul ou avec du vieux linge.' },

  // Couverture polaire → délicat OU couleur
  { id: 'm16', emoji: '🧸', name: 'Couverture polaire', cat: 'delicat', fabric: 'polyester polaire', maxTemp: 30,
    acceptedCats: [{ id: 'couleur', score: 0.4, reason: 'La polaire est synthétique et fragile. Le mode délicat évite de la boullocher.' }],
    tip: 'La polaire se bouilloche en machine. Programme délicat, pas d\'adoucissant !' },
]

// Helper: evaluate a sort choice for a clothing item
// Returns: { result: 'perfect'|'accepted'|'wrong', score, reason, tip }
export function evaluateSort(item, chosenCatId) {
  // Perfect match
  if (chosenCatId === item.cat) {
    return { result: 'perfect', score: 25, reason: null, tip: item.tip }
  }

  // Check accepted secondary categories
  if (item.acceptedCats) {
    const accepted = item.acceptedCats.find(ac => ac.id === chosenCatId)
    if (accepted) {
      const partialScore = Math.round(25 * accepted.score)
      return {
        result: 'accepted',
        score: partialScore,
        reason: accepted.reason,
        tip: item.tip,
      }
    }
  }

  // Totally wrong
  return { result: 'wrong', score: -15, reason: null, tip: null }
}

// Get difficulty-based subset of clothes
export function getClothesForLevel(level) {
  const pool = [...CLOTHES]
  // At level 1-2: exclude most multi-cat items (only 2 max)
  // At level 3+: include all multi-cat items
  // At level 5+: bias toward multi-cat items
  if (level <= 2) {
    const simple = pool.filter(c => !c.acceptedCats)
    const multi = pool.filter(c => c.acceptedCats)
    // Add just 2 multi-cat items for a taste
    const selected = [...simple, ...multi.slice(0, 2)]
    return selected
  }
  if (level >= 5) {
    // Bias toward tricky items
    const multi = pool.filter(c => c.acceptedCats)
    const simple = pool.filter(c => !c.acceptedCats)
    return [...multi, ...multi, ...simple] // multi-cat items appear twice
  }
  return pool
}

export const SOAPS = [
  { id: 'eco', name: 'Éco Bio', emoji: '🌿', power: 1, desc: 'Doux pour la planète et les textiles délicats' },
  { id: 'classique', name: 'Classique', emoji: '🧴', power: 2, desc: 'La lessive standard, efficace au quotidien' },
  { id: 'mega', name: 'Méga Clean', emoji: '💪', power: 3, desc: 'Extra-puissant contre les taches tenaces' },
  { id: 'nucleaire', name: 'Nucléaire', emoji: '☢️', power: 4, desc: 'Dangereux mais efficace... à tes risques et périls !' },
]

export const TEMPS = [
  { id: 'cold', label: 'Froid', temp: '20°C', val: 20, icon: '❄️' },
  { id: 'warm', label: 'Tiède', temp: '40°C', val: 40, icon: '🌤️' },
  { id: 'hot', label: 'Chaud', temp: '60°C', val: 60, icon: '🔥' },
  { id: 'boil', label: 'Bouillant', temp: '90°C', val: 90, icon: '🌋' },
]

export const STAINS = ['🟤', '🔴', '🟢', '🟡', '🟣', '☕', '🍷', '🫗', '🍫', '🖊️', '💄', '🥫']

export const FOLD_DIRS = [
  { emoji: '⬆️', name: 'Haut' },
  { emoji: '⬇️', name: 'Bas' },
  { emoji: '⬅️', name: 'Gauche' },
  { emoji: '➡️', name: 'Droite' },
]

export const EVENTS = [
  { icon: '🧦', title: 'Chaussette Disparue !', text: 'Une chaussette a été aspirée dans la 4ème dimension. Classique.', scoreMod: -50 },
  { icon: '🐱', title: 'Chat dans la machine !', text: 'Miaou ! Votre chat s\'est glissé dans le tambour. -1 vie pour le récupérer.', lifeMod: -1 },
  { icon: '🍫', title: 'Tache mystère !', text: 'Une tache de chocolat est apparue de nulle part. D\'où vient-elle ?!', scoreMod: -30 },
  { icon: '💰', title: 'Pièce trouvée !', text: 'Vous avez trouvé 2€ dans une poche ! Petit bonus !', scoreMod: 100 },
  { icon: '🌊', title: 'Inondation !', text: 'Trop de lessive ! De la mousse partout dans la cuisine !', scoreMod: -80 },
  { icon: '🎵', title: 'La machine chante !', text: 'Votre machine produit un beat techno incroyable. +Ambiance !', scoreMod: 50 },
  { icon: '🦴', title: 'Os de dinosaure !', text: 'Un fossile dans la poche du jean ?! Bonus archéologie !', scoreMod: 150 },
  { icon: '📱', title: 'Téléphone oublié !', text: 'Oh non ! Un téléphone était dans la poche du pantalon !', scoreMod: -100 },
  { icon: '✨', title: 'Lessive magique !', text: 'Votre lessive brille d\'une aura mystique. Combo x2 !', comboMod: 2 },
  { icon: '🧲', title: 'Aimant rebelle !', text: 'Un aimant colle toutes les fermetures éclair ensemble !', scoreMod: -40 },
  { icon: '🎰', title: 'Jackpot lessive !', text: 'Tu as trouvé un billet de loto gagnant dans une poche !', scoreMod: 200 },
  { icon: '🐹', title: 'Hamster fugueur !', text: 'Le hamster du voisin était caché dans ton linge !', scoreMod: -20 },
  { icon: '🧸', title: 'Ours en peluche !', text: 'Un doudou était caché dans les draps. Il a survécu !', scoreMod: 30 },
  { icon: '💍', title: 'Bague cachée !', text: 'Tu as retrouvé une bague perdue depuis 6 mois !', scoreMod: 120 },
  { icon: '🍕', title: 'Morceau de pizza !', text: 'Qui a mis de la pizza dans la poche du jean ?!', scoreMod: -60 },
]
