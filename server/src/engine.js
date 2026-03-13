import { createToken, hashPassword, verifyPassword } from './auth.js';
import { formatPace, getDistanceMeters, getTileCenterFromId, getTileId } from './geo.js';
import { ensureStore, saveStore } from './store.js';

const MAX_SPEED_METERS_PER_SECOND = 8.5;
const MAX_ACCURACY_METERS = 40;

export async function createEngine() {
  const database = await ensureStore();
  const sessions = new Map(database.sessions.map((session) => [session.id, session]));
  await ensureDemoPasswords(database);
  await persist(database, sessions);

  return {
    bootstrap(userId = 'you') {
      const user = requireUser(database, userId);
      return {
        currentUser: sanitizeUser(user),
        nearby: getNearbyRunners(database.users, userId),
        leaderboard: getLeaderboard(database.users),
        territory: database.territory,
        groups: database.groups.map((group) => mapGroup(group, database.users)),
        challenges: getChallengesForUser(database, user),
        feed: database.feed.slice(-8).reverse(),
        chatMessages: getChatMessagesForUser(database, user),
      };
    },
    async registerAccount(payload) {
      assertEmailAvailable(database.users, payload.email);

      const user = {
        id: `u${Date.now()}`,
        email: payload.email.toLowerCase(),
        passwordHash: await hashPassword(payload.password),
        name: payload.name.trim(),
        bio: 'New territory runner',
        status: 'Joined the league',
        vibe: 'New challenger',
        distanceAwayKm: 0,
        totalTiles: 0,
        baseTiles: 0,
        totalDistanceKm: 0,
        active: false,
        followers: [],
        following: [],
        groups: [],
        badges: ['Starter Badge'],
        stickers: ['First Steps'],
        points: 0,
        lastSession: null,
      };

      database.users.push(user);
      await persist(database, sessions);

      return createAuthResponse(user);
    },
    async loginAccount(payload) {
      const user = database.users.find((entry) => entry.email === payload.email.toLowerCase());
      if (!user) {
        return { error: 'Account not found.', status: 404 };
      }

      const validPassword = await verifyPassword(payload.password, user.passwordHash);
      if (!validPassword) {
        return { error: 'Invalid password.', status: 401 };
      }

      return { data: createAuthResponse(user), status: 200 };
    },
    async followUser(userId, targetUserId) {
      const user = requireUser(database, userId);
      const target = requireUser(database, targetUserId);

      if (!user.following.includes(targetUserId)) {
        user.following.push(targetUserId);
      }

      if (!target.followers.includes(userId)) {
        target.followers.push(userId);
      }

      await persist(database, sessions);
      return {
        user: sanitizeUser(user),
        target: sanitizeUser(target),
      };
    },
    async startSession(userId = 'you', location) {
      const sessionId = `session-${Date.now()}`;
      const tileId = getTileId(location.latitude, location.longitude);
      const timestamp = Date.now();
      const session = {
        id: sessionId,
        userId,
        startedAt: timestamp,
        lastTimestamp: timestamp,
        lastLocation: location,
        route: [location],
        capturedTileIds: [tileId],
        distanceMeters: 0,
        status: 'active',
      };

      sessions.set(sessionId, session);
      upsertTerritoryTile(database.territory, tileId, userId);
      applyUserProgress(database.users, userId, { active: true, status: 'Session live' });
      await persist(database, sessions);

      return summarizeSession(session);
    },
    async ingestLocation(sessionId, payload) {
      const session = sessions.get(sessionId);
      if (!session || session.status !== 'active') {
        return { error: 'Session not found or inactive.', status: 404 };
      }

      const validation = validateMovement(session.lastLocation, session.lastTimestamp, payload);
      if (!validation.ok) {
        return { error: validation.reason, status: 400 };
      }

      const nextLocation = {
        latitude: payload.latitude,
        longitude: payload.longitude,
      };

      const segmentDistance = getDistanceMeters(session.lastLocation, nextLocation);
      session.distanceMeters += segmentDistance;
      session.lastLocation = nextLocation;
      session.lastTimestamp = payload.timestamp;
      session.route.push(nextLocation);

      const tileId = getTileId(nextLocation.latitude, nextLocation.longitude);
      if (!session.capturedTileIds.includes(tileId)) {
        session.capturedTileIds.push(tileId);
        upsertTerritoryTile(database.territory, tileId, session.userId);
      }

      applyUserProgress(database.users, session.userId, {
        active: true,
        distanceMeters: session.distanceMeters,
        capturedTiles: session.capturedTileIds.length,
        status: 'Capturing territory',
      });

      await persist(database, sessions);
      return { data: summarizeSession(session), status: 200 };
    },
    async stopSession(sessionId) {
      const session = sessions.get(sessionId);
      if (!session || session.status !== 'active') {
        return { error: 'Session not found or inactive.', status: 404 };
      }

      session.status = 'finished';
      const summary = summarizeSession(session);
      applyUserProgress(database.users, session.userId, {
        active: false,
        distanceMeters: session.distanceMeters,
        capturedTiles: session.capturedTileIds.length,
        status: 'Finished a run',
        completedSession: summary,
        pointsAwarded: session.capturedTileIds.length * 12 + Math.round(session.distanceMeters / 40),
      });

      database.feed.push({
        id: `feed-${Date.now()}`,
        actor: requireUser(database, session.userId).name,
        message: `finished a ${formatKilometers(session.distanceMeters)} km session and captured ${session.capturedTileIds.length} tiles`,
      });

      await persist(database, sessions);
      return { data: summary, status: 200 };
    },
    getLeaderboard() {
      return getLeaderboard(database.users);
    },
    getNearby(userId = 'you') {
      return getNearbyRunners(database.users, userId);
    },
    getTerritory() {
      return database.territory;
    },
    getGroups(userId = 'you') {
      return database.groups
        .filter((group) => group.members.includes(userId))
        .map((group) => mapGroup(group, database.users));
    },
    getChallenges(userId = 'you') {
      const user = requireUser(database, userId);
      return getChallengesForUser(database, user);
    },
    getFeed() {
      return database.feed.slice(-20).reverse();
    },
    getChatMessages(userId = 'you', groupId) {
      const user = requireUser(database, userId);
      return getChatMessagesForUser(database, user, groupId);
    },
    async sendChatMessage(userId, payload) {
      const user = requireUser(database, userId);
      const group = database.groups.find((entry) => entry.id === payload.groupId);
      if (!group || !group.members.includes(userId)) {
        return { error: 'Group not found or access denied.', status: 404 };
      }

      const message = {
        id: `m-${Date.now()}`,
        groupId: payload.groupId,
        authorId: userId,
        authorName: user.name,
        text: payload.text.trim(),
        createdAt: new Date().toISOString(),
      };

      database.chatMessages.push(message);
      database.feed.push({
        id: `feed-${Date.now()}`,
        actor: user.name,
        message: `posted in ${group.name}: ${payload.text.trim()}`,
      });
      await persist(database, sessions);

      return { data: message, status: 201 };
    },
  };
}

export function validateMovement(previousLocation, previousTimestamp, payload) {
  if (typeof payload.accuracyMeters === 'number' && payload.accuracyMeters > MAX_ACCURACY_METERS) {
    return { ok: false, reason: 'Location accuracy is too low.' };
  }

  if (payload.timestamp <= previousTimestamp) {
    return { ok: false, reason: 'Location timestamp must increase.' };
  }

  const nextLocation = {
    latitude: payload.latitude,
    longitude: payload.longitude,
  };

  const distanceMeters = getDistanceMeters(previousLocation, nextLocation);
  const durationSeconds = Math.max(1, (payload.timestamp - previousTimestamp) / 1000);
  const speed = distanceMeters / durationSeconds;

  if (speed > MAX_SPEED_METERS_PER_SECOND) {
    return { ok: false, reason: 'Movement rejected as unrealistic.' };
  }

  return { ok: true };
}

function summarizeSession(session) {
  const durationSeconds = Math.max(1, Math.round((session.lastTimestamp - session.startedAt) / 1000));
  const distanceKm = Number((session.distanceMeters / 1000).toFixed(2));

  return {
    id: session.id,
    status: session.status,
    distanceKm,
    durationSeconds,
    capturedTiles: session.capturedTileIds.length,
    paceLabel: formatPace(distanceKm, durationSeconds),
    routePoints: session.route.length,
  };
}

function upsertTerritoryTile(territory, tileId, userId) {
  territory.splice(
    0,
    territory.length,
    ...replaceOrAppendTile(territory, {
      id: tileId,
      owner: userId === 'you' ? 'you' : userId,
      center: getTileCenterFromId(tileId),
    })
  );
}

function replaceOrAppendTile(territory, nextTile) {
  const found = territory.some((tile) => tile.id === nextTile.id);
  if (found) {
    return territory.map((tile) => (tile.id === nextTile.id ? nextTile : tile));
  }
  return [...territory, nextTile];
}

function applyUserProgress(users, userId, update) {
  const user = users.find((entry) => entry.id === userId);
  if (!user) {
    return;
  }

  if (typeof update.active === 'boolean') {
    user.active = update.active;
  }

  if (typeof update.distanceMeters === 'number') {
    user.totalDistanceKm = Number((Math.max(user.totalDistanceKm, 0) + update.distanceMeters / 1000).toFixed(2));
  }

  if (typeof update.capturedTiles === 'number') {
    user.baseTiles ??= user.totalTiles;
    user.totalTiles = Math.max(user.totalTiles, user.baseTiles + update.capturedTiles);
  }

  if (update.status) {
    user.status = update.status;
  }

  if (update.completedSession) {
    user.lastSession = update.completedSession;
  }

  if (typeof update.pointsAwarded === 'number') {
    user.points += update.pointsAwarded;
  }
}

function getLeaderboard(users) {
  return users
    .map((user) => ({
      id: user.id,
      name: user.name,
      tiles: user.totalTiles,
      km: user.totalDistanceKm,
      points: user.points,
    }))
    .sort((left, right) => right.tiles - left.tiles || right.points - left.points);
}

function getNearbyRunners(users, userId) {
  return users
    .filter((user) => user.id !== userId)
    .map((user) => ({
      id: user.id,
      name: user.name,
      status: user.status,
      distanceAwayKm: user.distanceAwayKm,
      vibe: user.vibe,
      active: user.active,
      points: user.points,
    }))
    .sort((left, right) => left.distanceAwayKm - right.distanceAwayKm);
}

function requireUser(database, userId) {
  const user = database.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error(`User ${userId} was not found.`);
  }
  return user;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    status: user.status,
    vibe: user.vibe,
    distanceAwayKm: user.distanceAwayKm,
    totalTiles: user.totalTiles,
    totalDistanceKm: user.totalDistanceKm,
    active: user.active,
    followers: user.followers.length,
    following: user.following.length,
    groups: user.groups,
    badges: user.badges,
    stickers: user.stickers,
    points: user.points,
    rewards: [...user.badges, ...user.stickers],
    lastSession: user.lastSession,
  };
}

function createAuthResponse(user) {
  return {
    token: createToken({ userId: user.id, email: user.email }),
    user: sanitizeUser(user),
  };
}

function assertEmailAvailable(users, email) {
  const exists = users.some((user) => user.email === email.toLowerCase());
  if (exists) {
    throw new Error('Email is already registered.');
  }
}

async function persist(database, sessions) {
  database.sessions = Array.from(sessions.values());
  await saveStore(database);
}

function formatKilometers(distanceMeters) {
  return Number((distanceMeters / 1000).toFixed(2));
}

async function ensureDemoPasswords(database) {
  for (const user of database.users) {
    if (!user.passwordHash) {
      user.passwordHash = await hashPassword('demo-pass');
    }
  }
}

function mapGroup(group, users) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    members: group.members.length,
    sampleMembers: group.members
      .slice(0, 3)
      .map((memberId) => users.find((user) => user.id === memberId)?.name)
      .filter(Boolean),
  };
}

function getChallengesForUser(database, user) {
  return database.challenges.map((challenge) => ({
    ...challenge,
    progress:
      challenge.period === 'Daily'
        ? Number(Math.max(challenge.progress, user.lastSession?.distanceKm ?? 0).toFixed(1))
        : challenge.period === 'Weekly'
          ? Math.max(challenge.progress, user.totalTiles - (user.baseTiles ?? 0))
          : Number(Math.max(challenge.progress, user.totalDistanceKm).toFixed(1)),
    completed:
      (challenge.period === 'Daily'
        ? Math.max(challenge.progress, user.lastSession?.distanceKm ?? 0)
        : challenge.period === 'Weekly'
          ? Math.max(challenge.progress, user.totalTiles - (user.baseTiles ?? 0))
          : Math.max(challenge.progress, user.totalDistanceKm)) >= challenge.total,
  }));
}

function getChatMessagesForUser(database, user, groupId) {
  const allowedGroups = new Set(user.groups);

  return database.chatMessages
    .filter((message) => allowedGroups.has(message.groupId))
    .filter((message) => (groupId ? message.groupId === groupId : true))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .slice(-25);
}
