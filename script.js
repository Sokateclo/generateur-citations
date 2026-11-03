const citationsInitiales = [
  { texte: "Le succès c'est tomber sept fois, se relever huit.", auteur: "Proverbe japonais" },
  { texte: "La vie c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", auteur: "Albert Einstein" },
  { texte: "Le seul moyen de faire du bon travail est d'aimer ce que vous faites.", auteur: "Steve Jobs" },
  { texte: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", auteur: "Sénèque" },
  { texte: "Le voyage de mille lieues commence par un premier pas.", auteur: "Lao Tseu" }
];

const cleCitationsPersonnelles = 'citations-personnelles';
const cleFavoris = 'citations-favorites';

function chargerCitationsPersonnelles() {
  const citationsSauvegardees = localStorage.getItem(cleCitationsPersonnelles);

  if (!citationsSauvegardees) {
    return [];
  }

  try {
    const citationsParsees = JSON.parse(citationsSauvegardees);
    return Array.isArray(citationsParsees) ? citationsParsees : [];
  } catch (erreur) {
    console.error('Impossible de charger les citations personnelles.', erreur);
    return [];
  }
}

function chargerCitations(cle) {
  const citationsSauvegardees = localStorage.getItem(cle);

  if (!citationsSauvegardees) {
    return [];
  }

  try {
    const citationsParsees = JSON.parse(citationsSauvegardees);
    return Array.isArray(citationsParsees) ? citationsParsees : [];
  } catch (erreur) {
    console.error(`Impossible de charger les citations depuis ${cle}.`, erreur);
    return [];
  }
}

const citationsPersonnelles = chargerCitationsPersonnelles();
const citations = [...citationsInitiales, ...citationsPersonnelles];
const favoris = chargerCitations(cleFavoris);

const elCitation = document.getElementById('citation');
const elAuteur = document.getElementById('auteur');
const btnNouvelle = document.getElementById('btn-nouvelle');
const btnCopier = document.getElementById('btn-copier');
const btnPartager = document.getElementById('btn-partager');
const btnTheme = document.getElementById('btn-theme');
const formCitation = document.getElementById('form-citation');
const texteCitation = document.getElementById('texte-citation');
const auteurCitation = document.getElementById('auteur-citation');
const btnFavori = document.getElementById('btn-favori');
const compteurFavoris = document.getElementById('compteur-favoris');
const listeFavoris = document.getElementById('liste-favoris');
const favorisVides = document.getElementById('favoris-vides');
let citationActuelle = null;

// Fonction qui bascule le thème clair/sombre et sauvegarde dans localStorage.
function appliquerTheme(sombre) {
  document.body.classList.toggle('sombre', sombre);
  btnTheme.textContent = sombre ? '☀️' : '🌙';
  btnTheme.setAttribute('aria-label', sombre ? 'Activer le mode clair' : 'Activer le mode sombre');
  btnTheme.setAttribute('aria-pressed', String(sombre));
}

const themeSombre = localStorage.getItem('theme') === 'sombre';
appliquerTheme(themeSombre);

// Fonction qui affiche la citation avec une animation fade-in.
function afficherCitation(citation) {
  citationActuelle = citation;
  elCitation.textContent = `"${citation.texte}"`;
  elAuteur.textContent = `— ${citation.auteur}`;
  elCitation.classList.remove('anim');
  void elCitation.offsetWidth;
  elCitation.classList.add('anim');
  btnFavori.disabled = false;
  actualiserBoutonFavori();
}

// Fonction qui choisit une citation au hasard.
function afficherCitationAleatoire() {
  const index = Math.floor(Math.random() * citations.length);
  afficherCitation(citations[index]);
}

btnNouvelle.addEventListener('click', afficherCitationAleatoire);

document.addEventListener('keydown', (event) => {
  const elementActif = event.target;
  const dansChampSaisie = elementActif instanceof HTMLInputElement
    || elementActif instanceof HTMLTextAreaElement;

  if (event.code === 'Space' && !dansChampSaisie) {
    event.preventDefault();
    afficherCitationAleatoire();
  }
});

btnTheme.addEventListener('click', () => {
  const sombre = !document.body.classList.contains('sombre');
  appliquerTheme(sombre);
  localStorage.setItem('theme', sombre ? 'sombre' : 'clair');
});

function sontMemeCitation(citationA, citationB) {
  return citationA.texte === citationB.texte && citationA.auteur === citationB.auteur;
}

function actualiserBoutonFavori() {
  const estFavori = citationActuelle && favoris.some((favori) => sontMemeCitation(favori, citationActuelle));
  btnFavori.textContent = estFavori ? '★' : '☆';
  btnFavori.setAttribute('aria-label', estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris');
  btnFavori.setAttribute('aria-pressed', String(Boolean(estFavori)));
}

function sauvegarderFavoris() {
  localStorage.setItem(cleFavoris, JSON.stringify(favoris));
  afficherFavoris();
}

function afficherFavoris() {
  compteurFavoris.textContent = favoris.length;
  listeFavoris.replaceChildren();
  favorisVides.hidden = favoris.length > 0;

  favoris.forEach((favori, index) => {
    const element = document.createElement('li');
    element.className = 'favori-item';

    const contenu = document.createElement('div');
    contenu.className = 'favori-contenu';

    const texte = document.createElement('p');
    texte.className = 'favori-texte';
    texte.textContent = `"${favori.texte}"`;

    const auteur = document.createElement('p');
    auteur.className = 'favori-auteur';
    auteur.textContent = `— ${favori.auteur}`;

    const boutonSuppression = document.createElement('button');
    boutonSuppression.className = 'btn-supprimer-favori';
    boutonSuppression.type = 'button';
    boutonSuppression.textContent = '🗑️';
    boutonSuppression.setAttribute('aria-label', 'Retirer ce favori');
    boutonSuppression.addEventListener('click', () => {
      favoris.splice(index, 1);
      sauvegarderFavoris();
      actualiserBoutonFavori();
    });

    contenu.append(texte, auteur);
    element.append(contenu, boutonSuppression);
    listeFavoris.append(element);
  });
}

// Fonction qui ajoute la citation actuelle aux favoris (ou la retire) et met à jour le bouton étoile.
btnFavori.addEventListener('click', () => {
  if (!citationActuelle) {
    return;
  }

  const indexFavori = favoris.findIndex((favori) => sontMemeCitation(favori, citationActuelle));

  if (indexFavori === -1) {
    favoris.push(citationActuelle);
  } else {
    favoris.splice(indexFavori, 1);
  }

  sauvegarderFavoris();
  actualiserBoutonFavori();
});

function texteCitationActuelle() {
  return `${elCitation.textContent} ${elAuteur.textContent}`;
}

function afficherRetour(button, message, messageInitiale) {
  button.textContent = message;
  setTimeout(() => (button.textContent = messageInitiale), 1500);
}

btnCopier.addEventListener('click', async () => {
  await navigator.clipboard.writeText(texteCitationActuelle());
  btnCopier.textContent = 'Copié !';
  setTimeout(() => (btnCopier.textContent = 'Copier'), 1500);
});

btnPartager.addEventListener('click', async () => {
  const texte = texteCitationActuelle();

  if (navigator.share) {
    await navigator.share({ title: 'Citation du moment', text: texte });
    afficherRetour(btnPartager, 'Partagé !', 'Partager');
    return;
  }

  await navigator.clipboard.writeText(texte);
  afficherRetour(btnPartager, 'Copié !', 'Partager');
});

formCitation.addEventListener('submit', (event) => {
  event.preventDefault();

  const nouvelleCitation = {
    texte: texteCitation.value.trim(),
    auteur: auteurCitation.value.trim()
  };

  if (!nouvelleCitation.texte || !nouvelleCitation.auteur) {
    return;
  }

  citationsPersonnelles.push(nouvelleCitation);
  citations.push(nouvelleCitation);
  localStorage.setItem(cleCitationsPersonnelles, JSON.stringify(citationsPersonnelles));
  afficherCitation(nouvelleCitation);
  formCitation.reset();
});

afficherFavoris();
