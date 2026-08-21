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
  journalEntries: [],
  savedWindows: [],
  profiles: [],
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
    journalEntries: 0,
    savedWindows: 0,
    profiles: 0,
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

  for (const cle of ['users', 'promoCodes', 'promoUtilisations', 'questionPurchases', 'activityLogs', 'journalEntries', 'savedWindows', 'profiles']) {
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

  for (const cle of ['users', 'promoCodes', 'promoUtilisations', 'questionPurchases', 'activityLogs', 'journalEntries', 'savedWindows', 'profiles']) {
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
      lang: 'fr',
      timezone: null,
      preferences: {},
      life_context: {},
      notifications_enabled: false,
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
    lang: 'fr',
    timezone: null,
    preferences: {},
    life_context: {},
    notifications_enabled: false,
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
  data.journalEntries = (data.journalEntries || []).filter((a) => !memeId(a.user_id, id));
  data.savedWindows = (data.savedWindows || []).filter((a) => !memeId(a.user_id, id));
  data.profiles = (data.profiles || []).filter((a) => !memeId(a.user_id, id));
  sauvegarder(data);
  return true;
}

function getAllUsers() {
  const data = charger();
  return data.users.map(({ password_hash, ...reste }) => ({
    ...reste,
    profile_count: (data.profiles || []).filter((p) => memeId(p.user_id, reste.id) && !p.deleted_at).length,
  }));
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
  const autorisees = ['period', 'date', 'days', 'domain', 'intent', 'relation', 'horizon', 'label', 'lang', 'timezone', 'surface', 'profile_key', 'profile_name', 'secondary_profile_key', 'secondary_profile_name'];
  const out = {};
  for (const cle of autorisees) {
    if (!(cle in c)) continue;
    if (cle === 'days') {
      const n = Number(c[cle]);
      if (Number.isFinite(n)) out[cle] = Math.max(0, Math.min(3650, Math.round(n)));
    } else {
      const max = cle === 'profile_key' || cle === 'secondary_profile_key' ? 180 : (cle === 'profile_name' || cle === 'secondary_profile_name' ? 100 : 90);
      const val = nettoyerTexteActivite(c[cle], max);
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


// ============================================================
// PROFILS ASTRO — synchronisation minimale serveur pour l'administration
// Les profils étaient historiquement stockés uniquement dans localStorage.
// À partir de V94, le navigateur connecté envoie une copie structurée afin que
// l'admin puisse connaître le nombre de profils, leur détail et le profil utilisé
// pour une consultation. Les anciens profils apparaissent lors de la prochaine
// ouverture du site par l'utilisateur.
// ============================================================
function nettoyerProfilEntree(raw) {
  const p = raw && typeof raw === 'object' ? raw : {};
  const texte = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
  const key = texte(p.key || p.profile_key, 180);
  const prenom = texte(p.prenom || p.name, 100);
  const date = texte(p.date, 20);
  const heure = texte(p.heure, 12);
  const ville = texte(p.ville, 160);
  const tz = texte(p.tz || p.timezone, 80);
  const genre = texte(p.genre, 8);
  const latN = Number(p.lat), lonN = Number(p.lon);
  if (!key || !prenom) return null;
  return {
    profile_key: key,
    prenom,
    date,
    heure,
    ville,
    lat: Number.isFinite(latN) ? Math.max(-90, Math.min(90, latN)) : null,
    lon: Number.isFinite(lonN) ? Math.max(-180, Math.min(180, lonN)) : null,
    tz,
    genre,
  };
}

function syncUserProfiles(userId, profils, activeKey) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, userId));
  if (!user) return [];
  const now = new Date().toISOString();
  const incoming = Array.isArray(profils) ? profils.slice(0, 60).map(nettoyerProfilEntree).filter(Boolean) : [];
  const incomingKeys = new Set(incoming.map((x) => x.profile_key));
  const actif = String(activeKey || '').slice(0, 180);

  for (const x of incoming) {
    let row = (data.profiles || []).find((p) => memeId(p.user_id, userId) && p.profile_key === x.profile_key);
    if (!row) {
      row = {
        id: nouvelId(data, 'profiles'),
        user_id: user.id,
        created_at: now,
      };
      data.profiles.push(row);
    }
    Object.assign(row, x, {
      active: x.profile_key === actif,
      updated_at: now,
      last_seen_at: now,
      deleted_at: null,
    });
  }

  for (const row of (data.profiles || []).filter((p) => memeId(p.user_id, userId) && !p.deleted_at)) {
    if (!incomingKeys.has(row.profile_key)) {
      row.active = false;
      row.deleted_at = now;
      row.updated_at = now;
    } else if (row.profile_key !== actif) {
      row.active = false;
    }
  }

  user.last_activity_at = now;
  sauvegarder(data);
  return getUserProfiles(userId);
}

function getUserProfiles(userId, includeDeleted = false) {
  const data = charger();
  return (data.profiles || [])
    .filter((p) => memeId(p.user_id, userId) && (includeDeleted || !p.deleted_at))
    .sort((a, b) => String(a.prenom || '').localeCompare(String(b.prenom || ''), 'fr'))
    .map((p) => ({ ...p }));
}

function getAllProfiles(includeDeleted = false) {
  const data = charger();
  const acts = data.activityLogs || [];
  return (data.profiles || [])
    .filter((p) => includeDeleted || !p.deleted_at)
    .map((p) => {
      const owner = data.users.find((u) => memeId(u.id, p.user_id));
      const pa = acts.filter((a) => memeId(a.user_id, p.user_id) && a.context && String(a.context.profile_key || '') === String(p.profile_key || ''));
      const q = pa.filter((a) => a.feature === 'question');
      const last = pa.slice().sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')))[0];
      return {
        ...p,
        owner_prenom: owner ? owner.prenom || null : null,
        owner_email: owner ? owner.email || null : null,
        consultations: pa.length,
        questions: q.length,
        last_consultation_at: last ? last.created_at : null,
      };
    })
    .sort((a, b) => String(b.last_consultation_at || b.updated_at || '').localeCompare(String(a.last_consultation_at || a.updated_at || '')));
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

function ajouterCreditsQuestions(id, credits = 1) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return null;
  const nb = Math.max(1, Math.min(1000, Math.floor(Number(credits) || 1)));
  user.question_credits = (Number(user.question_credits) || 0) + nb;
  user.last_activity_at = new Date().toISOString();
  sauvegarder(data);
  return user;
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

// ============================================================
// V68 — PRÉFÉRENCES, JOURNAL PRIVÉ, FENÊTRES ENREGISTRÉES, ANALYTIQUE
// ============================================================
function nettoyerObjetSimple(obj, maxKeys = 20) {
  const src = obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
  const out = {};
  for (const [k, v] of Object.entries(src).slice(0, maxKeys)) {
    const key = String(k).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    if (!key) continue;
    if (typeof v === 'boolean' || typeof v === 'number') out[key] = v;
    else if (v != null) out[key] = String(v).slice(0, 300);
  }
  return out;
}

function updatePreferences(id, payload) {
  const data = charger();
  const user = data.users.find((u) => memeId(u.id, id));
  if (!user) return null;
  const p = payload && typeof payload === 'object' ? payload : {};
  if (p.lang && ['fr','en','es','ar'].includes(String(p.lang))) user.lang = String(p.lang);
  if ('timezone' in p) user.timezone = p.timezone ? String(p.timezone).slice(0, 80) : null;
  if ('notifications_enabled' in p) user.notifications_enabled = Boolean(p.notifications_enabled);
  if (p.preferences && typeof p.preferences === 'object') user.preferences = { ...(user.preferences || {}), ...nettoyerObjetSimple(p.preferences) };
  if (p.life_context && typeof p.life_context === 'object') user.life_context = nettoyerObjetSimple(p.life_context, 30);
  user.last_activity_at = new Date().toISOString();
  sauvegarder(data);
  return user;
}

function getJournal(userId, limit = 200) {
  const data = charger();
  const n = Math.max(1, Math.min(500, Number(limit) || 200));
  return (data.journalEntries || []).filter(x => memeId(x.user_id, userId))
    .sort((a,b)=>String(b.event_date||b.created_at||'').localeCompare(String(a.event_date||a.created_at||'')))
    .slice(0,n).map(x=>({...x}));
}

function addJournal(userId, entry) {
  const data = charger();
  const user = data.users.find(u=>memeId(u.id,userId));
  if (!user) return null;
  const e = entry && typeof entry==='object' ? entry : {};
  const text = String(e.text||'').trim().slice(0,4000);
  if (!text) return null;
  const row = {
    id: nouvelId(data,'journalEntries'), user_id:user.id,
    event_date: String(e.event_date||'').slice(0,10) || new Date().toISOString().slice(0,10),
    category: String(e.category||'general').slice(0,40),
    text, private: true, created_at:new Date().toISOString(), updated_at:new Date().toISOString()
  };
  data.journalEntries.push(row); user.last_activity_at=row.created_at; sauvegarder(data); return {...row};
}

function deleteJournal(userId, id) {
  const data=charger(); const i=data.journalEntries.findIndex(x=>memeId(x.id,id)&&memeId(x.user_id,userId));
  if(i<0)return false; data.journalEntries.splice(i,1); sauvegarder(data); return true;
}

function getSavedWindows(userId, limit=200) {
  const data=charger(); const n=Math.max(1,Math.min(500,Number(limit)||200));
  return (data.savedWindows||[]).filter(x=>memeId(x.user_id,userId))
   .sort((a,b)=>String(a.start_date||'').localeCompare(String(b.start_date||''))).slice(0,n).map(x=>({...x}));
}

function addSavedWindow(userId, entry) {
  const data=charger(); const user=data.users.find(u=>memeId(u.id,userId)); if(!user)return null;
  const e=entry&&typeof entry==='object'?entry:{}; const start=String(e.start_date||'').slice(0,10); if(!/^\d{4}-\d{2}-\d{2}$/.test(start))return null;
  const row={id:nouvelId(data,'savedWindows'),user_id:user.id,start_date:start,end_date:String(e.end_date||start).slice(0,10),intent:String(e.intent||'general').slice(0,40),label:String(e.label||'').slice(0,160),score:Number.isFinite(Number(e.score))?Math.max(-999,Math.min(100,Number(e.score))):null,reliability:String(e.reliability||'').slice(0,40),notify_days:Math.max(0,Math.min(90,Number(e.notify_days)||10)),created_at:new Date().toISOString()};
  data.savedWindows.push(row); user.last_activity_at=row.created_at; sauvegarder(data); return {...row};
}

function deleteSavedWindow(userId,id){const data=charger();const i=data.savedWindows.findIndex(x=>memeId(x.id,id)&&memeId(x.user_id,userId));if(i<0)return false;data.savedWindows.splice(i,1);sauvegarder(data);return true;}

function getAllActivity(){const data=charger();return (data.activityLogs||[]).map(x=>({...x}));}

function getAnalytics(){
  const data=charger(), users=data.users||[], acts=data.activityLogs||[]; const now=Date.now(), d7=7*86400000,d30=30*86400000;
  const lang={fr:0,en:0,es:0,ar:0,other:0}; users.forEach(u=>{const l=['fr','en','es','ar'].includes(u.lang)?u.lang:'other';lang[l]++;});
  const features={}; acts.forEach(a=>{features[a.feature]=(features[a.feature]||0)+1;});
  const active=(ms)=>users.filter(u=>u.last_activity_at && now-new Date(u.last_activity_at).getTime()<=ms).length;
  const premium=users.filter(u=>u.role==='admin'||(u.premium&&(!u.premium_expires_at||new Date(u.premium_expires_at)>=new Date()))).length;
  const days={}; for(const a of acts){const d=String(a.created_at||'').slice(0,10);if(d)days[d]=(days[d]||0)+1;}
  const profiles=(data.profiles||[]).filter(p=>!p.deleted_at);
  const profileKeysWithActivity=new Set(acts.filter(a=>a.context&&a.context.profile_key).map(a=>String(a.user_id)+'|'+String(a.context.profile_key)));
  const profileQuestions=acts.filter(a=>a.feature==='question'&&a.context&&a.context.profile_key).length;
  return {users:users.length,premium,free:Math.max(0,users.length-premium),active7:active(d7),active30:active(d30),consultations:users.reduce((sum,u)=>sum+(Number(u.consultation_count)||0),0),profiles:profiles.length,users_with_profiles:new Set(profiles.map(p=>String(p.user_id))).size,profiles_with_activity:profileKeysWithActivity.size,profile_questions:profileQuestions,languages:lang,features:Object.entries(features).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([feature,count])=>({feature,count})),days:Object.entries(days).sort((a,b)=>a[0].localeCompare(b[0])).slice(-30).map(([date,count])=>({date,count}))};
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
  syncUserProfiles,
  getUserProfiles,
  getAllProfiles,
  updatePreferences,
  getJournal,
  addJournal,
  deleteJournal,
  getSavedWindows,
  addSavedWindow,
  deleteSavedWindow,
  getAllActivity,
  getAnalytics,
  consumeQuestionCredit,
  refundQuestionCredit,
  ajouterCreditsQuestions,
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
