import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

let pool;

export async function ensureStore() {
  if (process.env.DATABASE_URL) {
    return ensureDatabaseBackedStore();
  }

  return ensureFileBackedStore();
}

export async function saveStore(database) {
  if (process.env.DATABASE_URL) {
    return saveDatabaseStore(database);
  }

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(database, null, 2), 'utf8');
}

async function ensureDatabaseBackedStore() {
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )
  `);

  const existing = await pool.query('SELECT value FROM app_state WHERE key = $1', ['territory-fitness']);
  if (existing.rows.length > 0) {
    return existing.rows[0].value;
  }

  const seed = await ensureFileBackedStore();
  await saveDatabaseStore(seed);
  return seed;
}

async function saveDatabaseStore(database) {
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  });

  await pool.query(
    `
      INSERT INTO app_state (key, value)
      VALUES ($1, $2::jsonb)
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value
    `,
    ['territory-fitness', JSON.stringify(database)]
  );
}

async function ensureFileBackedStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DB_PATH, 'utf8');
    return JSON.parse(rawValue);
  } catch {
    const seed = createSeedDatabase();
    await writeFile(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

function createSeedDatabase() {
  return {
    users: [
      {
        id: 'u1',
        email: 'nina@example.com',
        passwordHash: null,
        name: 'Nina',
        bio: 'Defending harbour tiles',
        status: 'Defending harbour tiles',
        vibe: 'Hill crusher',
        distanceAwayKm: 0.7,
        totalTiles: 182,
        baseTiles: 182,
        totalDistanceKm: 128,
        active: true,
        followers: [],
        following: ['u2', 'u3'],
        groups: ['g1'],
        badges: ['Harbour Queen', 'Hill Crusher'],
        stickers: ['Sunrise Streak'],
        points: 3120,
        wins: 18,
        losses: 6,
        streak: 4,
        lastSession: null,
      },
      {
        id: 'you',
        email: 'you@example.com',
        passwordHash: null,
        name: 'You',
        bio: 'Looking for a new route',
        status: 'Looking for a new route',
        vibe: 'Territory runner',
        distanceAwayKm: 0,
        totalTiles: 124,
        baseTiles: 124,
        totalDistanceKm: 96,
        active: false,
        followers: ['u2'],
        following: ['u1'],
        groups: ['g1', 'g3'],
        badges: ['Coastal Streak'],
        stickers: ['100 Tile Capture'],
        points: 2140,
        wins: 11,
        losses: 8,
        streak: 3,
        lastSession: null,
      },
      {
        id: 'u2',
        email: 'omar@example.com',
        passwordHash: null,
        name: 'Omar',
        bio: 'Easy recovery run',
        status: 'Easy recovery run',
        vibe: 'Consistency monster',
        distanceAwayKm: 1.5,
        totalTiles: 112,
        baseTiles: 112,
        totalDistanceKm: 83,
        active: true,
        followers: ['you'],
        following: ['u1'],
        groups: ['g2'],
        badges: ['Consistency Monster'],
        stickers: [],
        points: 1880,
        wins: 9,
        losses: 7,
        streak: 1,
        lastSession: null,
      },
      {
        id: 'u3',
        email: 'mia@example.com',
        passwordHash: null,
        name: 'Mia',
        bio: 'Capturing east blocks',
        status: 'Capturing east blocks',
        vibe: 'Tile hunter',
        distanceAwayKm: 1.1,
        totalTiles: 101,
        baseTiles: 101,
        totalDistanceKm: 75,
        active: true,
        followers: [],
        following: ['you'],
        groups: ['g3'],
        badges: ['Sunset Chaser'],
        stickers: ['Tile Hunter'],
        points: 1710,
        wins: 7,
        losses: 5,
        streak: 2,
        lastSession: null,
      },
    ],
    groups: [
      { id: 'g1', name: 'City Crushers', members: ['you', 'u1'], description: 'Competitive harbour runners' },
      { id: 'g2', name: 'Sunrise Tempo Crew', members: ['u2'], description: 'Early morning pace sessions' },
      { id: 'g3', name: 'Weekend Capture League', members: ['you', 'u3'], description: 'Saturday tile battles' },
    ],
    challenges: [
      { id: 'c1', title: 'Daily Burst', period: 'Daily', target: 'Run 3 km', rewardPoints: 120, progress: 1.4, total: 3 },
      { id: 'c2', title: 'Weekly Territory Push', period: 'Weekly', target: 'Capture 25 tiles', rewardPoints: 320, progress: 11, total: 25 },
      { id: 'c3', title: 'Monthly Endurance', period: 'Monthly', target: 'Run 80 km', rewardPoints: 900, progress: 26, total: 80 },
    ],
    territory: [
      { id: '15781:60696', owner: 'you', center: { latitude: 18.9378, longitude: 72.8358 }, effortKm: 5.4, contested: false, zoneName: 'Harbour Edge' },
      { id: '15781:60697', owner: 'you', center: { latitude: 18.9378, longitude: 72.837 }, effortKm: 3.1, contested: false, zoneName: 'Fort Circuit' },
      { id: '15782:60696', owner: 'open', center: { latitude: 18.939, longitude: 72.8358 }, effortKm: 0, contested: false, zoneName: 'Clock Tower Lane' },
      { id: '15782:60697', owner: 'u1', center: { latitude: 18.939, longitude: 72.837 }, effortKm: 6.2, contested: true, zoneName: 'Marine Sprint Gate' },
    ],
    races: [
      {
        id: 'race-1',
        title: 'Marine Drive Global 5K',
        type: 'global',
        distanceKm: 5,
        status: 'countdown',
        startsAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
        entrants: 26,
        prize: '450 XP + Harbour Crest',
        city: 'Mumbai',
      },
      {
        id: 'race-2',
        title: 'Friends Sprint Duel',
        type: 'friends',
        distanceKm: 1,
        status: 'live',
        startsAt: new Date().toISOString(),
        entrants: 2,
        prize: 'Control of 4 coastal tiles',
        city: 'Mumbai',
      },
      {
        id: 'race-3',
        title: 'Tile Rush East Blocks',
        type: 'tile-rush',
        distanceKm: 3,
        status: 'countdown',
        startsAt: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
        entrants: 14,
        prize: 'District bonus points',
        city: 'Mumbai',
      },
    ],
    feed: [
      { id: 'feed-1', actor: 'Nina', message: 'just defended 3 harbour tiles' },
      { id: 'feed-2', actor: 'Mia', message: 'started a sunset capture run' },
    ],
    chatMessages: [
      { id: 'm1', groupId: 'g1', authorId: 'u1', authorName: 'Nina', text: 'Harbour push at 6 PM?', createdAt: new Date().toISOString() },
      { id: 'm2', groupId: 'g3', authorId: 'u3', authorName: 'Mia', text: 'Weekend route looks open on the east side.', createdAt: new Date().toISOString() },
    ],
    sessions: [],
  };
}
