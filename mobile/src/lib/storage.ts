import AsyncStorage from '@react-native-async-storage/async-storage';

import { SessionSummary, TerritoryTile } from '../types';

const STORAGE_KEY = 'territory-fitness-state';

export type PersistedState = {
  sessions: SessionSummary[];
  territoryTiles: TerritoryTile[];
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
