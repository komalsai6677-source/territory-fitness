import { Pressable, ScrollView, Text, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';

import { useAppState } from '../context/AppContext';
import { getTilePolygon } from '../lib/geo';
import { LegendDot, SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

export function MapScreen() {
  const { currentLocation, mapMode, metrics, nearbyRunners, routePoints, setMapMode, territoryTiles } = useAppState();

  const liveRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }
    : {
        latitude: 18.9388,
        longitude: 72.8364,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      };

  const visibleTiles = territoryTiles.filter((tile) => (tile.mode ?? 'run') === mapMode);
  const contestedTiles = visibleTiles.filter((tile) => tile.contested);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SectionCard title="Territory map">
        <View style={styles.segmentedRow}>
          {(['run', 'bike'] as const).map((mode) => {
            const active = mapMode === mode;

            return (
              <Pressable key={mode} onPress={() => setMapMode(mode)} style={[styles.segmentedButton, active && styles.segmentedButtonActive]}>
                <Text style={[styles.segmentedButtonText, active && styles.segmentedButtonTextActive]}>{mode} territory</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.sectionText}>
          The running grid and bicycle grid are now separate. Rival sectors stay orange, your sectors stay green, and active battlegrounds glow yellow.
        </Text>
        <View style={styles.mapCardLarge}>
          <MapView style={styles.mapSurfaceLarge} region={liveRegion} showsUserLocation={true} followsUserLocation={true}>
            {visibleTiles.map((tile) => (
              <Polygon
                key={`${tile.mode ?? 'run'}:${tile.id}`}
                coordinates={getTilePolygon(tile.id)}
                fillColor={
                  tile.decayLevel && tile.decayLevel > 0.8
                    ? 'rgba(0,0,0,0.92)'
                    : tile.owner === 'you'
                      ? 'rgba(34,197,94,0.36)'
                      : tile.owner === 'rival'
                        ? 'rgba(249,115,22,0.34)'
                        : 'rgba(148,163,184,0.16)'
                }
                strokeColor={
                  tile.contested
                    ? '#facc15'
                    : tile.supplyLine
                      ? '#38bdf8'
                    : tile.owner === 'you'
                      ? '#22c55e'
                      : tile.owner === 'rival'
                        ? '#f97316'
                        : '#94a3b8'
                }
                strokeWidth={tile.contested ? 3 : 1.5}
              />
            ))}

            {contestedTiles.map((tile) => (
              <Marker
                key={`contest-${tile.mode ?? 'run'}-${tile.id}`}
                coordinate={tile.center}
                pinColor="#facc15"
                title={tile.zoneName ?? tile.id}
                description={`${tile.effortKm?.toFixed(1) ?? '0.0'} km to flip`}
              />
            ))}

            {visibleTiles.filter((tile) => tile.ghostName).map((tile) => (
              <Marker
                key={`ghost-${tile.mode ?? 'run'}-${tile.id}`}
                coordinate={{
                  latitude: tile.center.latitude + 0.00012,
                  longitude: tile.center.longitude + 0.00012,
                }}
                pinColor="#8b5cf6"
                title={`Ghost: ${tile.ghostName}`}
                description={`Best split ${tile.ghostPaceLabel ?? '--:--'}`}
              />
            ))}

            {visibleTiles.filter((tile) => tile.tag).map((tile) => (
              <Marker
                key={`tag-${tile.mode ?? 'run'}-${tile.id}`}
                coordinate={{
                  latitude: tile.center.latitude - 0.00012,
                  longitude: tile.center.longitude - 0.00012,
                }}
                pinColor="#14b8a6"
                title={tile.zoneName ?? tile.id}
                description={tile.tag}
              />
            ))}

            {nearbyRunners.slice(0, 4).map((runner, index) => (
              <Marker
                key={runner.id}
                coordinate={{
                  latitude: liveRegion.latitude + 0.0008 * (index + 1),
                  longitude: liveRegion.longitude + 0.0005 * (index % 2 === 0 ? 1 : -1),
                }}
                pinColor="#38bdf8"
                title={runner.name}
                description={`${runner.distanceAwayKm.toFixed(1)} km away`}
              />
            ))}

            {routePoints.length > 1 ? <Polyline coordinates={routePoints} strokeColor="#38bdf8" strokeWidth={4} /> : null}
          </MapView>
        </View>
        <View style={styles.legendRow}>
          <LegendDot color="#22c55e" label="Owned" />
          <LegendDot color="#94a3b8" label="Open" />
          <LegendDot color="#f97316" label="Rival" />
          <LegendDot color="#facc15" label="Battleground" />
          <LegendDot color="#38bdf8" label="Supply line" />
        </View>
      </SectionCard>

      <SectionCard title="Zone status">
        <Text style={styles.itemLine}>Visible {mapMode} sectors: {visibleTiles.length}</Text>
        <Text style={styles.itemLine}>Captured this run: {metrics.capturedTiles} tiles</Text>
        <Text style={styles.itemLine}>Contested sectors: {contestedTiles.length}</Text>
        <Text style={styles.itemLine}>Supply lines: {visibleTiles.filter((tile) => tile.supplyLine).length}</Text>
        <Text style={styles.itemLine}>Bounty sectors: {visibleTiles.filter((tile) => (tile.bountyXp ?? 0) > 0).length}</Text>
        <Text style={styles.itemLine}>Tracked route points: {routePoints.length}</Text>
        <Text style={styles.itemLine}>
          {currentLocation ? 'Map centered around your live GPS position.' : 'Using default city region until GPS is ready.'}
        </Text>
      </SectionCard>
    </ScrollView>
  );
}
