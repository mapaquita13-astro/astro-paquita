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

// ============================================================
// WEBHOOK STRIPE — doit être déclaré AVANT express.json() car il a besoin du corps brut
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = Number(session.client_reference_id);
    if (userId) {
      db.updateUser(userId, {
        premium: 1,
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
    db.updateUserByStripeSubscriptionId(sub.id, { premium: actif ? 1 : 0 });
  }

  res.json({ received: true });
});

app.use(cors());
app.use(express.json());

// ============================================================
// AUTH — outils
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
    next();
  } catch (e) {
    return res.status(401).json({ erreur: 'Session invalide, reconnectez-vous.' });
  }
}

function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== ADMIN_KEY) return res.status(403).json({ erreur: 'Accès refusé.' });
  next();
}

function estPremiumValide(user) {
  if (!user.premium) return false;
  if (user.premium_expires_at && new Date(user.premium_expires_at) < new Date()) return false;
  return true;
}

// ============================================================
// ROUTES : COMPTES
// ============================================================
app.post('/api/auth/signup', async (req, res) => {
  const { email, motDePasse, prenom } = req.body;
  if (!email || !motDePasse || motDePasse.length < 6) {
    return res
      .status(400)
      .json({ erreur: "Email requis et mot de passe d'au moins 6 caractères." });
  }
  const emailNorm = email.toLowerCase().trim();
  const existant = db.getUserByEmail(emailNorm);
  if (existant) return res.status(409).json({ erreur: 'Un compte existe déjà avec cet email.' });

  const hash = await bcrypt.hash(motDePasse, 10);
  const user = db.insertUser({ email: emailNorm, password_hash: hash, prenom });

  res.json({ token: creerToken(user), prenom: user.prenom, premium: false });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, motDePasse } = req.body;
  const user = db.getUserByEmail((email || '').toLowerCase().trim());
  if (!user) return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' });

  const ok = await bcrypt.compare(motDePasse || '', user.password_hash);
  if (!ok) return res.status(401).json({ erreur: 'Email ou mot de passe incorrect.' });

  res.json({ token: creerToken(user), prenom: user.prenom, premium: estPremiumValide(user) });
});

app.get('/api/me', auth, (req, res) => {
  res.json({
    email: req.user.email,
    prenom: req.user.prenom,
    premium: estPremiumValide(req.user),
  });
});

// ============================================================
// ROUTES : CODES PROMO
// ============================================================
app.post('/api/promo/redeem', auth, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ erreur: 'Code requis.' });

  const codeNormalise = code.trim().toUpperCase();
  const tousLesCodes = db.getAllPromoCodes();
  console.log('[DEBUG promo] reçu:', JSON.stringify(codeNormalise), '| codes en base:', JSON.stringify(tousLesCodes.map(p => p.code)));

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
  // Le type "reduction_pourcentage" est appliqué côté Stripe Checkout (voir /api/stripe/checkout)

  db.enregistrerUtilisationPromo(req.user.id, promo.id);

  res.json({ succes: true, type: promo.type, valeur: promo.valeur });
});

// ============================================================
// ROUTES : STRIPE
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
// ROUTE : PROXY SÉCURISÉ VERS ANTHROPIC
// La clé API ne quitte jamais ce serveur.
// ============================================================
const limiteurClaude = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 appels par minute par IP — ajuste selon ton usage réel
  message: { erreur: 'Trop de requêtes, réessaie dans une minute.' },
});

app.post('/api/claude', auth, limiteurClaude, async (req, res) => {
  const { system, messages, max_tokens, model, premiumRequis } = req.body;

  if (premiumRequis && !estPremiumValide(req.user)) {
    return res.status(403).json({ erreur: 'Cette fonctionnalité est réservée aux profils Premium.' });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ erreur: 'Requête invalide.' });
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
      console.error('Erreur Anthropic :', data);
      return res.status(resp.status).json({ erreur: data.error?.message || 'Erreur API.' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur de connexion à l'API." });
  }
});

// ============================================================
// ROUTES : ADMIN (codes promo, utilisateurs)
// ============================================================
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

app.get('/api/admin/users', adminAuth, (req, res) => {
  res.json(db.getAllUsers());
});

// ============================================================
app.get('/', (req, res) => res.json({ statut: 'Astro Paquita backend actif' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
