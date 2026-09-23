# Astro Paquita — PWA Android / iPhone

## État actuel
Astro Paquita est installable comme application web depuis son site HTTPS.

Fichiers utilisés :
- `manifest.json` : nom, identité visuelle, mode standalone et icônes Android ;
- `sw.js` : service worker V150 utilisé pour forcer les mises à jour de l’interface et supprimer les anciens caches ;
- `icons/` : icônes 192 px, 512 px, maskable, favicon et `apple-touch-icon`.

## Important : fonctionnement en ligne
Le service worker actuel **ne fournit pas un mode hors ligne complet**. C’est volontaire : Astro Paquita dépend de l’authentification, du backend, de Stripe et des appels IA. Le worker privilégie donc les fichiers frais du serveur et purge les anciens caches après une mise à jour.

Ne pas réintroduire un cache hors ligne global sans stratégie précise : il pourrait faire réapparaître une ancienne interface après un déploiement.

## Android / Chrome
1. Ouvrir le site Astro Paquita en HTTPS.
2. Utiliser l’option du navigateur **Installer l’application** / **Ajouter à l’écran d’accueil** lorsqu’elle est proposée.
3. L’application s’ouvre ensuite en mode standalone avec l’identité Astro Paquita.

Le manifeste contient les icônes 192×192, 512×512 et une icône maskable adaptées à l’installation Android.

## iPhone / Safari
1. Ouvrir Astro Paquita dans Safari.
2. Toucher **Partager**.
3. Choisir **Sur l’écran d’accueil**.

`apple-touch-icon.png` est présent pour l’icône iOS. Le site contient également les balises `apple-mobile-web-app-capable` nécessaires à l’ouverture en mode application web.

## Google Play
La PWA installable n’est pas, à elle seule, une application publiée sur Google Play. Pour une publication Play Store, il faudra emballer le site dans une application Android adaptée (par exemple une Trusted Web Activity ou une enveloppe native), configurer le package Android, la signature, les fiches Play Console et vérifier les règles de paiement applicables au modèle commercial retenu.

Ne pas modifier la logique astrologique pour cette étape : la future application mobile doit rester une enveloppe de l’interface et du backend validés.

## Contrôles après chaque déploiement
- chargement de la dernière interface sans ancien cache ;
- connexion/déconnexion et confidentialité des profils ;
- installation Android ;
- ajout à l’écran d’accueil iPhone ;
- FR / EN / ES / AR ;
- Portrait natal, Prévisions, Mon avenir, Synastrie et Portrait enfant ;
- accès backend et paiements lorsque ces fonctions sont testées.

## Limite de validation actuelle
Les fichiers du dépôt sont contrôlés, mais ce document ne vaut pas test navigateur réel sur Render. Après déploiement, les contrôles Android/iPhone et les parcours Stripe/IA doivent être exécutés sur le site de production.
