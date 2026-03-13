import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAppState } from '../context/AppContext';
import { BigMetric, SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

export function ActivityScreen() {
  const {
    activityMode,
    currentLocation,
    currentUser,
    isLocating,
    locationError,
    metrics,
    permissionGranted,
    permissionRequested,
    races,
    sessionActive,
    setActivityMode,
    startSession,
    stopSession,
  } = useAppState();

  const minutes = Math.floor(metrics.durationSeconds / 60);
  const seconds = metrics.durationSeconds % 60;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.trainingHero}>
        <Text style={styles.eyebrow}>{sessionActive ? 'Session Live' : 'Session Ready'}</Text>
        <Text style={styles.sectionHeadline}>Start a live capture run</Text>
        <Text style={styles.sectionText}>
          Every mode behaves differently. Walk counts only at human pace, run owns the street grid, and bike competes on a separate territory layer.
        </Text>
      </View>

      <SectionCard title="Movement mode">
        <View style={styles.segmentedRow}>
          {(['walk', 'run', 'bike'] as const).map((mode) => {
            const active = activityMode === mode;

            return (
              <Pressable key={mode} onPress={() => setActivityMode(mode)} style={[styles.segmentedButton, active && styles.segmentedButtonActive]}>
                <Text style={[styles.segmentedButtonText, active && styles.segmentedButtonTextActive]}>{mode}</Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <View style={styles.metricGrid}>
        <BigMetric title="Distance" value={`${metrics.distanceKm.toFixed(2)} km`} />
        <BigMetric title="Pace" value={metrics.paceLabel} />
        <BigMetric title="Time" value={`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`} />
        <BigMetric title="Tiles" value={String(metrics.capturedTiles)} />
        <BigMetric title="Steps" value={String(metrics.steps)} />
        <BigMetric title="Calories" value={`${metrics.calories} kcal`} />
        <BigMetric title="Elevation" value={`${metrics.elevationGainMeters} m`} />
        <BigMetric title="Cadence" value={`${metrics.cadence} spm`} />
      </View>

      <SectionCard title="Tracking status">
        <View style={[styles.statusPill, sessionActive && styles.statusPillWarm]}>
          <Text style={styles.statusPillText}>
            {isLocating ? 'Finding location...' : sessionActive ? 'GPS tracking active' : 'Session stopped'}
          </Text>
        </View>
        <Text style={styles.sectionText}>
          {currentLocation
            ? `Current location: ${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}`
            : 'No location fix yet.'}
        </Text>
        <Text style={styles.sectionSubtle}>
          {permissionGranted
            ? 'Foreground location permission granted.'
            : permissionRequested
              ? 'Permission requested but not granted yet.'
              : 'Permission will be requested when you start the session.'}
        </Text>
        <Text style={styles.sectionSubtle}>Current speed: {metrics.currentSpeedKmh.toFixed(1)} km/h</Text>
        <Text style={styles.sectionSubtle}>
          {metrics.capturePaused ? metrics.antiCheatReason ?? 'Capture paused.' : 'Capture engine is active.'}
        </Text>
        <Text style={styles.sectionSubtle}>
          {activityMode === 'walk'
            ? 'Walk steps stop counting if speed gets too high.'
            : activityMode === 'bike'
              ? 'Bike mode tracks territory and speed, not walking steps.'
              : 'Run mode keeps step count active while pace stays realistic.'}
        </Text>
        {locationError ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoRowText}>{locationError}</Text>
          </View>
        ) : null}
      </SectionCard>

      <SectionCard title="Performance model">
        <Text style={styles.itemLine}>Relative effort: {metrics.relativeEffort} XP</Text>
        <Text style={styles.itemLine}>Session streak: {currentUser?.streak ?? 0} wins</Text>
        <Text style={styles.itemLine}>Record: {currentUser?.wins ?? 0} W / {currentUser?.losses ?? 0} L</Text>
      </SectionCard>

      <SectionCard title="Race modes">
        {races.slice(0, 3).map((race) => (
          <View key={race.id} style={styles.focusTileCard}>
            <View style={styles.runnerInfo}>
              <Text style={styles.runnerName}>{race.title}</Text>
              <Text style={styles.runnerMeta}>
                {race.distanceKm} km | {race.entrants} entrants | {race.prize}
              </Text>
            </View>
            <View style={styles.vibeTag}>
              <Text style={styles.vibeTagText}>{race.status}</Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Workout modes">
        <Text style={styles.itemLine}>Free run</Text>
        <Text style={styles.itemLine}>Territory attack</Text>
        <Text style={styles.itemLine}>Race with friend</Text>
        <Text style={styles.itemLine}>Global sprint lobby</Text>
        <Text style={styles.itemLine}>Tile rush battleground</Text>
      </SectionCard>

      {sessionActive ? (
        <Pressable onPress={stopSession} style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Stop session</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => void startSession()} style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>{isLocating ? 'Starting...' : 'Start session'}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
