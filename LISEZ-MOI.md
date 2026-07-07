# Astro Paquita — Version PWA installable

## Ce qui a été ajouté à ton fichier HTML
- `manifest.json` : nom, icônes, couleur de thème, mode "standalone" (plein écran, sans barre du navigateur)
- `sw.js` : service worker qui met l'app en cache pour qu'elle fonctionne même hors-ligne (une fois ouverte une première fois)
- `icons/` : 6 icônes générées à partir de ton logo (192px, 512px, version "maskable" pour Android, apple-touch-icon pour iOS, favicons)
- Dans le HTML : lien vers le manifest, les icônes, l'enregistrement du service worker, et un bouton "📲 Installer" qui apparaît automatiquement sur Android/Chrome quand l'app est installable

## ⚠️ Condition indispensable : HTTPS
Une PWA ne peut s'installer QUE si elle est servie en HTTPS (ou en local via `localhost`). Un simple fichier ouvert en `file://` ne suffit pas pour l'installation, même s'il s'affiche très bien.

## Comment déployer (le plus simple : gratuit, en quelques minutes)

### Option A — Netlify (glisser-déposer, sans compte GitHub)
1. Va sur https://app.netlify.com/drop
2. Glisse le dossier entier (`index.html`, `manifest.json`, `sw.js`, `icons/`) dans la zone
3. Netlify te donne une URL en `https://....netlify.app` — c'est fini, l'app est installable

### Option B — GitHub Pages (si tu veux la relier à ton dépôt existant)
1. Mets ces fichiers à la racine d'un dépôt GitHub (ou dans un dossier `docs/`)
2. Dans les paramètres du dépôt → Pages → choisis la branche et le dossier
3. GitHub te donne une URL `https://tonpseudo.github.io/tonrepo/`

### Option C — Sur ton Render existant
Si tu as déjà un service Render pour le backend, tu peux servir ces fichiers statiques depuis le même service (dossier `public/` avec Express `express.static`), ou créer un second "Static Site" Render qui pointe vers ce dossier.

## Test d'installation
- **Android (Chrome)** : ouvre l'URL, le bouton "📲 Installer" apparaît dans l'en-tête (ou menu ⋮ → "Installer l'application")
- **iPhone (Safari)** : ouvre l'URL → bouton Partager → "Sur l'écran d'accueil" (iOS n'a pas de bouton d'installation automatique, c'est une limite d'Apple, pas de l'app)

## Prochaine amélioration possible
Les icônes actuelles sont générées à partir du logo existant (agrandi). Si tu as un logo carré haute résolution (idéalement 512×512 ou plus), je peux régénérer des icônes plus nettes.
