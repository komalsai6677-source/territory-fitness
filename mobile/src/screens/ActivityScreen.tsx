import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAppState } from '../context/AppContext';
import { BigMetric, SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

export function ActivityScreen() {
  const {
    currentLocation,
    isLocating,
    locationError,
    metrics,
    permissionGranted,
    permissionRequested,
    sessionActive,
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
          Your run should feel clean and competitive: timer, pace, route, captured tiles, and nearby rivals.
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <BigMetric title="Distance" value={`${metrics.distanceKm.toFixed(2)} km`} />
        <BigMetric title="Pace" value={metrics.paceLabel} />
        <BigMetric title="Time" value={`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`} />
        <BigMetric title="Tiles" value={String(metrics.capturedTiles)} />
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
        {locationError ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoRowText}>{locationError}</Text>
          </View>
        ) : null}
      </SectionCard>

      <SectionCard title="Workout modes">
        <Text style={styles.itemLine}>Free run</Text>
        <Text style={styles.itemLine}>Territory attack</Text>
        <Text style={styles.itemLine}>Recovery walk</Text>
        <Text style={styles.itemLine}>Group challenge</Text>
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
