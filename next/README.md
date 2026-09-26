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
8. Toute synthèse éditoriale doit être construite uniquement à partir des sorties V121 déjà calculées.
9. La vue 24 mois reste une chronologie des événements V121 ; la lecture éditoriale annuelle est limitée aux 12 prochains mois.

## État au 26 septembre 2026

Raccordé au moteur V121 :
- signaux quotidiens et lecture « Maintenant » ;
- thème natal technique et portrait éditorial ;
- détection des événements / temps forts 12–24 mois ;
- lecture annuelle éditoriale 12 mois fondée exclusivement sur les événements V121 ;
- Le bon moment / fenêtres V121 ;
- synastrie / relations ;
- portrait enfant ;
- Ma question ;
- authentification compte ;
- création, sélection, modification et suppression des profils de naissance ;
- recherche de ville avec la même API française et la même base de villes/fuseaux V121 ;
- protection du cas « aucun profil actif » afin de ne jamais conserver d’anciens résultats en mémoire ;
- impression / PDF navigateur.

Important : `monthlyTrends()` n’est volontairement pas utilisé tant qu’aucune sortie mensuelle V121 native n’est exposée. Il ne faut pas fabriquer une courbe ou un score mensuel à partir d’un agrégat de remplacement.

## Prochaines étapes

- Vérifier les parcours compte gratuit / Premium et les erreurs de droits.
- Tester desktop + mobile : navigation, création/modification/suppression/changement de profil, portrait natal, journée, année, timing, relation, enfant, question et impression.
- Vérifier le comportement de la recherche de villes France / étranger en conditions réelles.
- Corriger uniquement les défauts observés pendant ces tests.
- Ne proposer une bascule de `main` qu’après validation explicite de la nouvelle application.
