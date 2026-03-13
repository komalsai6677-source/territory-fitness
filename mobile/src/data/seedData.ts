import { RunnerProfile, TerritoryTile } from '../types';

export const seedNearbyRunners: RunnerProfile[] = [
  { id: '1', name: 'Aarav', status: 'Running river loop', distanceAwayKm: 0.8, vibe: 'Fast finisher', sharedTiles: 6 },
  { id: '2', name: 'Mia', status: 'Capturing east blocks', distanceAwayKm: 1.1, vibe: 'Tile hunter', sharedTiles: 9 },
  { id: '3', name: 'Leo', status: 'Night tempo session', distanceAwayKm: 2.4, vibe: 'Consistency monster', sharedTiles: 4 },
];

export const seedTerritoryTiles: TerritoryTile[] = [
  { id: 'seed-1', center: { latitude: 18.9382, longitude: 72.8355 }, owner: 'you' },
  { id: 'seed-2', center: { latitude: 18.9382, longitude: 72.8367 }, owner: 'you' },
  { id: 'seed-3', center: { latitude: 18.9394, longitude: 72.8355 }, owner: 'open' },
  { id: 'seed-4', center: { latitude: 18.9394, longitude: 72.8367 }, owner: 'rival' },
  { id: 'seed-5', center: { latitude: 18.9406, longitude: 72.8355 }, owner: 'open' },
  { id: 'seed-6', center: { latitude: 18.9406, longitude: 72.8367 }, owner: 'rival' },
];
