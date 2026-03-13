import { ScrollView, Text, View } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

import { useAppState } from '../context/AppContext';
import { getTilePolygon } from '../lib/geo';
import { MetricCard, SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

function formatRaceTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function HomeScreen() {
  const {
    challenges,
    currentLocation,
    currentUser,
    feed,
    leaderboard,
    metrics,
    nearbyRunners,
    races,
    sessionActive,
    territoryTiles,
  } = useAppState();

  const liveRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }
    : {
        latitude: 18.9388,
        longitude: 72.8364,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      };

  const battlegroundTiles = territoryTiles
    .filter((tile) => tile.owner === 'rival' || tile.contested)
    .sort((left, right) => Number(right.effortKm ?? 0) - Number(left.effortKm ?? 0))
    .slice(0, 3);

  const liveRace = races.find((race) => race.status === 'live') ?? races[0];
  const userTileTotal = (currentUser?.totalTiles ?? 124) + metrics.capturedTiles;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroPanel}>
        <Text style={styles.eyebrow}>Strategy View</Text>
        <Text style={styles.heroTitle}>Own the city before the city moves.</Text>
        <Text style={styles.heroCopy}>
          Live location, battleground tiles, and race pressure now sit on the same surface so you can decide whether to defend, attack, or sprint.
        </Text>
        <View style={styles.heroStatsRow}>
          <MetricCard label="Territory" value={`${userTileTotal} tiles`} accent="amber" />
          <MetricCard label="Relative effort" value={`${metrics.relativeEffort} xp`} accent="blue" />
          <MetricCard label="Streak" value={`${currentUser?.streak ?? 0} wins`} accent="mint" />
        </View>
      </View>

      <SectionCard title="Live strategy map">
        <Text style={styles.sectionText}>
          {currentLocation
            ? `Current location ${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}`
            : 'Waiting for a GPS fix. Start a session to lock onto your live position.'}
        </Text>
        <View style={styles.mapCard}>
          <MapView style={styles.mapSurface} region={liveRegion} showsUserLocation={true} followsUserLocation={true}>
            {territoryTiles.slice(-16).map((tile) => (
              <Polygon
                key={tile.id}
                coordinates={getTilePolygon(tile.id)}
                fillColor={
                  tile.owner === 'you'
                    ? 'rgba(34,197,94,0.35)'
                    : tile.owner === 'rival'
                      ? 'rgba(249,115,22,0.35)'
                      : 'rgba(148,163,184,0.22)'
                }
                strokeColor={
                  tile.contested
                    ? '#facc15'
                    : tile.owner === 'you'
                      ? '#22c55e'
                      : tile.owner === 'rival'
                        ? '#f97316'
                        : '#94a3b8'
                }
                strokeWidth={tile.contested ? 2.5 : 1.5}
              />
            ))}
            {battlegroundTiles.map((tile) => (
              <Marker
                key={`target-${tile.id}`}
                coordinate={tile.center}
                pinColor="#f97316"
                title={tile.zoneName ?? tile.id}
                description={`${tile.effortKm ?? 0} km to flip`}
              />
            ))}
          </MapView>
        </View>
        <View style={styles.inlineStatRow}>
          <Text style={styles.sectionSubtle}>{sessionActive ? `Live pace ${metrics.paceLabel} min/km` : 'No live run yet'}</Text>
          <Text style={styles.sectionSubtle}>{metrics.capturedTiles} fresh tiles</Text>
        </View>
      </SectionCard>

      <SectionCard title="High-value targets">
        {battlegroundTiles.length === 0 ? (
          <Text style={styles.sectionSubtle}>Rival battlegrounds will appear here after backend sync.</Text>
        ) : (
          battlegroundTiles.map((tile) => (
            <View key={tile.id} style={styles.focusTileCard}>
              <View style={styles.runnerInfo}>
                <Text style={styles.runnerName}>{tile.zoneName ?? tile.id}</Text>
                <Text style={styles.runnerMeta}>
                  {tile.contested ? 'Under attack now' : 'Rival stronghold'} | {tile.effortKm?.toFixed(1) ?? '0.0'} km to beat
                </Text>
              </View>
              <View style={[styles.vibeTag, tile.contested && styles.alertTag]}>
                <Text style={styles.vibeTagText}>{tile.contested ? 'Hot' : 'Target'}</Text>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Race lobby">
        {liveRace ? (
          <>
            <View style={styles.focusTileCard}>
              <View style={styles.runnerInfo}>
                <Text style={styles.runnerName}>{liveRace.title}</Text>
                <Text style={styles.runnerMeta}>
                  {liveRace.distanceKm} km | {liveRace.entrants} runners | {liveRace.city ?? 'City league'}
                </Text>
              </View>
              <View style={styles.vibeTag}>
                <Text style={styles.vibeTagText}>{liveRace.status === 'live' ? 'Live' : formatRaceTime(liveRace.startsAt)}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtle}>{liveRace.prize}</Text>
          </>
        ) : (
          <Text style={styles.sectionSubtle}>Race matchmaking loads after backend sync.</Text>
        )}
      </SectionCard>

      <SectionCard title="Nearby pressure">
        {nearbyRunners.slice(0, 3).map((runner) => (
          <View key={runner.id} style={styles.runnerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{runner.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.runnerInfo}>
              <Text style={styles.runnerName}>{runner.name}</Text>
              <Text style={styles.runnerMeta}>
                {runner.status} | {runner.distanceAwayKm.toFixed(1)} km away
              </Text>
            </View>
            <View style={styles.vibeTag}>
              <Text style={styles.vibeTagText}>{runner.vibe}</Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="League ladder">
        {leaderboard.slice(0, 4).map((entry, index) => (
          <View key={entry.name} style={styles.boardRow}>
            <Text style={styles.boardRank}>#{index + 1}</Text>
            <Text style={styles.boardName}>{entry.name}</Text>
            <Text style={styles.boardValue}>{entry.tiles} tiles</Text>
            <Text style={styles.boardValueMuted}>{entry.km} km</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Live challenges">
        {challenges.slice(0, 3).map((challenge) => (
          <View key={challenge.id} style={styles.infoRow}>
            <Text style={styles.runnerName}>{challenge.title}</Text>
            <Text style={styles.infoRowText}>
              {challenge.period} | {challenge.target} | {challenge.progress}/{challenge.total}
            </Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Activity feed">
        {feed.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.infoRow}>
            <Text style={styles.runnerName}>{item.actor}</Text>
            <Text style={styles.infoRowText}>{item.message}</Text>
          </View>
        ))}
      </SectionCard>
    </ScrollView>
  );
}
