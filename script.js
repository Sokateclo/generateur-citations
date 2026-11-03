const CITATIONS_INITIALES = [
  { texte: "Le succès c'est tomber sept fois, se relever huit.", auteur: "Proverbe japonais", tags: ["motivation"] },
  { texte: "La vie c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", auteur: "Albert Einstein", tags: ["vie", "sagesse"] },
  { texte: "Le seul moyen de faire du bon travail est d'aimer ce que vous faites.", auteur: "Steve Jobs", tags: ["travail", "motivation"] },
  { texte: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", auteur: "Sénèque", tags: ["courage", "sagesse"] },
  { texte: "Le voyage de mille lieues commence par un premier pas.", auteur: "Lao Tseu", tags: ["voyage", "motivation"] }
];

const CLES_STORAGE = {
  citations: 'citations-personnelles',
  favoris: 'citations-favorites',
  theme: 'theme'
};

const elements = {
  body: document.body,
  citation: document.getElementById('citation'),
  auteur: document.getElementById('auteur'),
  tags: document.getElementById('tags-citation'),
  filtreTag: document.getElementById('filtre-tag'),
  btnFavori: document.getElementById('btn-favori'),
  btnNouvelle: document.getElementById('btn-nouvelle'),
  btnCopier: document.getElementById('btn-copier'),
  btnPartager: document.getElementById('btn-partager'),
  btnExporter: document.getElementById('btn-exporter'),
  btnMonde: document.getElementById('btn-monde'),
  btnTheme: document.getElementById('btn-theme'),
  formCitation: document.getElementById('form-citation'),
  texteCitation: document.getElementById('texte-citation'),
  auteurCitation: document.getElementById('auteur-citation'),
  tagsCitation: document.getElementById('tags-citation-input'),
  recherche: document.getElementById('recherche-citations'),
  panneauRecherche: document.getElementById('panneau-recherche'),
  compteurResultats: document.getElementById('compteur-resultats'),
  listeResultats: document.getElementById('liste-resultats'),
  resultatsVides: document.getElementById('resultats-vides'),
  compteurFavoris: document.getElementById('compteur-favoris'),
  listeFavoris: document.getElementById('liste-favoris'),
  favorisVides: document.getElementById('favoris-vides'),
  listeToutes: document.getElementById('liste-toutes'),
  onglets: document.querySelectorAll('.onglet'),
  vues: {
    random: document.getElementById('vue-random'),
    all: document.getElementById('vue-all'),
    fav: document.getElementById('vue-fav')
  }
};

const state = {
  citationsPersonnelles: chargerTableau(CLES_STORAGE.citations),
  favoris: chargerTableau(CLES_STORAGE.favoris),
  citationActuelle: null,
  tagActif: null,
  recherche: '',
  vue: vueDepuisUrl(),
  themeSombre: chargerValeur(CLES_STORAGE.theme) === 'sombre'
};

state.citationsPersonnelles = state.citationsPersonnelles.map(normaliserCitation);
state.favoris = state.favoris.map(normaliserCitation);
state.citations = [...CITATIONS_INITIALES, ...state.citationsPersonnelles];

/**
 * Normalise une citation afin de garantir une structure stable pour le rendu.
 * @param {Object} citation
 * @returns {Object}
 */
function normaliserCitation(citation) {
  return {
    ...citation,
    texte: typeof citation.texte === 'string' ? citation.texte.trim() : '',
    auteur: typeof citation.auteur === 'string' ? citation.auteur.trim() : '',
    tags: Array.isArray(citation.tags)
      ? [...new Set(citation.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim()))]
      : []
  };
}

/**
 * Lit et parse un tableau JSON depuis localStorage.
 * @param {string} cle
 * @returns {Object[]}
 */
function chargerTableau(cle) {
  const valeur = localStorage.getItem(cle);
  if (!valeur) {
    return [];
  }

  try {
    const donnees = JSON.parse(valeur);
    return Array.isArray(donnees) ? donnees : [];
  } catch (erreur) {
    console.error(`Impossible de charger ${cle}.`, erreur);
    return [];
  }
}

/**
 * Sauvegarde un tableau JSON dans localStorage.
 * @param {string} cle
 * @param {Object[]} donnees
 */
function sauvegarderTableau(cle, donnees) {
  localStorage.setItem(cle, JSON.stringify(donnees));
}

/**
 * Lit une valeur simple depuis localStorage.
 * @param {string} cle
 * @returns {string|null}
 */
function chargerValeur(cle) {
  return localStorage.getItem(cle);
}

/**
 * Sauvegarde une valeur simple dans localStorage.
 * @param {string} cle
 * @param {string} valeur
 */
function sauvegarderValeur(cle, valeur) {
  localStorage.setItem(cle, valeur);
}

/**
 * Compare deux citations sur leur contenu fonctionnel.
 * @param {Object} citationA
 * @param {Object} citationB
 * @returns {boolean}
 */
function memesCitation(citationA, citationB) {
  return citationA.texte === citationB.texte && citationA.auteur === citationB.auteur;
}

/**
 * Extrait des tags uniques depuis une saisie séparée par des virgules.
 * @param {string} valeur
 * @returns {string[]}
 */
function extraireTags(valeur) {
  return [...new Set(valeur.split(',').map((tag) => tag.trim()).filter(Boolean))];
}

/**
 * Retourne les citations correspondant aux filtres courants.
 * @param {Object} currentState
 * @returns {Object[]}
 */
function citationsFiltrees(currentState) {
  const recherche = currentState.recherche.toLocaleLowerCase();
  return currentState.citations.filter((citation) => {
    const correspondRecherche = !recherche
      || citation.texte.toLocaleLowerCase().includes(recherche)
      || citation.auteur.toLocaleLowerCase().includes(recherche);
    const correspondTag = !currentState.tagActif || citation.tags.includes(currentState.tagActif);
    return correspondRecherche && correspondTag;
  });
}

/**
 * Rend la citation active et son état favori dans le DOM.
 * @param {Object} currentState
 */
function renderCitation(currentState) {
  const citation = currentState.citationActuelle;
  if (!citation) {
    return;
  }

  elements.citation.textContent = `"${citation.texte}"`;
  elements.auteur.textContent = `— ${citation.auteur}`;
  renderTags(citation);
  elements.citation.classList.remove('anim');
  void elements.citation.offsetWidth;
  elements.citation.classList.add('anim');

  const estFavori = currentState.favoris.some((favori) => memesCitation(favori, citation));
  elements.btnFavori.disabled = false;
  elements.btnFavori.textContent = estFavori ? '★' : '☆';
  elements.btnFavori.setAttribute('aria-label', estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris');
  elements.btnFavori.setAttribute('aria-pressed', String(estFavori));
  renderFiltreTag(currentState);
}

/**
 * Rend les badges de tags d’une citation.
 * @param {Object} citation
 */
function renderTags(citation) {
  elements.tags.replaceChildren();
  citation.tags.forEach((tag) => {
    const bouton = document.createElement('button');
    bouton.className = 'tag';
    bouton.type = 'button';
    bouton.textContent = `#${tag}`;
    bouton.setAttribute('aria-label', `Filtrer par le tag ${tag}`);
    bouton.addEventListener('click', () => {
      state.tagActif = state.tagActif === tag ? null : tag;
      renderCitationAleatoire();
    });
    elements.tags.append(bouton);
  });
}

/**
 * Rend l’indication du filtre par tag actif.
 * @param {Object} currentState
 */
function renderFiltreTag(currentState) {
  elements.filtreTag.hidden = !currentState.tagActif;
  elements.filtreTag.textContent = currentState.tagActif
    ? `Filtre actif : #${currentState.tagActif} (cliquez sur le tag pour retirer)`
    : '';
}

/**
 * Rend les résultats de recherche dans le panneau dépliable.
 * @param {Object} currentState
 */
function renderRecherche(currentState) {
  const resultats = currentState.recherche ? citationsFiltrees(currentState) : [];
  elements.compteurResultats.textContent = resultats.length;
  elements.listeResultats.replaceChildren();
  elements.resultatsVides.hidden = resultats.length > 0 || !currentState.recherche;
  elements.panneauRecherche.open = Boolean(currentState.recherche);

  resultats.forEach((citation) => {
    const item = document.createElement('li');
    const bouton = creerBoutonCitation(citation, 'resultat-item', () => renderCitationUnique(citation));
    item.append(bouton);
    elements.listeResultats.append(item);
  });
}

/**
 * Rend la liste complète des citations.
 * @param {Object} currentState
 */
function renderToutes(currentState) {
  elements.listeToutes.replaceChildren();
  currentState.citations.forEach((citation) => {
    const item = document.createElement('li');
    item.append(creerBoutonCitation(citation, 'citation-item', () => {
      renderCitationUnique(citation);
      naviguerVers('random');
    }));
    elements.listeToutes.append(item);
  });
}

/**
 * Rend la liste des favoris.
 * @param {Object} currentState
 */
function renderFavoris(currentState) {
  elements.compteurFavoris.textContent = currentState.favoris.length;
  elements.listeFavoris.replaceChildren();
  elements.favorisVides.hidden = currentState.favoris.length > 0;

  currentState.favoris.forEach((favori, index) => {
    const item = document.createElement('li');
    item.className = 'favori-item';
    const contenu = document.createElement('div');
    contenu.className = 'favori-contenu';
    const texte = document.createElement('p');
    texte.className = 'favori-texte';
    texte.textContent = `"${favori.texte}"`;
    const auteur = document.createElement('p');
    auteur.className = 'favori-auteur';
    auteur.textContent = `— ${favori.auteur}`;
    const supprimer = document.createElement('button');
    supprimer.className = 'btn-supprimer-favori';
    supprimer.type = 'button';
    supprimer.textContent = '🗑️';
    supprimer.setAttribute('aria-label', 'Retirer ce favori');
    supprimer.addEventListener('click', () => retirerFavori(index));
    contenu.append(texte, auteur);
    item.append(contenu, supprimer);
    elements.listeFavoris.append(item);
  });
}

/**
 * Crée un bouton de citation réutilisable dans les listes.
 * @param {Object} citation
 * @param {string} classe
 * @param {Function} onClick
 * @returns {HTMLButtonElement}
 */
function creerBoutonCitation(citation, classe, onClick) {
  const bouton = document.createElement('button');
  bouton.className = classe;
  bouton.type = 'button';
  const texte = document.createElement('span');
  texte.textContent = `"${citation.texte}"`;
  const auteur = document.createElement('span');
  auteur.className = classe === 'resultat-item' ? 'resultat-auteur' : 'citation-item-auteur';
  auteur.textContent = `— ${citation.auteur}`;
  bouton.append(texte, auteur);
  bouton.addEventListener('click', onClick);
  return bouton;
}

/**
 * Rend l’état visuel de la navigation SPA.
 * @param {Object} currentState
 */
function renderVue(currentState) {
  Object.entries(elements.vues).forEach(([nom, section]) => {
    section.hidden = nom !== currentState.vue;
  });
  elements.onglets.forEach((onglet) => {
    const actif = onglet.dataset.vue === currentState.vue;
    onglet.classList.toggle('actif', actif);
    onglet.setAttribute('aria-selected', String(actif));
  });
  if (currentState.vue === 'all') {
    renderToutes(currentState);
  }
  if (currentState.vue === 'fav') {
    renderFavoris(currentState);
  }
}

/**
 * Rend le thème clair ou sombre.
 * @param {boolean} sombre
 */
function renderTheme(sombre) {
  elements.body.classList.toggle('sombre', sombre);
  elements.btnTheme.textContent = sombre ? '☀️' : '🌙';
  elements.btnTheme.setAttribute('aria-label', sombre ? 'Activer le mode clair' : 'Activer le mode sombre');
  elements.btnTheme.setAttribute('aria-pressed', String(sombre));
}

/**
 * Affiche une citation précise et rafraîchit ses contrôles.
 * @param {Object} citation
 */
function renderCitationUnique(citation) {
  state.citationActuelle = normaliserCitation(citation);
  renderCitation(state);
}

/**
 * Affiche une citation aléatoire selon le filtre de tag actif.
 */
function renderCitationAleatoire() {
  const disponibles = state.tagActif
    ? state.citations.filter((citation) => citation.tags.includes(state.tagActif))
    : state.citations;
  if (disponibles.length > 0) {
    renderCitationUnique(disponibles[Math.floor(Math.random() * disponibles.length)]);
  }
}

/**
 * Change de vue et met à jour l’URL avec History API.
 * @param {string} vue
 * @param {boolean} ajouterHistorique
 */
function naviguerVers(vue, ajouterHistorique = true) {
  const vueValide = Object.prototype.hasOwnProperty.call(elements.vues, vue) ? vue : 'random';
  state.vue = vueValide;
  renderVue(state);
  if (ajouterHistorique && window.location.hash !== `#${vueValide}`) {
    window.history.pushState({ vue: vueValide }, '', `#${vueValide}`);
  }
}

/**
 * Détermine la vue active à partir du fragment URL.
 * @returns {string}
 */
function vueDepuisUrl() {
  const hash = window.location.hash.slice(1);
  return Object.prototype.hasOwnProperty.call({ random: true, all: true, fav: true }, hash) ? hash : 'random';
}

/**
 * Supprime un favori et persiste le nouvel état.
 * @param {number} index
 */
function retirerFavori(index) {
  state.favoris.splice(index, 1);
  sauvegarderTableau(CLES_STORAGE.favoris, state.favoris);
  renderFavoris(state);
  renderCitation(state);
}

/**
 * Bascule le favori de la citation actuelle.
 */
function basculerFavori() {
  if (!state.citationActuelle) {
    return;
  }
  const index = state.favoris.findIndex((favori) => memesCitation(favori, state.citationActuelle));
  if (index === -1) {
    state.favoris.push(state.citationActuelle);
  } else {
    state.favoris.splice(index, 1);
  }
  sauvegarderTableau(CLES_STORAGE.favoris, state.favoris);
  renderFavoris(state);
  renderCitation(state);
}

/**
 * Retourne le texte de la citation affichée.
 * @returns {string}
 */
function texteCitationActuelle() {
  return `${elements.citation.textContent} ${elements.auteur.textContent}`;
}

/**
 * Affiche un retour temporaire sur un bouton.
 * @param {HTMLButtonElement} bouton
 * @param {string} message
 * @param {string} messageInitial
 */
function afficherRetour(bouton, message, messageInitial) {
  bouton.textContent = message;
  setTimeout(() => (bouton.textContent = messageInitial), 1500);
}

/**
 * Exporte la citation actuelle en PNG via la Canvas API.
 */
function exportEnImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const contexte = canvas.getContext('2d');
  if (!contexte) {
    return;
  }
  const gradient = contexte.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  contexte.fillStyle = gradient;
  contexte.fillRect(0, 0, canvas.width, canvas.height);
  contexte.textAlign = 'center';
  contexte.textBaseline = 'middle';
  contexte.fillStyle = '#ffffff';
  contexte.font = '72px "Segoe UI", sans-serif';
  contexte.fillText('✨', canvas.width / 2, 135);

  const citation = elements.citation.textContent;
  let taillePolice = citation.length > 180 ? 42 : citation.length > 100 ? 52 : 64;
  let lignes = [];
  const creerLignes = () => {
    contexte.font = `italic ${taillePolice}px "Segoe UI", sans-serif`;
    const resultat = [];
    let ligne = '';
    citation.split(' ').forEach((mot) => {
      const ligneTest = ligne ? `${ligne} ${mot}` : mot;
      if (contexte.measureText(ligneTest).width > 860 && ligne) {
        resultat.push(ligne);
        ligne = mot;
      } else {
        ligne = ligneTest;
      }
    });
    if (ligne) {
      resultat.push(ligne);
    }
    return resultat;
  };
  do {
    lignes = creerLignes();
    taillePolice -= lignes.length > 8 ? 2 : 0;
  } while (lignes.length > 8 && taillePolice > 28);
  contexte.font = `italic ${taillePolice}px "Segoe UI", sans-serif`;
  const hauteurLigne = taillePolice * 1.35;
  const debutCitation = 540 - ((lignes.length - 1) * hauteurLigne) / 2;
  lignes.forEach((ligne, index) => contexte.fillText(ligne, 540, debutCitation + index * hauteurLigne));
  contexte.font = '600 30px "Segoe UI", sans-serif';
  contexte.fillText(elements.auteur.textContent, 540, 900);
  const lien = document.createElement('a');
  lien.download = 'citation.png';
  lien.href = canvas.toDataURL('image/png');
  lien.click();
  afficherRetour(elements.btnExporter, 'Image téléchargée !', '🖼️ Exporter en image');
}

/**
 * Charge une citation distante, la stocke et l’affiche.
 */
async function chargerCitationDuMonde() {
  const texteInitial = elements.btnMonde.textContent;
  elements.btnMonde.disabled = true;
  elements.btnMonde.textContent = 'Chargement...';
  try {
    const reponse = await fetch('https://api.quotable.io/random');
    if (!reponse.ok) {
      throw new Error(`Erreur HTTP ${reponse.status}`);
    }
    const donnee = await reponse.json();
    if (!donnee.content || !donnee.author) {
      throw new Error('Réponse de l’API incomplète.');
    }
    const citation = normaliserCitation({
      texte: donnee.content,
      auteur: donnee.author,
      source: 'quotable.io',
      tags: Array.isArray(donnee.tags) ? donnee.tags : []
    });
    state.citations.push(citation);
    state.citationsPersonnelles.push(citation);
    sauvegarderTableau(CLES_STORAGE.citations, state.citationsPersonnelles);
    renderToutes(state);
    renderCitationUnique(citation);
  } catch (erreur) {
    console.error('Impossible de charger une citation du monde.', erreur);
    elements.btnMonde.textContent = 'Erreur de chargement';
    setTimeout(() => (elements.btnMonde.textContent = texteInitial), 2000);
  } finally {
    elements.btnMonde.disabled = false;
    if (elements.btnMonde.textContent === 'Chargement...') {
      elements.btnMonde.textContent = texteInitial;
    }
  }
}

/**
 * Enregistre une nouvelle citation saisie par l’utilisateur.
 * @param {SubmitEvent} event
 */
function ajouterCitation(event) {
  event.preventDefault();
  const citation = normaliserCitation({
    texte: elements.texteCitation.value,
    auteur: elements.auteurCitation.value,
    tags: extraireTags(elements.tagsCitation.value)
  });
  if (!citation.texte || !citation.auteur) {
    return;
  }
  state.citationsPersonnelles.push(citation);
  state.citations.push(citation);
  sauvegarderTableau(CLES_STORAGE.citations, state.citationsPersonnelles);
  renderToutes(state);
  renderCitationUnique(citation);
  elements.formCitation.reset();
}

elements.btnNouvelle.addEventListener('click', renderCitationAleatoire);
elements.btnFavori.addEventListener('click', basculerFavori);
elements.recherche.addEventListener('input', (event) => {
  state.recherche = event.target.value.trim();
  renderRecherche(state);
});
elements.onglets.forEach((onglet) => {
  onglet.addEventListener('click', () => naviguerVers(onglet.dataset.vue));
});
elements.btnTheme.addEventListener('click', () => {
  state.themeSombre = !state.themeSombre;
  renderTheme(state.themeSombre);
  sauvegarderValeur(CLES_STORAGE.theme, state.themeSombre ? 'sombre' : 'clair');
});
elements.btnCopier.addEventListener('click', async () => {
  await navigator.clipboard.writeText(texteCitationActuelle());
  afficherRetour(elements.btnCopier, 'Copié !', 'Copier');
});
elements.btnPartager.addEventListener('click', async () => {
  const texte = texteCitationActuelle();
  if (navigator.share) {
    await navigator.share({ title: 'Citation du moment', text: texte });
    afficherRetour(elements.btnPartager, 'Partagé !', 'Partager');
    return;
  }
  await navigator.clipboard.writeText(texte);
  afficherRetour(elements.btnPartager, 'Copié !', 'Partager');
});
elements.btnExporter.addEventListener('click', exportEnImage);
elements.btnMonde.addEventListener('click', chargerCitationDuMonde);
elements.formCitation.addEventListener('submit', ajouterCitation);
document.addEventListener('keydown', (event) => {
  const cible = event.target;
  const dansChamp = cible instanceof HTMLInputElement || cible instanceof HTMLTextAreaElement;
  if (event.code === 'Space' && !dansChamp) {
    event.preventDefault();
    renderCitationAleatoire();
  }
});
window.addEventListener('popstate', () => naviguerVers(vueDepuisUrl(), false));
window.addEventListener('hashchange', () => naviguerVers(vueDepuisUrl(), false));

renderTheme(state.themeSombre);
renderRecherche(state);
renderFavoris(state);
renderToutes(state);
naviguerVers(state.vue, false);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((erreur) => {
      console.error('Impossible d’enregistrer le service worker.', erreur);
    });
  });
}
