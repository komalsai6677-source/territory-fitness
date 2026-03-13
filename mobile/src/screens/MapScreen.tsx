import { ScrollView, Text, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';

import { useAppState } from '../context/AppContext';
import { getTilePolygon } from '../lib/geo';
import { LegendDot, SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

export function MapScreen() {
  const { currentLocation, metrics, nearbyRunners, routePoints, territoryTiles } = useAppState();

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

  const contestedTiles = territoryTiles.filter((tile) => tile.contested);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SectionCard title="Territory map">
        <Text style={styles.sectionText}>
          Territory tiles are rendered as claimable zones. Rival sectors stay orange, your sectors stay green, and active battlegrounds glow yellow.
        </Text>
        <View style={styles.mapCardLarge}>
          <MapView style={styles.mapSurfaceLarge} region={liveRegion} showsUserLocation={true} followsUserLocation={true}>
            {territoryTiles.map((tile) => (
              <Polygon
                key={tile.id}
                coordinates={getTilePolygon(tile.id)}
                fillColor={
                  tile.owner === 'you'
                    ? 'rgba(34,197,94,0.32)'
                    : tile.owner === 'rival'
                      ? 'rgba(249,115,22,0.32)'
                      : 'rgba(148,163,184,0.18)'
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
                strokeWidth={tile.contested ? 3 : 1.5}
              />
            ))}

            {contestedTiles.map((tile) => (
              <Marker
                key={`contest-${tile.id}`}
                coordinate={tile.center}
                pinColor="#facc15"
                title={tile.zoneName ?? tile.id}
                description={`${tile.effortKm?.toFixed(1) ?? '0.0'} km to flip`}
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
        </View>
      </SectionCard>

      <SectionCard title="Zone status">
        <Text style={styles.itemLine}>Captured this run: {metrics.capturedTiles} tiles</Text>
        <Text style={styles.itemLine}>Contested sectors: {contestedTiles.length}</Text>
        <Text style={styles.itemLine}>Tracked route points: {routePoints.length}</Text>
        <Text style={styles.itemLine}>
          {currentLocation ? 'Map centered around your live GPS position.' : 'Using default city region until GPS is ready.'}
        </Text>
      </SectionCard>
    </ScrollView>
  );
}
