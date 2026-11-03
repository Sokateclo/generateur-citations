const citations = [
  { texte: "Le succès c'est tomber sept fois, se relever huit.", auteur: "Proverbe japonais" },
  { texte: "La vie c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre.", auteur: "Albert Einstein" },
  { texte: "Le seul moyen de faire du bon travail est d'aimer ce que vous faites.", auteur: "Steve Jobs" },
  { texte: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", auteur: "Sénèque" },
  { texte: "Le voyage de mille lieues commence par un premier pas.", auteur: "Lao Tseu" }
];

const elCitation = document.getElementById('citation');
const elAuteur = document.getElementById('auteur');
const btnNouvelle = document.getElementById('btn-nouvelle');
const btnCopier = document.getElementById('btn-copier');

function afficherCitation() {
  const index = Math.floor(Math.random() * citations.length);
  elCitation.textContent = `"${citations[index].texte}"`;
  elAuteur.textContent = `— ${citations[index].auteur}`;
}

btnNouvelle.addEventListener('click', afficherCitation);

btnCopier.addEventListener('click', async () => {
  await navigator.clipboard.writeText(`${elCitation.textContent} ${elAuteur.textContent}`);
  btnCopier.textContent = 'Copié !';
  setTimeout(() => (btnCopier.textContent = 'Copier'), 1500);
});
