// Static data layer (no backend). Sample users are the starting data; everything
// is saved on the phone with AsyncStorage so it survives app restarts.
// Every screen talks to data ONLY through these functions.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isMatch } from './utils/matchScore';
import { DEFAULT_TEACH_LEVEL, DEFAULT_LEARN_LEVEL } from './constants';

const DB_KEY = 'skillexchange_db_v2';

const sk = (name, level) => ({ name, level });

const seed = () => ({
  users: [
    { id: '1', name: 'Aarav', email: 'aarav@test.com', password: '1234', bio: '', teach: [sk('java', 'expert')], learn: [sk('guitar', 'new')] },
    { id: '2', name: 'Diya', email: 'diya@test.com', password: '1234', bio: '', teach: [sk('guitar', 'intermediate')], learn: [sk('java', 'beginner')] },
    { id: '3', name: 'Rohan', email: 'rohan@test.com', password: '1234', bio: '', teach: [sk('photoshop', 'expert')], learn: [sk('python', 'new')] },
    { id: '4', name: 'Sneha', email: 'sneha@test.com', password: '1234', bio: '', teach: [sk('python', 'intermediate')], learn: [sk('photoshop', 'beginner')] },
    { id: '5', name: 'Karan', email: 'karan@test.com', password: '1234', bio: '', teach: [sk('guitar', 'beginner'), sk('drawing', 'intermediate')], learn: [sk('java', 'intermediate')] },
  ],
  requests: [],
  sessions: [],
  // Starting ratings so reputation badges are visible (no comments)
  ratings: [
    { id: 'r1', sessionId: null, fromUser: '3', toUser: '2', stars: 5, comment: '', createdAt: '2026-09-20T10:00:00.000Z' },
    { id: 'r2', sessionId: null, fromUser: '4', toUser: '2', stars: 5, comment: '', createdAt: '2026-09-22T10:00:00.000Z' },
    { id: 'r3', sessionId: null, fromUser: '5', toUser: '2', stars: 4, comment: '', createdAt: '2026-09-25T10:00:00.000Z' },
    { id: 'r4', sessionId: null, fromUser: '1', toUser: '5', stars: 4, comment: '', createdAt: '2026-09-26T10:00:00.000Z' },
    { id: 'r5', sessionId: null, fromUser: '2', toUser: '1', stars: 5, comment: '', createdAt: '2026-09-27T10:00:00.000Z' },
    { id: 'r6', sessionId: null, fromUser: '5', toUser: '1', stars: 4, comment: '', createdAt: '2026-09-28T10:00:00.000Z' },
  ],
  nextId: 6,
});

let db = null;
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

async function load() {
  if (db) return db;
  try {
    const raw = await AsyncStorage.getItem(DB_KEY);
    db = raw ? JSON.parse(raw) : seed();
  } catch (e) {
    db = seed();
  }
  db.requests = db.requests || [];
  db.sessions = db.sessions || [];
  db.ratings = db.ratings || [];
  return db;
}

async function save() {
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    // ignore storage errors, the app still works in memory
  }
}

// Accepts plain names or { name, level } objects and returns clean { name, level } objects
const cleanSkills = (list = [], defaultLevel) => {
  const seen = new Set();
  const out = [];
  list.forEach((item) => {
    const name = (typeof item === 'string' ? item : item.name || '').trim().toLowerCase();
    const level = typeof item === 'string' ? defaultLevel : item.level || defaultLevel;
    if (name && !seen.has(name)) {
      seen.add(name);
      out.push({ name, level });
    }
  });
  return out;
};

const strip = ({ password, ...rest }) => rest;
const nameOf = (d, id) => {
  const u = d.users.find((x) => x.id === id);
  return u ? u.name : 'Someone';
};

// Average stars and number of ratings a user has received
const ratingOf = (d, userId) => {
  const rs = d.ratings.filter((r) => r.toUser === userId);
  const count = rs.length;
  const avg = count ? rs.reduce((a, r) => a + r.stars, 0) / count : 0;
  return { avg: Math.round(avg * 10) / 10, count };
};
const withRating = (d, u) => ({ ...strip(u), rating: ratingOf(d, u.id) });

// ---------------- accounts and skills ----------------

export const getUser = async (id) => {
  const d = await load();
  const u = d.users.find((x) => x.id === id);
  return u ? strip(u) : null;
};

export const register = async ({ name, email, password, teach, learn }) => {
  const d = await load();
  await delay();
  if (d.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('This email is already registered');
  }
  const u = {
    id: String(d.nextId++),
    name,
    email,
    password,
    bio: '',
    teach: cleanSkills(teach, DEFAULT_TEACH_LEVEL),
    learn: cleanSkills(learn, DEFAULT_LEARN_LEVEL),
  };
  d.users.push(u);
  await save();
  return strip(u);
};

export const login = async (email, password) => {
  const d = await load();
  await delay();
  const u = d.users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) throw new Error('Wrong email or password');
  return strip(u);
};

// teach and learn are arrays of { name, level }
export const updateSkills = async (id, teach, learn) => {
  const d = await load();
  await delay(120);
  const u = d.users.find((x) => x.id === id);
  if (!u) throw new Error('User not found');
  u.teach = cleanSkills(teach, DEFAULT_TEACH_LEVEL);
  u.learn = cleanSkills(learn, DEFAULT_LEARN_LEVEL);
  await save();
  return strip(u);
};

export const updateProfile = async (id, { name, bio }) => {
  const d = await load();
  await delay(150);
  const u = d.users.find((x) => x.id === id);
  if (!u) throw new Error('User not found');
  u.name = name.trim();
  u.bio = (bio || '').trim();
  await save();
  return strip(u);
};

// ---------------- matching and requests ----------------

// Reciprocal match with levels: they can teach me something at a level above mine,
// AND I can teach them something at a level above theirs.
export const getMatches = async (id) => {
  const d = await load();
  await delay(200);
  const me = d.users.find((u) => u.id === id);
  if (!me) return [];
  return d.users.filter((u) => u.id !== id && isMatch(me, u)).map((u) => withRating(d, u));
};

export const sendRequest = async (fromUser, toUser) => {
  const d = await load();
  await delay(200);
  const exists = d.requests.find(
    (r) =>
      ((r.fromUser === fromUser && r.toUser === toUser) || (r.fromUser === toUser && r.toUser === fromUser)) &&
      r.status !== 'REJECTED'
  );
  if (exists) throw new Error('A request already exists with this person');
  d.requests.push({ id: String(d.nextId++), fromUser, toUser, status: 'PENDING' });
  await save();
  return true;
};

export const getRequests = async (id) => {
  const d = await load();
  await delay(150);
  return d.requests
    .filter((r) => r.fromUser === id || r.toUser === id)
    .map((r) => {
      const otherId = r.fromUser === id ? r.toUser : r.fromUser;
      const other = d.users.find((u) => u.id === otherId);
      return { ...r, other: other ? withRating(d, other) : null };
    })
    .reverse(); // newest first
};

export const respondRequest = async (reqId, status) => {
  const d = await load();
  await delay(200);
  const r = d.requests.find((x) => x.id === reqId);
  if (!r) throw new Error('Request not found');
  r.status = status;
  await save();
  return true;
};

// ---------------- sessions ----------------

// Plan a session with someone you are connected with (accepted request).
export const createSession = async ({ creatorId, partnerId, skill, teacherId, startsAt }) => {
  const d = await load();
  await delay(200);
  const connected = d.requests.find(
    (r) =>
      r.status === 'ACCEPTED' &&
      ((r.fromUser === creatorId && r.toUser === partnerId) || (r.fromUser === partnerId && r.toUser === creatorId))
  );
  if (!connected) throw new Error('You can only plan sessions with people you are connected with');
  if (new Date(startsAt).getTime() <= Date.now()) throw new Error('Pick a time in the future');
  const clash = d.sessions.find(
    (s) =>
      s.status === 'SCHEDULED' &&
      s.startsAt === startsAt &&
      [creatorId, partnerId].some((id) => s.userA === id || s.userB === id)
  );
  if (clash) throw new Error('One of you already has a session at that time');
  const s = {
    id: String(d.nextId++),
    userA: creatorId,
    userB: partnerId,
    skill,
    teacherId,
    startsAt,
    status: 'SCHEDULED',
    reminderId: null,
  };
  d.sessions.push(s);
  await save();
  return s;
};

export const getSessions = async (userId) => {
  const d = await load();
  await delay(150);
  return d.sessions
    .filter((s) => s.userA === userId || s.userB === userId)
    .map((s) => {
      const otherId = s.userA === userId ? s.userB : s.userA;
      const other = d.users.find((u) => u.id === otherId);
      const mine = d.ratings.find((r) => r.sessionId === s.id && r.fromUser === userId) || null;
      return { ...s, other: other ? strip(other) : null, teacherName: nameOf(d, s.teacherId), myRating: mine };
    });
};

export const setSessionStatus = async (id, status) => {
  const d = await load();
  await delay(150);
  const s = d.sessions.find((x) => x.id === id);
  if (!s) throw new Error('Session not found');
  s.status = status;
  await save();
  return true;
};

export const setSessionReminder = async (id, reminderId) => {
  const d = await load();
  const s = d.sessions.find((x) => x.id === id);
  if (s) {
    s.reminderId = reminderId;
    await save();
  }
  return true;
};

// ---------------- ratings and reputation ----------------

// Rate the other person after a COMPLETED session (one rating per person per session).
export const rateSession = async ({ sessionId, fromUser, stars, comment }) => {
  const d = await load();
  await delay(200);
  const s = d.sessions.find((x) => x.id === sessionId);
  if (!s) throw new Error('Session not found');
  if (s.status !== 'COMPLETED') throw new Error('You can rate after the session is completed');
  if (s.userA !== fromUser && s.userB !== fromUser) throw new Error('You were not part of this session');
  if (d.ratings.find((r) => r.sessionId === sessionId && r.fromUser === fromUser)) {
    throw new Error('You already rated this session');
  }
  const toUser = s.userA === fromUser ? s.userB : s.userA;
  d.ratings.push({
    id: String(d.nextId++),
    sessionId,
    fromUser,
    toUser,
    stars,
    comment: (comment || '').trim(),
    createdAt: new Date().toISOString(),
  });
  await save();
  return true;
};

// Rating summary, reviews with comments, and sessions completed for the Profile screen
export const getProfileStats = async (userId) => {
  const d = await load();
  await delay(100);
  const reviews = d.ratings
    .filter((r) => r.toUser === userId && r.comment)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({ id: r.id, stars: r.stars, comment: r.comment, fromName: nameOf(d, r.fromUser) }));
  const sessionsDone = d.sessions.filter(
    (s) => s.status === 'COMPLETED' && (s.userA === userId || s.userB === userId)
  ).length;
  return { rating: ratingOf(d, userId), reviews, sessionsDone };
};

export const resetDemoData = async () => {
  db = seed();
  await save();
  return true;
};
