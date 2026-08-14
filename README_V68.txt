ASTRO PAQUITA — V68 SUITE INTERNATIONALE
=========================================
Build final : v68-international-suite
Backend attendu : compat-api-2026-08-14-v68-international-suite
Date : 14/08/2026

Cette livraison regroupe les évolutions V59 à V68 en une seule version afin d'éviter dix déploiements successifs.

V59 — INTERNATIONAL
- Français, anglais, espagnol et arabe.
- Sélecteur de langue mémorisé.
- Langue enregistrée sur le compte connecté.
- Sorties IA demandées directement dans la langue choisie.
- Dates adaptées à la locale.
- Interface arabe RTL.
- Traduction des principaux écrans existants + traduction automatique des nouveaux éléments dynamiques connus.
- Astro Paquita reste le nom de marque dans toutes les langues.

V60 — TABLEAU DE BORD « CE QUI RESSORT »
- Le plus important / le plus favorable / point de vigilance.
- Analyse multi-domaines sur les 90 jours à venir.
- Aucun domaine n'est prioritaire par défaut : famille, couple, travail et argent sont traités comme les autres domaines.
- Moteur fondé sur la convergence multi-techniques V51 et adapté à l'âge.

V61 — TIMELINE DE VIE 10 ANS + ANNÉES FORTES
- Scan sur 10 ans.
- Domaines explorés : direction de vie, activité/statut, relations, famille/proches, foyer/logement, finances/patrimoine, enfants/projets personnels, études/orientation, voyages/mobilité, rythme/responsabilités/énergie, projets/réseau.
- Les périodes faibles ne sont pas forcées dans la Timeline.
- Regroupement des périodes proches afin d'éviter les doublons.
- Résumé IA des périodes réellement les plus fortes.

V62 — FIABILITÉ / CONVERGENCE
- Signal léger / Confirmé / Très convergent.
- Nombre de familles de techniques indépendantes.
- Aucun faux pourcentage de certitude scientifique.

V63 — COMPARATEUR + FENÊTRES À ÉVITER
- Comparaison de 1 à 4 dates pour une même intention.
- Classement avec le moteur Fenêtre idéale.
- Recherche des périodes les moins favorables sur 2 ans.
- Contrôle de compatibilité avec l'âge à chacune des dates.

V64 — CONTEXTE DE VIE FACULTATIF
- Situation relationnelle, activité, enfants, logement.
- Stockage par profil dans le navigateur.
- Sert uniquement à éviter des scénarios incompatibles avec la vie réelle.
- Ne modifie jamais les calculs astrologiques.
- Non visible dans l'administration.

V65 — VALIDATION HISTORIQUE ADMIN
- Réservée au rôle Admin dans la Timeline.
- Calcul « à l'aveugle » d'une date passée avant la saisie de l'événement réel.
- Analyse de tous les domaines de vie, sans priorité familiale.
- L'événement réel n'entre jamais dans le calcul initial.

V66 — JOURNAL PRIVÉ + FENÊTRES ENREGISTRÉES
- Journal personnel persistant par compte.
- Notes privées : aucune route Admin ne permet de lire leur contenu.
- Enregistrement/suppression des fenêtres importantes.
- Boutons d'enregistrement sur la Timeline et les cartes Fenêtre idéale.

V67 — RAPPELS SÉLECTIFS
- L'utilisateur choisit les fenêtres à enregistrer.
- Permission navigateur facultative.
- Alerte à l'approche d'une fenêtre enregistrée.
IMPORTANT : cette version fournit des rappels navigateur lorsque le site est utilisé/chargé. Elle n'intègre pas encore un service Push VAPID ou email capable de réveiller un navigateur totalement fermé.

V68 — PREMIUM INTERNATIONAL + ANALYTICS ADMIN
- Bloc Premium modernisé mettant en avant Timeline, comparateur, grands événements, fenêtres et 4 langues.
- Statistiques Admin : comptes, Premium, actifs 7/30 jours, consultations cumulées, langues utilisées, modules les plus consultés.
- Historique d'activité limité aux modules/contextes techniques utiles ; pas de texte des questions ni de réponses IA.

CONFIDENTIALITÉ
- Le journal personnel n'est pas exposé à l'Admin.
- Le contexte de vie par profil reste dans le navigateur.
- L'historique Admin ne stocke pas le texte des questions ni les réponses IA.
- Les journaux d'activité récents sont limités à 300 lignes par compte, tandis que le compteur total de consultations reste cumulatif.

DÉPLOIEMENT
===========

1) BACKEND — dépôt/service astro-paquita-backend
Remplacer uniquement :
- server.js
- db.js
Ne pas modifier les variables d'environnement Render.
Ne pas changer JWT_SECRET.
Attendre la fin du déploiement puis ouvrir :
https://astro-paquita-backend.onrender.com/
La réponse doit contenir exactement :
"version":"compat-api-2026-08-14-v68-international-suite"

2) FRONTEND — dépôt/service astro-paquita
Remplacer uniquement :
- index.html
- admin.html
- sw.js
- reset-cache.html
Attendre le déploiement puis ouvrir une fois :
https://astro-paquita.onrender.com/reset-cache.html

3) CONTRÔLES CONSEILLÉS APRÈS DÉPLOIEMENT
- FR / EN / ES / arabe + affichage RTL.
- Connexion utilisateur et conservation de la langue.
- Une analyse IA dans chacune des langues.
- Timeline sur un profil adulte puis un enfant/senior.
- Comparateur avec une date incompatible avec l'âge.
- Journal : ajout puis suppression.
- Enregistrement d'une fenêtre puis rappel.
- Admin : historique d'activité + statistiques internationales.
- Admin : validation historique à l'aveugle.

TESTS LOCAUX EFFECTUÉS AVANT LIVRAISON
======================================
- Syntaxe Node/JavaScript : server.js OK, db.js OK, sw.js OK.
- Tous les scripts JavaScript inline de index.html : node --check OK.
- Script admin.html : node --check OK.
- Test DB temporaire : préférences langue, journal, fenêtre enregistrée, activité, statistiques cumulées : OK.
- Contrôle de présence de secrets Render/API dans les fichiers livrés : aucun secret de production détecté.

LIMITATION DE VALIDATION
========================
Les tests locaux ne remplacent pas un test navigateur complet sur Render avec les vraies variables d'environnement, Stripe et l'API IA. Après déploiement, effectuer les contrôles ci-dessus avant d'ouvrir largement le site.
