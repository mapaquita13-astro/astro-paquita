# Astro Paquita — reconstruction depuis zéro

Branche de développement uniquement. Ne pas déployer sur `main` tant que la nouvelle application n’est pas validée.

## Principe

- `main` reste sur la V121 stable.
- `engine/v121-host.html` est une copie bit-à-bit du `index.html` V121 utilisée comme hôte moteur invisible pendant la reconstruction.
- `next/` contient la nouvelle application. Elle ne reprend aucun écran, menu, carte ou CSS de l’ancien front.
- `next/engine-adapter.js` lit les résultats V121 sans modifier les calculs.

## Architecture produit retenue

Navigation principale :
1. Accueil
2. Mon ciel
3. Maintenant
4. Mon année
5. Explorer

`Explorer` regroupe les usages spécialisés :
- décision / Le bon moment ;
- relation ;
- portrait enfant ;
- question précise.

Cette architecture remplace volontairement le catalogue historique de modules.

## Règles techniques

1. Aucun calcul astrologique nouveau dans le front.
2. Aucun score de substitution.
3. Aucun événement inventé pour remplir une vue.
4. Les vues non encore raccordées restent en état vide explicite.
5. Pas de `MutationObserver` de réparation d’interface.
6. Un seul système de design.
7. Mobile d’abord.

## Étapes suivantes

- Cartographier les fonctions V121 de portrait natal, détection de périodes, timing, synastrie et question.
- Exposer ces fonctions par l’adaptateur.
- Remplacer les états vides écran par écran.
- Valider localement desktop + mobile avant toute proposition de bascule.
