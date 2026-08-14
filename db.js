const fs = require('fs');
const path = require('path');

// Stockage JSON simple. Pour conserver les comptes entre les redéploiements Render,
// DB_PATH doit pointer vers un disque persistant (ex. /data/astro-paquita.json).
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'astro-paquita.json');

const SCHEMA_VIDE = {
  users: [],
  promoCodes: [],
  promoUtilisations: [],
  questionPurchases: [],
  activityLogs: [],
  settings: {
    maintenance: {
      enabled: false,
      message: 'Astro Paquita se refait une beauté. Le site sera de retour très bientôt.',
      updated_at: null,
    },
  },
  compteurs: {
    users: 0,
    promoCodes: 0,
    promoUtilisations: 0,
    questionPurchases: 0,
    activityLogs: 0,
  },
};

function cloneSchemaVide() {
  return JSON.parse(JSON.stringify(SCHEMA_VIDE));
}

function normaliserData(data) {
  let modifie = false;
  if (!data || typeof data !== 'object') {
    return { data: cloneSchemaVide(), modifie: true };
  }

  for (const cle of ['users', 'promoCodes', 'promoUtilisations', 'questionPurchases', 'activityLogs']) {
    if (!Array.isArray(data[cle])) {
      data[cle] = [];
      modifie = true;
    }
  }

  if (!data.settings || typeof data.settings !== 'object') {
    data.settings = {};
    modifie = true;
  }
  if (!data.settings.maintenance || typeof data.settings.maintenance !== 'object') {
    data.settings.maintenance = {
      enabled: false,
      message: 'Astro Paquita se refait une beauté. Le site sera de retour très bientôt.',
      updated_at: null,
    };
    modifie = true;
  } else {
    if (typeof data.settings.maintenance.enabled !== 'boolean') {
      data.settings.maintenance.enabled = Boolean(data.settings.maintenance.enabled);
      modifie = true;
    }
    if (!data.settings.maintenance.message) {
      data.settings.maintenance.message = 'Astro Paquita se refait une beauté. Le site sera de retour très bientôt.';
      modifie = true;
    }
    if (!('updated_at' in data.settings.maintenance)) {
      data.settings.maintenance.updated_at = null;
      modifie = true;
    }
  }

  if (!data.compteurs || typeof data.compteurs !== 'object') {
    data.compteurs = {};
    modifie = true;
  }

  for (const cle of ['users', 'promoCodes', 'promoUtilisations', 'questionPurchases', 'activityLogs']) {
    if (!Number.isFinite(Number(data.compteurs[cle]))) {
      const maxId = data[cle].reduce((m, x) => Math.max(m, Number(x && x.id) || 0), 0);
      data.compteurs[cle] = maxId;
      modifie = true;
    }
  }

  // Migration non destructive des anciens comptes.
  data.users.forEach((u) => {
    const valeursParDefaut = {
      login_count: 0,
      first_login_at: null,
      last_login_at: null,
      visit_count: 0,
      last_visit_at: null,
      last_activity_at: null,
      consultation_count: 0,
      last_consultation_at: null,
      question_credits: 1, // 1 question offerte, y compris pour les comptes déjà existants.
      questions_used: 0,
      question_packs_bought: 0,
      role: 'user',
    };
    for (const [cle, valeur] of Object.entries(valeursParDefaut)) {
      if (!(cle in u)) {
        u[cle] = valeur;
        modifie = true;
      }
    }
  });

  return { data, modifie };
}

function charger() {
  if (!fs.existsSync(DB_PATH)) {
    const data = cloneSchemaVide();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return data;
  }

  try {
    const brut = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    const { data, modifie } = normaliserData(brut);
    if (modifie) fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.error('Fichier de données corrompu, réinitialisation :', e.message);
    const data = cloneSchemaVide();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return data;
  }
}

function sauvegarder(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function nouvelId(data, table) {
  data.compteurs[table] = (Number(data.compteurs[table]) || 0) + 1;
  return data.compteurs[table];
}

function memeId(a, b) {
  return String(a) === String(b);
}

// ============================================================
// UTILISATEURS
// ============================================================
function getUserByEmail(email) {
  const data = charger();
  return data.users.find((u) => u.email === email) || null;
}

function getUserById(id) {
  const data = charger();
  return data.users.find((u) => memeId(u.id, id)) || null;
}

function insertUser({ email, password_hash, prenom }) {
  const data = charger();
  const user = {
    id: nouvelId(data, 'users'),
    email,
    password_hash,
    prenom: prenom || null,
    premium: 0,
    premium_expires_at: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    created_at: new Date().toISOString(),
    login_count: 0,
    first_login_at: null,
    last_login_at: null,
    visit_count: 0,
    last_visit_at: null,
    last_activity_at: null,
    consultation_count: 0,
    last_consultation_at: null,
    question_credits: 1,
    questions_used: 0,
    question_packs_bought: 0,
    role: 'user',
  };
  data.users.push(user);
  sauvegarder(data);
  return user;
}

function updateUser(id, champs) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return null;
  Object.assign(user, champs);
  sauvegarder(data);
  return user;
}

function updateUserByStripeSubscriptionId(subId, champs) {
  const data = charger();
  const user = data.users.find((u) => u.stripe_subscription_id === subId);
  if (!user) return null;
  Object.assign(user, champs);
  sauvegarder(data);
  return user;
}

function setUserRole(id, role) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return null;
  user.role = role === 'admin' ? 'admin' : 'user';
  user.last_activity_at = new Date().toISOString();
  sauvegarder(data);
  return user;
}

function deleteUser(id) {
  const data = charger();
  const index = data.users.findIndex((u) => memeId(u.id, id));
  if (index === -1) return false;
  data.users.splice(index, 1);
  // Les journaux d'activité sont liés au compte : ils sont supprimés avec lui.
  data.activityLogs = (data.activityLogs || []).filter((a) => !memeId(a.user_id, id));
  sauvegarder(data);
  return true;
}

function getAllUsers() {
  const data = charger();
  return data.users.map(({ password_hash, ...reste }) => reste);
}

function recordLogin(id) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return null;
  const maintenant = new Date().toISOString();
  user.login_count = (Number(user.login_count) || 0) + 1;
  if (!user.first_login_at) user.first_login_at = maintenant;
  user.last_login_at = maintenant;
  user.last_activity_at = maintenant;
  sauvegarder(data);
  return user;
}

function recordVisit(id) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return null;
  const maintenant = new Date().toISOString();
  user.visit_count = (Number(user.visit_count) || 0) + 1;
  user.last_visit_at = maintenant;
  user.last_activity_at = maintenant;
  sauvegarder(data);
  return user;
}

function touchActivity(id, delaiSecondes = 60) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return null;
  const maintenant = Date.now();
  const precedent = user.last_activity_at ? new Date(user.last_activity_at).getTime() : 0;
  if (!precedent || maintenant - precedent >= delaiSecondes * 1000) {
    user.last_activity_at = new Date(maintenant).toISOString();
    sauvegarder(data);
  }
  return user;
}


// ============================================================
// HISTORIQUE DES CONSULTATIONS (sans contenu privé)
// ============================================================
const MAX_ACTIVITY_PAR_UTILISATEUR = 300;

function nettoyerTexteActivite(v, max = 90) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function contexteActiviteSecurise(feature, contexte) {
  const c = contexte && typeof contexte === 'object' && !Array.isArray(contexte) ? contexte : {};
  // Liste blanche stricte : on ne stocke jamais le texte d'une question, un prompt ou une réponse IA.
  const autorisees = ['period', 'date', 'days', 'domain', 'intent', 'relation', 'horizon', 'label'];
  const out = {};
  for (const cle of autorisees) {
    if (!(cle in c)) continue;
    if (cle === 'days') {
      const n = Number(c[cle]);
      if (Number.isFinite(n)) out[cle] = Math.max(0, Math.min(3650, Math.round(n)));
    } else {
      const val = nettoyerTexteActivite(c[cle]);
      if (val) out[cle] = val;
    }
  }
  return out;
}

function recordActivity(id, feature, contexte) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return null;

  const featureNet = nettoyerTexteActivite(feature, 40) || 'unknown';
  const maintenant = new Date().toISOString();
  const entree = {
    id: nouvelId(data, 'activityLogs'),
    user_id: user.id,
    feature: featureNet,
    context: contexteActiviteSecurise(featureNet, contexte),
    created_at: maintenant,
  };
  data.activityLogs.push(entree);
  user.consultation_count = (Number(user.consultation_count) || 0) + 1;
  user.last_consultation_at = maintenant;
  user.last_activity_at = maintenant;

  // Évite que le fichier JSON grossisse indéfiniment : 300 consultations récentes par compte.
  const idsUtilisateur = data.activityLogs
    .filter((a) => memeId(a.user_id, user.id))
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .map((a) => a.id);
  if (idsUtilisateur.length > MAX_ACTIVITY_PAR_UTILISATEUR) {
    const garder = new Set(idsUtilisateur.slice(0, MAX_ACTIVITY_PAR_UTILISATEUR).map(String));
    data.activityLogs = data.activityLogs.filter((a) => !memeId(a.user_id, user.id) || garder.has(String(a.id)));
  }

  sauvegarder(data);
  return entree;
}

function getUserActivity(userId, limit = 100) {
  const data = charger();
  const n = Math.max(1, Math.min(300, Number(limit) || 100));
  return (data.activityLogs || [])
    .filter((a) => memeId(a.user_id, userId))
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, n)
    .map((a) => ({ ...a }));
}

function consumeQuestionCredit(id) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user || (Number(user.question_credits) || 0) <= 0) return false;
  user.question_credits = Math.max(0, (Number(user.question_credits) || 0) - 1);
  user.questions_used = (Number(user.questions_used) || 0) + 1;
  user.last_activity_at = new Date().toISOString();
  sauvegarder(data);
  return true;
}

function refundQuestionCredit(id) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return false;
  user.question_credits = (Number(user.question_credits) || 0) + 1;
  user.questions_used = Math.max(0, (Number(user.questions_used) || 0) - 1);
  sauvegarder(data);
  return true;
}

function enregistrerAchatQuestions(userId, stripeSessionId, credits = 5) {
  const data = charger();
  const deja = data.questionPurchases.find((p) => p.stripe_session_id === stripeSessionId);
  const user = data.users.find((u) => memeId(u.id, userId));
  if (!user) return { ok: false, duplicate: false, user: null };

  if (deja) return { ok: true, duplicate: true, user };

  const nbCredits = Math.max(1, Number(credits) || 5);
  user.question_credits = (Number(user.question_credits) || 0) + nbCredits;
  user.question_packs_bought = (Number(user.question_packs_bought) || 0) + 1;
  user.last_activity_at = new Date().toISOString();

  data.questionPurchases.push({
    id: nouvelId(data, 'questionPurchases'),
    user_id: user.id,
    stripe_session_id: stripeSessionId,
    credits: nbCredits,
    purchased_at: new Date().toISOString(),
  });

  sauvegarder(data);
  return { ok: true, duplicate: false, user };
}

// ============================================================
// RÉGLAGES DU SITE
// ============================================================
function getSiteSettings() {
  const data = charger();
  return data.settings || cloneSchemaVide().settings;
}

function setMaintenance({ enabled, message }) {
  const data = charger();
  if (!data.settings || typeof data.settings !== 'object') data.settings = {};
  const courant = data.settings.maintenance || {};
  data.settings.maintenance = {
    enabled: Boolean(enabled),
    message: String(message || courant.message || 'Astro Paquita se refait une beauté. Le site sera de retour très bientôt.').trim(),
    updated_at: new Date().toISOString(),
  };
  sauvegarder(data);
  return data.settings.maintenance;
}

// ============================================================
// CODES PROMO
// ============================================================
function getPromoByCode(code) {
  const data = charger();
  return data.promoCodes.find((p) => p.code === code && p.actif) || null;
}

function getAllPromoCodes() {
  const data = charger();
  return [...data.promoCodes].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

function insertPromoCode({ code, type, valeur, maxUtilisations, expireLe }) {
  const data = charger();
  if (data.promoCodes.some((p) => p.code === code)) throw new Error('CODE_EXISTANT');

  const promo = {
    id: nouvelId(data, 'promoCodes'),
    code,
    type,
    valeur,
    max_utilisations: maxUtilisations || null,
    utilisations_count: 0,
    expire_le: expireLe || null,
    actif: 1,
    created_at: new Date().toISOString(),
  };
  data.promoCodes.push(promo);
  sauvegarder(data);
  return promo;
}

function desactiverPromoCode(id) {
  const data = charger();
  const promo = data.promoCodes.find((p) => memeId(p.id, id));
  if (promo) {
    promo.actif = 0;
    sauvegarder(data);
  }
}

function aUtilisePromo(userId, promoId) {
  const data = charger();
  return data.promoUtilisations.some(
    (u) => memeId(u.user_id, userId) && memeId(u.promo_id, promoId)
  );
}

function enregistrerUtilisationPromo(userId, promoId) {
  const data = charger();
  data.promoUtilisations.push({
    id: nouvelId(data, 'promoUtilisations'),
    user_id: userId,
    promo_id: promoId,
    utilise_le: new Date().toISOString(),
  });
  const promo = data.promoCodes.find((p) => memeId(p.id, promoId));
  if (promo) promo.utilisations_count = (Number(promo.utilisations_count) || 0) + 1;
  sauvegarder(data);
}

module.exports = {
  getUserByEmail,
  getUserById,
  insertUser,
  updateUser,
  setUserRole,
  updateUserByStripeSubscriptionId,
  deleteUser,
  getAllUsers,
  recordLogin,
  recordVisit,
  touchActivity,
  recordActivity,
  getUserActivity,
  consumeQuestionCredit,
  refundQuestionCredit,
  enregistrerAchatQuestions,
  getSiteSettings,
  setMaintenance,
  getPromoByCode,
  getAllPromoCodes,
  insertPromoCode,
  desactiverPromoCode,
  aUtilisePromo,
  enregistrerUtilisationPromo,
};
