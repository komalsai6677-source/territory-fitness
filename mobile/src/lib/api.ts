import { TerritoryMode } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://territory-fitness-api-2.onrender.com';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export async function loginDemoUser() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'you@example.com',
      password: 'demo-pass',
    }),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as { token: string };
}

export async function fetchBootstrap(token: string) {
  const response = await fetch(`${API_BASE_URL}/bootstrap`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Bootstrap request failed.');
  }

  return (await response.json()) as {
    currentUser: {
      id: string;
      email: string;
      name: string;
      bio: string;
      status: string;
      vibe: string;
      totalTiles: number;
      totalDistanceKm: number;
      followers: number;
      following: number;
      points: number;
      badges: string[];
      stickers: string[];
      rewards: string[];
      wins: number;
      losses: number;
      streak: number;
      contact?: string;
      city?: string;
      avatarKey?: string;
      photoUrl?: string;
    };
    nearby: Array<{
      id: string;
      name: string;
      status: string;
      distanceAwayKm: number;
      vibe: string;
      points?: number;
    }>;
    leaderboard: Array<{
      id: string;
      name: string;
      tiles: number;
      km: number;
    }>;
    groups: Array<{
      id: string;
      name: string;
      description: string;
      members: number;
      sampleMembers: string[];
    }>;
    challenges: Array<{
      id: string;
      title: string;
      period: string;
      target: string;
      rewardPoints: number;
      progress: number;
      total: number;
      completed: boolean;
    }>;
    races: Array<{
      id: string;
      title: string;
      type: 'friends' | 'global' | 'tile-rush';
      distanceKm: number;
      status: 'countdown' | 'live' | 'finished';
      startsAt: string;
      entrants: number;
      prize: string;
      city?: string;
    }>;
    feed: Array<{
      id: string;
      actor: string;
      message: string;
    }>;
    chatMessages: Array<{
      id: string;
      groupId: string;
      authorId: string;
      authorName: string;
      text: string;
      createdAt: string;
    }>;
    territory: Array<{
      id: string;
      owner: string;
      center: {
        latitude: number;
        longitude: number;
      };
      effortKm?: number;
      contested?: boolean;
      zoneName?: string;
      mode?: 'walk' | 'run' | 'bike';
      decayLevel?: number;
      bountyXp?: number;
      supplyLine?: boolean;
      tag?: string;
      ghostName?: string;
      ghostPaceLabel?: string;
    }>;
  };
}

export async function sendChatMessage(token: string, groupId: string, text: string) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ groupId, text }),
  });

  if (!response.ok) {
    throw new Error('Chat send failed.');
  }

  return (await response.json()) as {
    id: string;
    groupId: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
  };
}

export async function startRemoteSession(token: string, location: Coordinates, mode: TerritoryMode) {
  const response = await fetch(`${API_BASE_URL}/sessions/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location, mode }),
  });

  if (!response.ok) {
    throw new Error('Remote session start failed.');
  }

  return (await response.json()) as { id: string };
}

export async function sendRemoteLocation(
  token: string,
  sessionId: string,
  payload: Coordinates & { timestamp: number; accuracyMeters?: number }
) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/location`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Remote location sync failed.');
  }

  return await response.json();
}

export async function stopRemoteSession(token: string, sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/stop`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Remote session stop failed.');
  }

  return await response.json();
}
