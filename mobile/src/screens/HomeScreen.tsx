import { ScrollView, Text, View } from 'react-native';

import { useAppState } from '../context/AppContext';
import { MetricCard, SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

export function HomeScreen() {
  const { challenges, feed, leaderboard, metrics, nearbyRunners, sessionActive, sessionHistory } = useAppState();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroPanel}>
        <Text style={styles.eyebrow}>Live Season</Text>
        <Text style={styles.heroTitle}>Mumbai South Sprint League</Text>
        <Text style={styles.heroCopy}>
          Capture tiles while you run, see nearby athletes, and defend your area before rivals take it back.
        </Text>
        <View style={styles.heroStatsRow}>
          <MetricCard label="Tiles owned" value={String(124 + metrics.capturedTiles)} accent="amber" />
          <MetricCard label="Run distance" value={`${metrics.distanceKm.toFixed(2)} km`} accent="blue" />
          <MetricCard label="Session" value={sessionActive ? 'Live now' : 'Ready'} accent="mint" />
        </View>
      </View>

      <SectionCard title="Today">
        <Text style={styles.sectionText}>Best route suggestion: 5.2 km coastal tempo with 18 uncaptured tiles on path.</Text>
        <Text style={styles.sectionSubtle}>
          {sessionActive ? `Live pace ${metrics.paceLabel} min/km • ${metrics.capturedTiles} fresh tiles` : 'Prime capture window: 6:00 PM to 7:30 PM'}
        </Text>
      </SectionCard>

      <SectionCard title="Nearby Heat">
        {nearbyRunners.map((runner) => (
          <View key={runner.id} style={styles.runnerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{runner.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.runnerInfo}>
              <Text style={styles.runnerName}>{runner.name}</Text>
              <Text style={styles.runnerMeta}>{runner.status} | {runner.distanceAwayKm.toFixed(1)} km away</Text>
            </View>
            <View style={styles.vibeTag}>
              <Text style={styles.vibeTagText}>{runner.vibe}</Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Local leaderboard">
        {leaderboard.map((entry, index) => (
          <View key={entry.name} style={styles.boardRow}>
            <Text style={styles.boardRank}>#{index + 1}</Text>
            <Text style={styles.boardName}>{entry.name}</Text>
            <Text style={styles.boardValue}>{entry.tiles} tiles</Text>
            <Text style={styles.boardValueMuted}>{entry.km} km</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Recent sessions">
        {sessionHistory.length === 0 ? (
          <Text style={styles.sectionSubtle}>Finish your first tracked run to build history.</Text>
        ) : (
          sessionHistory.slice(0, 3).map((session) => (
            <View key={session.id} style={styles.boardRow}>
              <Text style={styles.boardRank}>{session.capturedTiles}</Text>
              <Text style={styles.boardName}>{session.distanceKm.toFixed(2)} km</Text>
              <Text style={styles.boardValue}>{session.averagePaceLabel} pace</Text>
              <Text style={styles.boardValueMuted}>{Math.round(session.durationSeconds / 60)}m</Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Live challenges">
        {challenges.length === 0 ? (
          <Text style={styles.sectionSubtle}>Challenges will appear after backend sync.</Text>
        ) : (
          challenges.slice(0, 3).map((challenge) => (
            <View key={challenge.id} style={styles.infoRow}>
              <Text style={styles.runnerName}>{challenge.title}</Text>
              <Text style={styles.infoRowText}>
                {challenge.period} • {challenge.target} • {challenge.progress}/{challenge.total}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Community feed">
        {feed.length === 0 ? (
          <Text style={styles.sectionSubtle}>Feed activity will appear after backend sync.</Text>
        ) : (
          feed.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.infoRow}>
              <Text style={styles.runnerName}>{item.actor}</Text>
              <Text style={styles.infoRowText}>{item.message}</Text>
            </View>
          ))
        )}
      </SectionCard>
    </ScrollView>
  );
}
