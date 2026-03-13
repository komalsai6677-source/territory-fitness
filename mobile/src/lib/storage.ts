import AsyncStorage from '@react-native-async-storage/async-storage';

import { SessionSummary, TerritoryMode, TerritoryTile } from '../types';

const STORAGE_KEY = 'territory-fitness-state';

export type PersistedState = {
  sessions: SessionSummary[];
  territoryTiles: TerritoryTile[];
  profile?: {
    name: string;
    contact: string;
    city: string;
    avatarKey: string;
    photoUrl?: string;
  };
  preferredActivityMode?: TerritoryMode;
  preferredMapMode?: Extract<TerritoryMode, 'run' | 'bike'>;
};

export async function loadPersistedState() {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as PersistedState;
}

export async function savePersistedState(value: PersistedState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
