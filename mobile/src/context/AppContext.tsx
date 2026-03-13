import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { seedNearbyRunners, seedTerritoryTiles } from '../data/seedData';
import {
  fetchBootstrap,
  loginDemoUser,
  sendChatMessage,
  sendRemoteLocation,
  startRemoteSession,
  stopRemoteSession,
} from '../lib/api';
import { formatPace, getDistanceMeters, getTileId, mergeTiles } from '../lib/geo';
import { loadPersistedState, savePersistedState } from '../lib/storage';
import {
  ChatMessage,
  ChallengeSummary,
  CurrentUserSummary,
  FeedItem,
  GroupSummary,
  RaceSummary,
  RunnerProfile,
  SessionMetrics,
  SessionSummary,
  TerritoryTile,
} from '../types';

type RoutePoint = {
  latitude: number;
  longitude: number;
};

type AppContextValue = {
  permissionGranted: boolean;
  permissionRequested: boolean;
  sessionActive: boolean;
  isLocating: boolean;
  locationError: string | null;
  currentLocation: RoutePoint | null;
  routePoints: RoutePoint[];
  territoryTiles: TerritoryTile[];
  sessionHistory: SessionSummary[];
  currentUser: CurrentUserSummary | null;
  groups: GroupSummary[];
  challenges: ChallengeSummary[];
  races: RaceSummary[];
  feed: FeedItem[];
  chatMessages: ChatMessage[];
  nearbyRunners: RunnerProfile[];
  leaderboard: Array<{ name: string; tiles: number; km: number }>;
  metrics: SessionMetrics;
  startSession: () => Promise<void>;
  stopSession: () => void;
  sendGroupMessage: (groupId: string, text: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<RoutePoint | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [capturedTileIds, setCapturedTileIds] = useState<string[]>([]);
  const [territoryTiles, setTerritoryTiles] = useState<TerritoryTile[]>(seedTerritoryTiles);
  const [sessionHistory, setSessionHistory] = useState<SessionSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUserSummary | null>(null);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [races, setRaces] = useState<RaceSummary[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [serverLeaderboard, setServerLeaderboard] = useState<Array<{ name: string; tiles: number; km: number }>>([]);
  const [serverNearbyRunners, setServerNearbyRunners] = useState<RunnerProfile[]>([]);
  const tokenRef = useRef<string | null>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPointRef = useRef<RoutePoint | null>(null);
  const remoteSessionIdRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    void hydratePersistedState();

    return () => {
      watcherRef.current?.remove();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    void savePersistedState({
      sessions: sessionHistory,
      territoryTiles,
    });
  }, [sessionHistory, territoryTiles]);

  const nearbyRunners = useMemo(() => {
    const source = serverNearbyRunners.length > 0 ? serverNearbyRunners : seedNearbyRunners;
    const bonus = sessionActive ? 0.2 : 0;

    return source.map((runner) => ({
      ...runner,
      distanceAwayKm: Math.max(0.2, Number((runner.distanceAwayKm - bonus).toFixed(1))),
    }));
  }, [serverNearbyRunners, sessionActive]);

  const metrics = useMemo<SessionMetrics>(() => {
    const distanceKm = distanceMeters / 1000;

    return {
      distanceKm,
      durationSeconds,
      paceLabel: formatPace(distanceKm, durationSeconds),
      capturedTiles: capturedTileIds.length,
      steps: Math.max(0, Math.round(distanceMeters / 0.78)),
      calories: Math.max(0, Math.round(distanceKm * 62)),
      elevationGainMeters: Math.max(0, Math.round(routePoints.length * 0.9)),
      cadence: distanceMeters > 0 && durationSeconds > 0 ? Math.round((distanceMeters / 0.78 / durationSeconds) * 60) : 0,
      relativeEffort: Math.max(0, Math.round(distanceKm * 12 + capturedTileIds.length * 18 + durationSeconds / 90)),
    };
  }, [capturedTileIds.length, distanceMeters, durationSeconds, routePoints.length]);

  const leaderboard = useMemo(() => {
    if (serverLeaderboard.length > 0) {
      return serverLeaderboard;
    }

    const youTiles = Math.max(124, metrics.capturedTiles + 124);
    const youKm = Math.max(96, Math.round(metrics.distanceKm + 96));

    return [
      { name: 'Nina', tiles: 182, km: 128 },
      { name: 'You', tiles: youTiles, km: youKm },
      { name: 'Omar', tiles: 112, km: 83 },
    ].sort((left, right) => right.tiles - left.tiles);
  }, [metrics.capturedTiles, metrics.distanceKm, serverLeaderboard]);

  async function startSession() {
    setIsLocating(true);
    setLocationError(null);
    setPermissionRequested(true);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationError('Turn on device location services to start tracking.');
        setIsLocating(false);
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      const granted = permission.status === 'granted';
      setPermissionGranted(granted);

      if (!granted) {
        setLocationError('Location permission was denied.');
        setIsLocating(false);
        return;
      }

      const initialPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const initialPoint = {
        latitude: initialPosition.coords.latitude,
        longitude: initialPosition.coords.longitude,
      };

      resetSession(initialPoint);
      if (tokenRef.current) {
        const remoteSession = await startRemoteSession(tokenRef.current, initialPoint);
        remoteSessionIdRef.current = remoteSession.id;
      }
      setSessionActive(true);
      setIsLocating(false);

      timerRef.current = setInterval(() => {
        setDurationSeconds((value) => value + 1);
      }, 1000);

      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5,
          timeInterval: 3000,
          mayShowUserSettingsDialog: true,
        },
        (position) => {
          const nextPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setCurrentLocation(nextPoint);
          setRoutePoints((points) => [...points, nextPoint]);

          if (lastPointRef.current) {
            const segmentDistance = getDistanceMeters(lastPointRef.current, nextPoint);
            if (segmentDistance > 1) {
              setDistanceMeters((value) => value + segmentDistance);
            }
          }

          lastPointRef.current = nextPoint;

          const tileId = getTileId(nextPoint.latitude, nextPoint.longitude);
          setCapturedTileIds((tileIds) => {
            if (tileIds.includes(tileId)) {
              return tileIds;
            }

            const nextTileIds = [...tileIds, tileId];
            setTerritoryTiles((existingTiles) => mergeTiles(existingTiles, nextTileIds));
            return nextTileIds;
          });

          if (tokenRef.current && remoteSessionIdRef.current) {
            void sendRemoteLocation(tokenRef.current, remoteSessionIdRef.current, {
              latitude: nextPoint.latitude,
              longitude: nextPoint.longitude,
              timestamp: Date.now(),
              accuracyMeters: position.coords.accuracy ?? undefined,
            }).catch(() => {
              setLocationError('Backend location sync failed. Local tracking is still active.');
            });
          }
        }
      );
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Unable to start tracking.');
      setIsLocating(false);
      stopSession();
    }
  }

  function resetSession(initialPoint: RoutePoint) {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    watcherRef.current?.remove();
    watcherRef.current = null;
    setDistanceMeters(0);
    setDurationSeconds(0);
    setCapturedTileIds([getTileId(initialPoint.latitude, initialPoint.longitude)]);
    setTerritoryTiles(mergeTiles(seedTerritoryTiles, [getTileId(initialPoint.latitude, initialPoint.longitude)]));
    setCurrentLocation(initialPoint);
    setRoutePoints([initialPoint]);
    lastPointRef.current = initialPoint;
  }

  function stopSession() {
    watcherRef.current?.remove();
    watcherRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (sessionActive && (distanceMeters > 25 || capturedTileIds.length > 1)) {
      const summary: SessionSummary = {
        id: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        distanceKm: Number((distanceMeters / 1000).toFixed(2)),
        durationSeconds,
        capturedTiles: capturedTileIds.length,
        averagePaceLabel: formatPace(distanceMeters / 1000, durationSeconds),
      };

      setSessionHistory((sessions) => [summary, ...sessions].slice(0, 12));
    }

    if (tokenRef.current && remoteSessionIdRef.current) {
      const currentSessionId = remoteSessionIdRef.current;
      remoteSessionIdRef.current = null;
      void stopRemoteSession(tokenRef.current, currentSessionId)
        .then(() => hydrateServerState())
        .catch(() => {
          setLocationError('Remote session stop failed.');
        });
    }

    setSessionActive(false);
    setIsLocating(false);
  }

  async function hydratePersistedState() {
    try {
      const persistedState = await loadPersistedState();
      if (persistedState) {
        setSessionHistory(persistedState.sessions ?? []);
        setTerritoryTiles(persistedState.territoryTiles?.length ? persistedState.territoryTiles : seedTerritoryTiles);
      }
    } catch {
      setLocationError('Saved progress could not be loaded.');
    } finally {
      void hydrateServerState();
      hydratedRef.current = true;
    }
  }

  async function hydrateServerState() {
    try {
      const auth = await loginDemoUser();
      if (!auth?.token) {
        return;
      }

      tokenRef.current = auth.token;
      const bootstrap = await fetchBootstrap(auth.token);
      setCurrentUser(bootstrap.currentUser);
      setGroups(bootstrap.groups);
      setChallenges(bootstrap.challenges);
      setRaces(bootstrap.races);
      setFeed(bootstrap.feed);
      setChatMessages(bootstrap.chatMessages);
      setTerritoryTiles(
        bootstrap.territory.map((tile) => ({
          id: tile.id,
          center: tile.center,
          owner: tile.owner === 'open' || tile.owner === 'you' || tile.owner === 'rival' ? tile.owner : 'rival',
          effortKm: tile.effortKm,
          contested: tile.contested,
          zoneName: tile.zoneName,
        }))
      );
      setServerLeaderboard(bootstrap.leaderboard.map((entry) => ({ name: entry.name, tiles: entry.tiles, km: entry.km })));
      setServerNearbyRunners(
        bootstrap.nearby.map((runner) => ({
          id: runner.id,
          name: runner.name,
          status: runner.status,
          distanceAwayKm: runner.distanceAwayKm,
          vibe: runner.vibe,
          sharedTiles: Math.max(1, Math.round((runner.points ?? 0) / 400)),
        }))
      );
    } catch {
      // Ignore backend bootstrap errors and keep local fallback data.
    }
  }

  async function sendGroupMessage(groupId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed || !tokenRef.current) {
      return;
    }

    const message = await sendChatMessage(tokenRef.current, groupId, trimmed);
    setChatMessages((current) => [...current, message].slice(-30));
  }

  return (
    <AppContext.Provider
      value={{
        permissionGranted,
        permissionRequested,
        sessionActive,
        isLocating,
        locationError,
        currentLocation,
        routePoints,
        territoryTiles,
        sessionHistory,
        currentUser,
        groups,
        challenges,
        races,
        feed,
        chatMessages,
        nearbyRunners,
        leaderboard,
        metrics,
        startSession,
        stopSession,
        sendGroupMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppProvider.');
  }

  return context;
}
