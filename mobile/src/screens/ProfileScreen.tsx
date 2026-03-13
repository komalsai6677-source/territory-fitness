import { ScrollView, Text, View } from 'react-native';

import { useAppState } from '../context/AppContext';
import { SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

export function ProfileScreen() {
  const { currentUser, metrics, sessionHistory } = useAppState();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileBanner}>
        <Text style={styles.profileHandle}>@you</Text>
        <Text style={styles.profileName}>{currentUser?.name ?? 'Territory Runner'}</Text>
        <Text style={styles.profileMeta}>
          {(currentUser?.totalTiles ?? 124) + metrics.capturedTiles} tiles | {((currentUser?.totalDistanceKm ?? 96) + metrics.distanceKm).toFixed(1)} km this month | Rank #2 local
        </Text>
      </View>

      <SectionCard title="Rewards">
        {currentUser ? (
          <>
            {currentUser.badges.map((badge) => (
              <Text key={badge} style={styles.itemLine}>{badge}</Text>
            ))}
            {currentUser.stickers.map((sticker) => (
              <Text key={sticker} style={styles.itemLine}>{sticker}</Text>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.itemLine}>Coastal streak badge</Text>
            <Text style={styles.itemLine}>100 tile capture sticker</Text>
            <Text style={styles.itemLine}>Top 3 weekly finisher medal</Text>
          </>
        )}
      </SectionCard>

      <SectionCard title="Current run">
        <Text style={styles.sectionText}>Distance: {metrics.distanceKm.toFixed(2)} km</Text>
        <Text style={styles.sectionText}>Pace: {metrics.paceLabel} min/km</Text>
        <Text style={styles.sectionText}>Fresh captures: {metrics.capturedTiles}</Text>
      </SectionCard>

      <SectionCard title="Career snapshot">
        <Text style={styles.sectionText}>Completed sessions: {sessionHistory.length}</Text>
        <Text style={styles.sectionText}>Followers: {currentUser?.followers ?? 0}</Text>
        <Text style={styles.sectionText}>Following: {currentUser?.following ?? 0}</Text>
        <Text style={styles.sectionText}>Points: {currentUser?.points ?? 0}</Text>
        <Text style={styles.sectionText}>
          Total tracked distance: {sessionHistory.reduce((sum, session) => sum + session.distanceKm, 0).toFixed(1)} km
        </Text>
        <Text style={styles.sectionText}>
          Total captured tiles: {sessionHistory.reduce((sum, session) => sum + session.capturedTiles, 0)}
        </Text>
      </SectionCard>

      <SectionCard title="Season focus">
        <Text style={styles.sectionText}>
          Defend your strongest cluster and push into nearby neutral streets during evening runs.
        </Text>
      </SectionCard>
    </ScrollView>
  );
}
