import { ScrollView, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { useAppState } from '../context/AppContext';
import { LegendDot, SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

export function MapScreen() {
  const { currentLocation, metrics, routePoints, territoryTiles } = useAppState();

  const initialRegion = currentLocation
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SectionCard title="Territory map">
        <Text style={styles.sectionText}>
          Live territory view with your route, current position, and captured tile clusters.
        </Text>
        <View style={styles.mapCard}>
          <MapView style={styles.mapSurface} initialRegion={initialRegion} showsUserLocation={true}>
            {territoryTiles.map((tile) => (
              <Marker
                key={tile.id}
                coordinate={tile.center}
                pinColor={tile.owner === 'you' ? '#22c55e' : tile.owner === 'rival' ? '#f97316' : '#94a3b8'}
                title={tile.owner === 'you' ? 'Captured tile' : tile.owner === 'rival' ? 'Rival tile' : 'Open tile'}
                description={tile.id}
              />
            ))}
            {routePoints.length > 1 ? (
              <Polyline coordinates={routePoints} strokeColor="#38bdf8" strokeWidth={4} />
            ) : null}
          </MapView>
        </View>
        <View style={styles.legendRow}>
          <LegendDot color="#22c55e" label="Yours" />
          <LegendDot color="#94a3b8" label="Open" />
          <LegendDot color="#f97316" label="Rival" />
        </View>
      </SectionCard>

      <SectionCard title="Zone status">
        <Text style={styles.itemLine}>Captured this run: {metrics.capturedTiles} tiles</Text>
        <Text style={styles.itemLine}>Tracked route points: {routePoints.length}</Text>
        <Text style={styles.itemLine}>{currentLocation ? 'Map centered around live GPS location' : 'Using default city region until GPS is ready'}</Text>
      </SectionCard>
    </ScrollView>
  );
}
