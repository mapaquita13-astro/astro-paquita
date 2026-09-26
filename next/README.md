# Astro Paquita — reconstruction depuis zéro

Branche de développement uniquement. Ne pas déployer sur `main` tant que la nouvelle application n’est pas validée.

## Principe

- `main` reste sur la V121 stable.
- `engine/v121-host.html` conserve le moteur V121 utilisé comme hôte invisible pendant la reconstruction.
- `next/` contient la nouvelle application. Elle ne reprend aucun écran, menu, carte ou CSS de l’ancien front.
- `next/engine-adapter.js` lit les résultats V121 sans modifier les calculs.
- `next/access-policy.js` centralise les droits propres aux nouveaux usages, sans modifier les calculs.
- `next/bootstrap.js` vérifie le mode maintenance avant de charger l’application.
- `next/account-center.js` centralise compte, Premium, crédits questions, Stripe, codes promo et réinitialisation du mot de passe.

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
10. Les noms de `feature` envoyés à `/api/claude` doivent rester compatibles avec le backend actif : `portrait`, `forecast_today`, `forecast_future`, `window`, `events`, `synastry`, plus `question` géré par la couche V128 du backend.

## État au 26 septembre 2026

Raccordé au moteur V121 :
- signaux quotidiens et lecture « Maintenant » ;
- thème natal technique et portrait éditorial ;
- détection des événements / temps forts 12–24 mois ;
- lecture annuelle éditoriale 12 mois fondée exclusivement sur les événements V121 ;
- Le bon moment / fenêtres V121 ;
- synastrie / relations ;
- portrait enfant ;
- Ma question avec le vrai `poserQuestion()` V121 et les crédits backend ;
- création, sélection, modification et suppression des profils de naissance ;
- recherche de ville avec la même API française et la même base de villes/fuseaux V121 ;
- protection du cas « aucun profil actif » afin de ne jamais conserver d’anciens résultats en mémoire ;
- mode maintenance avant démarrage ;
- impression / PDF navigateur.

Centre de compte raccordé :
- connexion et inscription ;
- mot de passe oublié ;
- réinitialisation avec `reset_token` / `reset_email` ;
- affichage Gratuit / Premium / Administrateur ;
- affichage du nombre de questions disponibles ;
- achat Premium Stripe avec code de réduction éventuel ;
- codes promo : questions gratuites, jours Premium, réduction de paiement ;
- achat du pack de 5 questions ;
- confirmation Stripe du pack avant ajout des crédits ;
- retour de paiement Premium relu depuis le backend ;
- suppression définitive du compte avec annulation de l’abonnement serveur ;
- accès direct à `admin.html` pour un administrateur ;
- session expirée nettoyée ;
- message de compte suspendu conservé au lieu d’être transformé en faux écran de connexion ;
- les fenêtres compte/profil sont exclues de l’impression.

Corrections de compatibilité déjà intégrées :
- les demandes éditoriales `natal` du nouveau front sont envoyées au backend comme `portrait` ;
- la lecture annuelle est envoyée comme `forecast_future` sur 365 jours et reste Premium ;
- la date de `forecast_today` est alignée sur `Europe/Paris` ;
- le DOM technique minimal de « Ma question » est recréé invisiblement car V99 supprimait l’ancien écran, puis le vrai calcul V121 est exécuté ;
- le Portrait enfant est marqué `surface=child` et réservé Premium par la politique d’accès ;
- la branche backend `rebuild-from-zero-2026-09-26` contient V138, qui impose aussi le droit Premium au Portrait enfant. Le backend `main` live reste sur V137.

Important : `monthlyTrends()` n’est volontairement pas utilisé tant qu’aucune sortie mensuelle V121 native n’est exposée. Il ne faut pas fabriquer une courbe ou un score mensuel à partir d’un agrégat de remplacement.

## Restant avant validation

- Tester desktop + mobile : navigation, création/modification/suppression/changement de profil, portrait natal, journée, année, timing, relation, enfant, question, compte et impression.
- Vérifier le comportement de la recherche de villes France / étranger en conditions réelles.
- Tester les parcours gratuit / Premium / administrateur / compte suspendu / maintenance.
- Vérifier les retours Stripe réels sur une préproduction avant toute bascule.
- Corriger uniquement les défauts observés pendant ces tests.
- Ne proposer une bascule de `main` qu’après validation explicite de la nouvelle application et de la branche backend V138.
