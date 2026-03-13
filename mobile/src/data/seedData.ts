import { RunnerProfile, TerritoryTile } from '../types';

export const seedNearbyRunners: RunnerProfile[] = [
  { id: '1', name: 'Aarav', status: 'Running river loop', distanceAwayKm: 0.8, vibe: 'Fast finisher', sharedTiles: 6 },
  { id: '2', name: 'Mia', status: 'Capturing east blocks', distanceAwayKm: 1.1, vibe: 'Tile hunter', sharedTiles: 9 },
  { id: '3', name: 'Leo', status: 'Night tempo session', distanceAwayKm: 2.4, vibe: 'Consistency monster', sharedTiles: 4 },
];

export const seedTerritoryTiles: TerritoryTile[] = [
  { id: '15781:60696', center: { latitude: 18.9382, longitude: 72.8355 }, owner: 'you', mode: 'run', zoneName: 'Harbour Edge' },
  { id: '15781:60697', center: { latitude: 18.9382, longitude: 72.8367 }, owner: 'you', mode: 'bike', zoneName: 'Fort Circuit' },
  { id: '15782:60696', center: { latitude: 18.9394, longitude: 72.8355 }, owner: 'open', mode: 'run', zoneName: 'Clock Tower Lane' },
  { id: '15782:60697', center: { latitude: 18.9394, longitude: 72.8367 }, owner: 'rival', mode: 'run', zoneName: 'Marine Sprint Gate' },
  { id: '15783:60696', center: { latitude: 18.9406, longitude: 72.8355 }, owner: 'open', mode: 'bike', zoneName: 'Causeway Wheels' },
  { id: '15783:60697', center: { latitude: 18.9406, longitude: 72.8367 }, owner: 'rival', mode: 'bike', zoneName: 'Flyover Wheel Line' },
];
