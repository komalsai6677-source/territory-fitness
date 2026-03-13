export type TabKey = 'home' | 'activity' | 'map' | 'social' | 'profile';

export type RunnerProfile = {
  id: string;
  name: string;
  status: string;
  distanceAwayKm: number;
  vibe: string;
  sharedTiles: number;
};

export type TileOwner = 'you' | 'rival' | 'open';

export type TerritoryTile = {
  id: string;
  center: {
    latitude: number;
    longitude: number;
  };
  owner: TileOwner;
  effortKm?: number;
  contested?: boolean;
  zoneName?: string;
};

export type SessionMetrics = {
  distanceKm: number;
  durationSeconds: number;
  paceLabel: string;
  capturedTiles: number;
  steps: number;
  calories: number;
  elevationGainMeters: number;
  cadence: number;
  relativeEffort: number;
};

export type SessionSummary = {
  id: string;
  finishedAt: string;
  distanceKm: number;
  durationSeconds: number;
  capturedTiles: number;
  averagePaceLabel: string;
};

export type GroupSummary = {
  id: string;
  name: string;
  description: string;
  members: number;
  sampleMembers: string[];
};

export type ChallengeSummary = {
  id: string;
  title: string;
  period: string;
  target: string;
  rewardPoints: number;
  progress: number;
  total: number;
  completed: boolean;
};

export type RaceSummary = {
  id: string;
  title: string;
  type: 'friends' | 'global' | 'tile-rush';
  distanceKm: number;
  status: 'countdown' | 'live' | 'finished';
  startsAt: string;
  entrants: number;
  prize: string;
  city?: string;
};

export type FeedItem = {
  id: string;
  actor: string;
  message: string;
};

export type ChatMessage = {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type CurrentUserSummary = {
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
};
