require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');
const db = require('./db');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-moi-aussi';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

function aujourdHuiParis() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function estPremiumValide(user) {
  if (user && user.role === 'admin') return true;
  if (!user || !user.premium) return false;
  if (user.premium_expires_at && new Date(user.premium_expires_at) < new Date()) return false;
  return true;
}

// ============================================================
// WEBHOOK STRIPE — avant express.json() car Stripe exige le corps brut
// ============================================================
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature invalide :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = Number(session.client_reference_id);

      if (userId && session.metadata && session.metadata.purchase_type === 'questions_pack_5') {
        db.enregistrerAchatQuestions(
          userId,
          session.id,
          Number(session.metadata.credits) || 5
        );
      } else if (userId && session.mode === 'subscription') {
        db.updateUser(userId, {
          premium: 1,
          premium_expires_at: null,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      db.updateUserByStripeSubscriptionId(sub.id, { premium: 0 });
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const actif = sub.status === 'active' || sub.status === 'trialing';
      db.updateUserByStripeSubscriptionId(sub.id, { premium: actif ? 1 : 0, ...(actif ? { premium_expires_at: null } : {}) });
    }
  } catch (err) {
    console.error('Erreur traitement webhook Stripe :', err);
    return res.status(500).json({ erreur: 'Erreur traitement webhook.' });
  }

  res.json({ received: true });
});

app.use(cors());
app.use(express.json());

// Statut public du site (utilisé par le frontend avant d'afficher le contenu)
app.get('/api/status', (req, res) => {
  const settings = db.getSiteSettings();
  const maintenance = settings && settings.maintenance ? settings.maintenance : { enabled: false };
  res.set('Cache-Control', 'no-store');
  res.json({
    statut: 'ok',
    maintenance: {
      enabled: Boolean(maintenance.enabled),
      message: maintenance.message || 'Astro Paquita se refait une beauté. Le site sera de retour très bientôt.',
      updated_at: maintenance.updated_at || null,
    },
  });
});

// ============================================================
// AUTH
// ============================================================
function creerToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erreur: 'Non connecté.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.getUserById(payload.id);
    if (!user) return res.status(401).json({ erreur: 'Compte introuvable.' });

    req.user = user;
    db.touchActivity(user.id);
    next();
  } catch (e) {
    return res.status(401).json({ erreur: 'Session invalide, reconnectez-vous.' });
  }
}

function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (key && key === ADMIN_KEY) return next();

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = db.getUserById(payload.id);
      if (user && user.role === 'admin') { req.user = user; return next(); }
    } catch (e) {}
  }
  return res.status(403).json({ erreur: 'Accès administrateur refusé.' });
}

function adminKeyOnly(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== ADMIN_KEY) {
    return res.status(403).json({ erreur: 'Clé ADMIN_KEY incorrecte ou absente.' });
  }
  next();
}

function reponseCompte(user) {
  return {
    email: user.email,
    prenom: user.prenom,
    premium: estPremiumValide(user),
    premium_expires_at: user.premium_expires_at || null,
    question_credits: Number(user.question_credits) || 0,
    questions_used: Number(user.questions_used) || 0,
    question_packs_bought: Number(user.question_packs_bought) || 0,
    role: user.role === 'admin' ? 'admin' : 'user',
    is_admin: user.role === 'admin',
    lang: ['fr','en','es','ar'].includes(user.lang) ? user.lang : 'fr',
    timezone: user.timezone || null,
    preferences: user.preferences || {},
    life_context: user.life_context || {},
    notifications_enabled: Boolean(user.notifications_enabled),
  };
}

// ============================================================
// ROUTES : COMPTES + STATISTIQUES D'USAGE
// ============================================================
app.post('/api/auth/signup', async (req, res) => {
  const { email, motDePasse, prenom, lang, timezone } = req.body;
  if (!email || !motDePasse || motDePasse.length < 6) {
    return res
      .status(400)
      .json({ erreur: "Email requis et mot de passe d'au moins 6 caractères." });
  }

  const emailNorm = email.toLowerCase().trim();
  const existant = db.getUserByEmail(emailNorm);
  if (existant) return res.status(409).json({ erreur: 'Un compte existe déjà avec cet email.' });

  const hash = await bcrypt.hash(motDePasse, 10);
  let user = db.insertUser({ email: emailNorm, password_hash: hash, prenom });
  user = db.updatePreferences(user.id, { lang, timezone }) || user;

  res.json({ token: creerToken(user), ...reponseCompte(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, motDePasse } = req.body;
  const user = db.getUserByEmail((email || '').toLowerCase().trim());
  if (!user) return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' });

  const ok = await bcrypt.compare(motDePasse || '', user.password_hash);
  if (!ok) return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' });

  const maj = db.recordLogin(user.id) || user;
  res.json({ token: creerToken(maj), ...reponseCompte(maj) });
});

app.get('/api/me', auth, (req, res) => {
  const user = db.getUserById(req.user.id) || req.user;
  res.json(reponseCompte(user));
});


// V68 — préférences internationales et contexte de vie (privé au compte)
app.patch('/api/me/preferences', auth, (req,res)=>{
  const user=db.updatePreferences(req.user.id, req.body||{});
  if(!user)return res.status(404).json({erreur:'Compte introuvable.'});
  res.json({succes:true,...reponseCompte(user)});
});

// Journal personnel : jamais exposé à l'administration.
app.get('/api/me/journal', auth, (req,res)=>res.json({entries:db.getJournal(req.user.id, Number(req.query.limit)||200)}));
app.post('/api/me/journal', auth, (req,res)=>{const row=db.addJournal(req.user.id,req.body||{});if(!row)return res.status(400).json({erreur:'Entrée invalide.'});res.json({succes:true,entry:row});});
app.delete('/api/me/journal/:id', auth, (req,res)=>{if(!db.deleteJournal(req.user.id,req.params.id))return res.status(404).json({erreur:'Entrée introuvable.'});res.json({succes:true});});

// Fenêtres enregistrées et rappels choisis par l'utilisateur.
app.get('/api/me/windows', auth, (req,res)=>res.json({windows:db.getSavedWindows(req.user.id,Number(req.query.limit)||200)}));
app.post('/api/me/windows', auth, (req,res)=>{const row=db.addSavedWindow(req.user.id,req.body||{});if(!row)return res.status(400).json({erreur:'Fenêtre invalide.'});res.json({succes:true,window:row});});
app.delete('/api/me/windows/:id', auth, (req,res)=>{if(!db.deleteSavedWindow(req.user.id,req.params.id))return res.status(404).json({erreur:'Fenêtre introuvable.'});res.json({succes:true});});

app.post('/api/activity/visit', auth, (req, res) => {
  const user = db.recordVisit(req.user.id);
  if (!user) return res.status(404).json({ erreur: 'Compte introuvable.' });
  res.json({ succes: true, visit_count: Number(user.visit_count) || 0 });
});

app.post('/api/activity/track', auth, (req,res)=>{
  const allowed=new Set(['dashboard','timeline','compare','avoid_windows','journal','life_context','saved_window','notification','historical_validation']);
  const feature=String(req.body&&req.body.feature||'').slice(0,40);
  if(!allowed.has(feature))return res.status(400).json({erreur:'Module invalide.'});
  const row=db.recordActivity(req.user.id,feature,(req.body&&req.body.context)||{});
  res.json({succes:true,id:row&&row.id});
});

app.delete('/api/me', auth, async (req, res) => {
  if (req.user.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(req.user.stripe_subscription_id);
    } catch (err) {
      console.error('Annulation abonnement Stripe échouée :', err.message);
      return res.status(500).json({
        erreur: "Impossible d'annuler l'abonnement Stripe. Le compte n'a pas été supprimé.",
      });
    }
  }

  db.deleteUser(req.user.id);
  res.json({ succes: true });
});

// ============================================================
// ROUTES : CODES PROMO
// ============================================================
app.post('/api/promo/redeem', auth, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ erreur: 'Code requis.' });

  const codeNormalise = code.trim().toUpperCase();
  const promo = db.getPromoByCode(codeNormalise);

  if (!promo) return res.status(404).json({ erreur: 'Code promo invalide ou expiré.' });
  if (promo.expire_le && new Date(promo.expire_le) < new Date()) {
    return res.status(410).json({ erreur: 'Ce code a expiré.' });
  }
  if (promo.max_utilisations && promo.utilisations_count >= promo.max_utilisations) {
    return res.status(410).json({ erreur: "Ce code a atteint sa limite d'utilisation." });
  }
  if (db.aUtilisePromo(req.user.id, promo.id)) {
    return res.status(409).json({ erreur: 'Tu as déjà utilisé ce code.' });
  }

  if (promo.type === 'jours_premium') {
    const base =
      req.user.premium_expires_at && new Date(req.user.premium_expires_at) > new Date()
        ? new Date(req.user.premium_expires_at)
        : new Date();
    base.setDate(base.getDate() + promo.valeur);
    db.updateUser(req.user.id, { premium: 1, premium_expires_at: base.toISOString() });
  }

  db.enregistrerUtilisationPromo(req.user.id, promo.id);
  res.json({ succes: true, type: promo.type, valeur: promo.valeur });
});

// ============================================================
// ROUTES : STRIPE — PREMIUM
// ============================================================
app.post('/api/stripe/checkout', auth, async (req, res) => {
  try {
    const { codePromo } = req.body;
    let coupon;

    if (codePromo) {
      const promo = db.getPromoByCode(codePromo.trim().toUpperCase());
      if (promo && promo.type === 'reduction_pourcentage') {
        coupon = await stripe.coupons.create({ percent_off: promo.valeur, duration: 'once' });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID_PREMIUM, quantity: 1 }],
      client_reference_id: String(req.user.id),
      customer_email: req.user.email,
      discounts: coupon ? [{ coupon: coupon.id }] : undefined,
      success_url: `${process.env.FRONTEND_URL}/?paiement=succes`,
      cancel_url: `${process.env.FRONTEND_URL}/?paiement=annule`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la création du paiement.' });
  }
});

// ============================================================
// ROUTES : STRIPE — PACK DE 5 QUESTIONS
// Nécessite STRIPE_PRICE_ID_QUESTIONS_5 dans Render.
// ============================================================
app.post('/api/stripe/questions-pack', auth, async (req, res) => {
  const priceId = process.env.STRIPE_PRICE_ID_QUESTIONS_5;
  if (!priceId) {
    return res.status(503).json({
      erreur: "Le prix du pack de 5 questions n'est pas encore configuré.",
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: String(req.user.id),
      customer_email: req.user.email,
      metadata: {
        purchase_type: 'questions_pack_5',
        credits: '5',
      },
      success_url: `${process.env.FRONTEND_URL}/?questions=succes&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/?questions=annule`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la création du paiement du pack.' });
  }
});

app.get('/api/stripe/questions-pack/confirm', auth, async (req, res) => {
  const sessionId = String(req.query.session_id || '');
  if (!sessionId) return res.status(400).json({ erreur: 'Session Stripe manquante.' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const memeUtilisateur = String(session.client_reference_id || '') === String(req.user.id);
    const bonType = session.metadata && session.metadata.purchase_type === 'questions_pack_5';
    const paye = session.payment_status === 'paid' || session.status === 'complete';

    if (!memeUtilisateur || !bonType || !paye) {
      return res.status(400).json({ erreur: 'Paiement non validé.' });
    }

    const achat = db.enregistrerAchatQuestions(
      req.user.id,
      session.id,
      Number(session.metadata.credits) || 5
    );
    const user = achat.user || db.getUserById(req.user.id);

    res.json({
      succes: true,
      duplicate: !!achat.duplicate,
      question_credits: Number(user && user.question_credits) || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Impossible de confirmer le paiement.' });
  }
});

// ============================================================
// ROUTE : PROXY SÉCURISÉ VERS ANTHROPIC
// ============================================================
const limiteurClaude = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { erreur: 'Trop de requêtes, réessaie dans une minute.' },
});

const FEATURES_AUTORISEES = new Set([
  'portrait',
  'forecast_today',
  'forecast_future',
  'window',
  'events',
  'synastry',
  'question',
  'timeline',
]);

const FEATURES_PREMIUM = new Set(['forecast_future', 'window', 'events', 'synastry', 'timeline']);

// ------------------------------------------------------------------
// Compatibilité avec les anciennes pages Astro Paquita.
// Les anciennes versions de index.html n'envoyaient pas encore le
// champ `feature`. On reconnaît alors le module à partir du texte
// système/prompt. Cela évite l'erreur "Fonctionnalité non identifiée"
// pendant qu'un ancien index reste en cache ou n'est pas encore déployé.
// ------------------------------------------------------------------
function normaliserTexteCompat(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function texteMessagesCompat(messages) {
  if (!Array.isArray(messages)) return '';
  return messages
    .map((m) => (m && typeof m.content === 'string' ? m.content : ''))
    .join('\n');
}

function aujourdHuiParisFrancaisNormalise() {
  const txt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return normaliserTexteCompat(txt);
}

function infererFeatureAncienIndex({ system, messages, premiumRequis }) {
  const sys = normaliserTexteCompat(system);
  const prompt = normaliserTexteCompat(texteMessagesCompat(messages));
  const tout = `${sys}\n${prompt}`;

  // Synastrie : l'ancien index envoyait aussi premiumRequis:true.
  if (
    sys.includes('synastrie') ||
    prompt.includes('compare les themes astrologiques') ||
    (premiumRequis === true && prompt.includes('relation'))
  ) return 'synastry';

  // Fenêtre idéale / timing sur 5 ans.
  if (
    sys.includes('timing cosmique') ||
    prompt.includes('meilleure fenetre') ||
    prompt.includes('calcul sur 5 ans')
  ) return 'window';

  // Grands événements.
  if (
    sys.includes('lectures de vie equilibrees') ||
    prompt.includes('evenements astrologiques majeurs') ||
    (prompt.includes('cycles actuels') && prompt.includes('jupiter'))
  ) return 'events';

  // Module Ma question.
  if (
    sys.includes('repond aux questions personnelles') ||
    prompt.includes('reponds a la question')
  ) return 'question';

  // Portrait natal.
  if (
    sys.includes('portraits personnalises') ||
    prompt.includes('ton rapport aux autres') ||
    prompt.includes('tes forces et tes defis')
  ) return 'portrait';

  // Prévisions : aujourd'hui reste gratuit, toute autre date est Premium.
  if (
    sys.includes('astrologue honnete et bienveillant') ||
    prompt.includes('energie du jour') ||
    prompt.includes('tableau general')
  ) {
    const estUneJournee = prompt.includes('analyse la journee');
    const estAujourdhui = prompt.includes(aujourdHuiParisFrancaisNormalise());
    return estUneJournee && estAujourdhui ? 'forecast_today' : 'forecast_future';
  }

  // Aucun classement fiable : on refuse plutôt que d'ouvrir un accès au hasard.
  if (tout.trim()) return null;
  return null;
}

app.post('/api/claude', auth, limiteurClaude, async (req, res) => {
  const {
    system,
    messages,
    max_tokens,
    model,
    feature: featureRecue,
    featureContext: featureContextRecu,
    premiumRequis,
  } = req.body;

  let feature = featureRecue;
  let featureContext = featureContextRecu;
  let ancienIndex = false;

  if (!FEATURES_AUTORISEES.has(feature)) {
    feature = infererFeatureAncienIndex({ system, messages, premiumRequis });
    ancienIndex = !!feature;

    // Pour l'ancien index, une prévision reconnue comme "aujourd'hui"
    // reçoit ici le contexte que la nouvelle page envoie directement.
    if (feature === 'forecast_today') {
      featureContext = { date: aujourdHuiParis(), days: 1 };
    }
  }

  if (!FEATURES_AUTORISEES.has(feature)) {
    return res.status(400).json({
      erreur: 'Fonctionnalité non identifiée. Recharge la page puis réessaie.',
      code: 'FEATURE_NOT_IDENTIFIED',
    });
  }

  if (ancienIndex) {
    console.warn(`[compat] Ancien index détecté pour /api/claude -> ${feature}`);
  }

  if (FEATURES_PREMIUM.has(feature) && !estPremiumValide(req.user)) {
    return res.status(403).json({ erreur: 'Cette fonctionnalité est réservée aux profils Premium.' });
  }

  if (feature === 'forecast_today' && !estPremiumValide(req.user)) {
    const dateDemandee = featureContext && String(featureContext.date || '');
    const nbJours = Number(featureContext && featureContext.days);
    if (dateDemandee !== aujourdHuiParis() || nbJours !== 1) {
      return res.status(403).json({
        erreur: "L'accès gratuit aux prévisions est limité à aujourd'hui.",
      });
    }
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ erreur: 'Requête invalide.' });
  }

  let creditQuestionReserve = false;
  if (feature === 'question') {
    creditQuestionReserve = db.consumeQuestionCredit(req.user.id);
    if (!creditQuestionReserve) {
      return res.status(402).json({
        erreur: 'Tu as utilisé ta question offerte. Achète un pack de 5 questions pour continuer.',
        code: 'QUESTION_CREDIT_REQUIRED',
      });
    }
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1500,
        system: system || undefined,
        messages,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      if (creditQuestionReserve) db.refundQuestionCredit(req.user.id);
      console.error('Erreur Anthropic :', data);
      return res.status(resp.status).json({ erreur: data.error?.message || 'Erreur API.' });
    }

    // Journal de consultation : module + contexte technique minimal uniquement.
    // Aucun prompt, texte de question ou contenu de réponse IA n'est enregistré.
    try {
      db.recordActivity(req.user.id, feature, featureContext || {});
    } catch (e) {
      console.error('Journal activité non enregistré :', e.message);
    }

    if (creditQuestionReserve) {
      const userApres = db.getUserById(req.user.id);
      data.astro_meta = {
        question_credits: Number(userApres && userApres.question_credits) || 0,
      };
    }

    res.json(data);
  } catch (err) {
    if (creditQuestionReserve) db.refundQuestionCredit(req.user.id);
    console.error(err);
    res.status(500).json({ erreur: "Erreur de connexion à l'API." });
  }
});

// ============================================================
// ROUTES : ADMIN
// ============================================================
// Diagnostic public minimal : permet à admin.html de savoir si le backend
// est bien à jour et si un premier administrateur peut encore être créé.
app.get('/api/admin/bootstrap-status', (req, res) => {
  const users = db.getAllUsers();
  const adminCount = users.filter((u) => u && u.role === 'admin').length;
  res.set('Cache-Control', 'no-store');
  res.json({
    ok: true,
    backend_version: 'v68-international-suite',
    bootstrap_available: adminCount === 0,
    admin_count: adminCount,
  });
});

// Méthode 1 : si aucun admin n'existe, le compte connecté peut devenir
// le premier administrateur sans connaître la clé ADMIN_KEY.
app.post('/api/admin/bootstrap', auth, (req, res) => {
  const users = db.getAllUsers();
  const admins = users.filter((u) => u && u.role === 'admin');
  if (admins.length > 0) {
    return res.status(409).json({ erreur: 'Un administrateur existe déjà. Utilise la récupération par email avec la clé ADMIN_KEY.' });
  }

  const user = db.setUserRole(req.user.id, 'admin');
  if (!user) return res.status(404).json({ erreur: 'Compte introuvable.' });
  console.log(`Premier administrateur activé : ${user.email || user.id}`);
  return res.json({ succes: true, user: reponseCompte(user) });
});

// Méthode 2 (récupération) : la propriétaire du site peut promouvoir un
// compte existant directement par son email avec la ADMIN_KEY de Render.
// Cela fonctionne même si un autre admin existe déjà ou si la session web
// n'est plus valide.
app.post('/api/admin/promote-by-email', adminKeyOnly, (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ erreur: 'Email requis.' });

  const user = db.getUserByEmail(email);
  if (!user) return res.status(404).json({ erreur: 'Aucun compte Astro Paquita avec cet email.' });

  const updated = db.setUserRole(user.id, 'admin');
  if (!updated) return res.status(404).json({ erreur: 'Compte introuvable.' });
  console.log(`Administrateur activé par récupération : ${updated.email || updated.id}`);
  return res.json({ succes: true, user: reponseCompte(updated) });
});

app.get('/api/admin/maintenance', adminAuth, (req, res) => {
  const settings = db.getSiteSettings();
  res.set('Cache-Control', 'no-store');
  res.json(settings.maintenance || { enabled: false });
});

app.patch('/api/admin/maintenance', adminAuth, (req, res) => {
  const enabled = Boolean(req.body && req.body.enabled);
  const message = req.body && req.body.message;
  const maintenance = db.setMaintenance({ enabled, message });
  res.json({ succes: true, maintenance });
});

app.get('/api/admin/promo', adminAuth, (req, res) => {
  res.json(db.getAllPromoCodes());
});

app.post('/api/admin/promo', adminAuth, (req, res) => {
  const { code, type, valeur, maxUtilisations, expireLe } = req.body;
  if (!code || !type || !valeur) {
    return res.status(400).json({ erreur: 'code, type et valeur sont requis.' });
  }
  try {
    db.insertPromoCode({ code: code.trim().toUpperCase(), type, valeur, maxUtilisations, expireLe });
    res.json({ succes: true });
  } catch (err) {
    res.status(409).json({ erreur: 'Ce code existe déjà.' });
  }
});

app.patch('/api/admin/promo/:id/desactiver', adminAuth, (req, res) => {
  db.desactiverPromoCode(req.params.id);
  res.json({ succes: true });
});

app.get('/api/admin/analytics', adminAuth, (req,res)=>{res.set('Cache-Control','no-store');res.json(db.getAnalytics());});

app.get('/api/admin/users', adminAuth, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(db.getAllUsers());
});

app.get('/api/admin/users/:id/activity', adminAuth, (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ erreur: 'Compte introuvable.' });
  const limit = Math.max(1, Math.min(300, Number(req.query.limit) || 100));
  res.set('Cache-Control', 'no-store');
  res.json({
    user: { id: user.id, prenom: user.prenom || null, email: user.email || null },
    activities: db.getUserActivity(user.id, limit),
  });
});

app.patch('/api/admin/users/:id/role', adminAuth, (req, res) => {
  const role = req.body && req.body.role === 'admin' ? 'admin' : 'user';
  const user = db.setUserRole(req.params.id, role);
  if (!user) return res.status(404).json({ erreur: 'Utilisateur introuvable.' });
  res.json({ succes: true, user: reponseCompte(user) });
});

app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ erreur: 'Utilisateur introuvable.' });

  if (user.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(user.stripe_subscription_id);
    } catch (err) {
      console.error('Annulation abonnement Stripe échouée :', err.message);
      return res.status(500).json({
        erreur: "Impossible d'annuler l'abonnement Stripe. Le compte n'a pas été supprimé.",
      });
    }
  }

  const supprime = db.deleteUser(req.params.id);
  if (!supprime) return res.status(404).json({ erreur: 'Utilisateur introuvable.' });
  res.json({ succes: true });
});

// ============================================================
app.get('/', (req, res) => res.json({ statut: 'Astro Paquita backend actif', version: 'compat-api-2026-08-14-v68-international-suite' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
