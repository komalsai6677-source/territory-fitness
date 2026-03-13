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
  TerritoryMode,
  TerritoryTile,
} from '../types';

type RoutePoint = {
  latitude: number;
  longitude: number;
};

type LocalProfile = {
  name: string;
  contact: string;
  city: string;
  avatarKey: string;
  photoUrl?: string;
};

type AppContextValue = {
  authenticated: boolean;
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
  activityMode: TerritoryMode;
  mapMode: 'run' | 'bike';
  login: (payload: LocalProfile) => Promise<void>;
  updateProfile: (payload: LocalProfile) => Promise<void>;
  logout: () => Promise<void>;
  setActivityMode: (mode: TerritoryMode) => void;
  setMapMode: (mode: 'run' | 'bike') => void;
  startSession: () => Promise<void>;
  stopSession: () => void;
  sendGroupMessage: (groupId: string, text: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

const STEP_SPEED_LIMITS: Record<TerritoryMode, number> = {
  walk: 7.5,
  run: 24,
  bike: 0,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<RoutePoint | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [stepEligibleMeters, setStepEligibleMeters] = useState(0);
  const [elevationGainMeters, setElevationGainMeters] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [capturePaused, setCapturePaused] = useState(false);
  const [antiCheatReason, setAntiCheatReason] = useState<string | undefined>(undefined);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [capturedTileIds, setCapturedTileIds] = useState<string[]>([]);
  const [territoryTiles, setTerritoryTiles] = useState<TerritoryTile[]>(seedTerritoryTiles);
  const [sessionHistory, setSessionHistory] = useState<SessionSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUserSummary | null>(null);
  const [localProfile, setLocalProfile] = useState<LocalProfile | null>(null);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [races, setRaces] = useState<RaceSummary[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [serverLeaderboard, setServerLeaderboard] = useState<Array<{ name: string; tiles: number; km: number }>>([]);
  const [serverNearbyRunners, setServerNearbyRunners] = useState<RunnerProfile[]>([]);
  const [activityMode, setActivityMode] = useState<TerritoryMode>('run');
  const [mapMode, setMapMode] = useState<'run' | 'bike'>('run');
  const tokenRef = useRef<string | null>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPointRef = useRef<RoutePoint | null>(null);
  const lastSampleAtRef = useRef<number | null>(null);
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
      profile: localProfile ?? undefined,
      preferredActivityMode: activityMode,
      preferredMapMode: mapMode,
    });
  }, [activityMode, localProfile, mapMode, sessionHistory, territoryTiles]);

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
      steps: Math.max(0, Math.round(stepEligibleMeters / 0.78)),
      calories: Math.max(0, Math.round(distanceKm * (activityMode === 'bike' ? 34 : activityMode === 'walk' ? 44 : 62))),
      elevationGainMeters,
      cadence: stepEligibleMeters > 0 && durationSeconds > 0 ? Math.round((stepEligibleMeters / 0.78 / durationSeconds) * 60) : 0,
      relativeEffort: Math.max(
        0,
        Math.round(distanceKm * (activityMode === 'bike' ? 9 : 12) + capturedTileIds.length * 18 + elevationGainMeters / 6 + durationSeconds / 90)
      ),
      currentSpeedKmh,
      mode: activityMode,
      capturePaused,
      antiCheatReason,
    };
  }, [activityMode, antiCheatReason, capturePaused, capturedTileIds.length, currentSpeedKmh, distanceMeters, durationSeconds, elevationGainMeters, stepEligibleMeters]);

  const leaderboard = useMemo(() => {
    if (serverLeaderboard.length > 0) {
      return serverLeaderboard;
    }

    const youTiles = Math.max(124, metrics.capturedTiles + 124);
    const youKm = Math.max(96, Math.round(metrics.distanceKm + 96));

    return [
      { name: 'Nina', tiles: 182, km: 128 },
      { name: currentUser?.name ?? 'You', tiles: youTiles, km: youKm },
      { name: 'Omar', tiles: 112, km: 83 },
    ].sort((left, right) => right.tiles - left.tiles);
  }, [currentUser?.name, metrics.capturedTiles, metrics.distanceKm, serverLeaderboard]);

  async function login(profile: LocalProfile) {
    setLocalProfile(profile);
    setCurrentUser(createLocalUser(profile));
    setAuthenticated(true);
    await hydrateServerState(profile);
  }

  async function updateProfile(profile: LocalProfile) {
    setLocalProfile(profile);
    setCurrentUser((existing) => (existing ? applyProfileOverlay(existing, profile) : null));
  }

  async function logout() {
    watcherRef.current?.remove();
    watcherRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAuthenticated(false);
    setLocalProfile(null);
    setCurrentUser(null);
    setSessionActive(false);
    setLocationError(null);
    tokenRef.current = null;
    remoteSessionIdRef.current = null;
  }

  async function startSession() {
    if (!authenticated) {
      setLocationError('Create your runner profile first.');
      return;
    }

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
        const remoteSession = await startRemoteSession(tokenRef.current, initialPoint, activityMode);
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
          distanceInterval: activityMode === 'bike' ? 12 : 5,
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

          let flaggedVehicle = false;

          if (lastPointRef.current) {
            const segmentDistance = getDistanceMeters(lastPointRef.current, nextPoint);
            const sampleAt = Date.now();
            const elapsedSeconds = Math.max(1, (sampleAt - (lastSampleAtRef.current ?? sampleAt - 1000)) / 1000);
            const speedKmh = (segmentDistance / elapsedSeconds) * 3.6;
            const estimatedCadence = segmentDistance > 1 ? Math.round((segmentDistance / 0.78 / elapsedSeconds) * 60) : 0;
            flaggedVehicle = activityMode !== 'bike' && speedKmh > 15 && estimatedCadence < 110;

            setCurrentSpeedKmh(Number(speedKmh.toFixed(1)));
            setCapturePaused(flaggedVehicle);
            setAntiCheatReason(flaggedVehicle ? 'Capture paused: speed suggests a vehicle, not a runner.' : undefined);
            if (segmentDistance > 1) {
              setDistanceMeters((value) => value + segmentDistance);
              setElevationGainMeters((value) => value + Math.max(0, Math.round(segmentDistance * 0.012)));
              if (!flaggedVehicle && activityMode !== 'bike' && speedKmh <= STEP_SPEED_LIMITS[activityMode]) {
                setStepEligibleMeters((value) => value + segmentDistance);
              }
            }
          }

          lastPointRef.current = nextPoint;
          lastSampleAtRef.current = Date.now();

          const tileId = getTileId(nextPoint.latitude, nextPoint.longitude);
          setCapturedTileIds((tileIds) => {
            if (flaggedVehicle) {
              return tileIds;
            }
            if (tileIds.includes(tileId)) {
              return tileIds;
            }

            const nextTileIds = [...tileIds, tileId];
            setTerritoryTiles((existingTiles) => mergeTiles(existingTiles, nextTileIds, activityMode));
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
    setStepEligibleMeters(0);
    setElevationGainMeters(0);
    setCurrentSpeedKmh(0);
    setCapturePaused(false);
    setAntiCheatReason(undefined);
    setDurationSeconds(0);
    setCapturedTileIds([getTileId(initialPoint.latitude, initialPoint.longitude)]);
    setTerritoryTiles((existingTiles) => mergeTiles(existingTiles.length ? existingTiles : seedTerritoryTiles, [getTileId(initialPoint.latitude, initialPoint.longitude)], activityMode));
    setCurrentLocation(initialPoint);
    setRoutePoints([initialPoint]);
    lastPointRef.current = initialPoint;
    lastSampleAtRef.current = Date.now();
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
        .then(() => hydrateServerState(localProfile ?? undefined))
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
        setActivityMode(persistedState.preferredActivityMode ?? 'run');
        setMapMode(persistedState.preferredMapMode ?? 'run');
        if (persistedState.profile) {
          setLocalProfile(persistedState.profile);
          setCurrentUser(createLocalUser(persistedState.profile));
          setAuthenticated(true);
        }
      }
    } catch {
      setLocationError('Saved progress could not be loaded.');
    } finally {
      void hydrateServerState();
      hydratedRef.current = true;
    }
  }

  async function hydrateServerState(profileOverride?: LocalProfile) {
    try {
      const auth = await loginDemoUser();
      if (!auth?.token) {
        return;
      }

      tokenRef.current = auth.token;
      const bootstrap = await fetchBootstrap(auth.token);
      const nextProfile = profileOverride ?? localProfile;
      setCurrentUser(nextProfile ? applyProfileOverlay(bootstrap.currentUser, nextProfile) : bootstrap.currentUser);
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
          mode: tile.mode,
          decayLevel: tile.decayLevel,
          bountyXp: tile.bountyXp,
          supplyLine: tile.supplyLine,
          tag: tile.tag,
          ghostName: tile.ghostName,
          ghostPaceLabel: tile.ghostPaceLabel,
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
        authenticated,
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
        activityMode,
        mapMode,
        login,
        updateProfile,
        logout,
        setActivityMode,
        setMapMode,
        startSession,
        stopSession,
        sendGroupMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function applyProfileOverlay(user: CurrentUserSummary, profile: LocalProfile): CurrentUserSummary {
  return {
    ...user,
    name: profile.name,
    contact: profile.contact,
    city: profile.city,
    avatarKey: profile.avatarKey,
    photoUrl: profile.photoUrl,
  };
}

function createLocalUser(profile: LocalProfile): CurrentUserSummary {
  return {
    id: 'local-you',
    email: profile.contact.includes('@') ? profile.contact : 'runner@territory.app',
    name: profile.name,
    bio: 'Local athlete profile',
    status: 'Ready to capture',
    vibe: 'Future runner',
    totalTiles: 0,
    totalDistanceKm: 0,
    followers: 0,
    following: 0,
    points: 0,
    badges: [],
    stickers: [],
    rewards: [],
    wins: 0,
    losses: 0,
    streak: 0,
    contact: profile.contact,
    city: profile.city,
    avatarKey: profile.avatarKey,
    photoUrl: profile.photoUrl,
  };
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppProvider.');
  }

  return context;
}
