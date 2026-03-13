import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useAppState } from '../context/AppContext';
import { SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

const avatarPalette: Record<string, string> = {
  ember: '#f97316',
  ocean: '#0ea5e9',
  storm: '#64748b',
  neon: '#22c55e',
};

export function ProfileScreen() {
  const { currentUser, metrics, sessionHistory, updateProfile } = useAppState();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [contact, setContact] = useState(currentUser?.contact ?? '');
  const [city, setCity] = useState(currentUser?.city ?? '');
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl ?? '');

  useEffect(() => {
    setName(currentUser?.name ?? '');
    setContact(currentUser?.contact ?? '');
    setCity(currentUser?.city ?? '');
    setPhotoUrl(currentUser?.photoUrl ?? '');
  }, [currentUser?.city, currentUser?.contact, currentUser?.name, currentUser?.photoUrl]);

  const avatarColor = avatarPalette[currentUser?.avatarKey ?? 'ember'] ?? '#f97316';

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileBanner}>
        {currentUser?.photoUrl ? (
          <Image source={{ uri: currentUser.photoUrl }} style={styles.profilePhoto} />
        ) : (
          <View style={[styles.profileAvatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.profileAvatarText}>{currentUser?.name?.slice(0, 1) ?? 'T'}</Text>
          </View>
        )}
        <View style={styles.profileBannerBody}>
          <Text style={styles.profileHandle}>@you</Text>
          <Text style={styles.profileName}>{currentUser?.name ?? 'Territory Runner'}</Text>
          <Text style={styles.profileMeta}>
            {(currentUser?.totalTiles ?? 124) + metrics.capturedTiles} tiles | {((currentUser?.totalDistanceKm ?? 96) + metrics.distanceKm).toFixed(1)} km this month | {currentUser?.wins ?? 0} wins this season
          </Text>
          <Text style={styles.profileMeta}>{currentUser?.contact ?? 'Add contact'} | {currentUser?.city ?? 'Choose city'}</Text>
        </View>
      </View>

      <SectionCard title="League record">
        <Text style={styles.sectionText}>Wins: {currentUser?.wins ?? 0}</Text>
        <Text style={styles.sectionText}>Losses: {currentUser?.losses ?? 0}</Text>
        <Text style={styles.sectionText}>Current streak: {currentUser?.streak ?? 0}</Text>
      </SectionCard>

      <SectionCard title="Identity settings">
        <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#6b7f90" style={styles.chatInput} />
        <TextInput value={contact} onChangeText={setContact} placeholder="Phone or email" placeholderTextColor="#6b7f90" style={styles.chatInput} />
        <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#6b7f90" style={styles.chatInput} />
        <TextInput value={photoUrl} onChangeText={setPhotoUrl} placeholder="Photo URL, optional" placeholderTextColor="#6b7f90" style={styles.chatInput} />
        <Pressable
          onPress={() =>
            void updateProfile({
              name: name.trim() || currentUser?.name || 'Territory Runner',
              contact: contact.trim() || currentUser?.contact || '',
              city: city.trim() || currentUser?.city || 'Mumbai',
              avatarKey: currentUser?.avatarKey || 'ember',
              photoUrl: photoUrl.trim() || undefined,
            })
          }
          style={styles.primaryAction}
        >
          <Text style={styles.primaryActionText}>Update identity</Text>
        </Pressable>
      </SectionCard>

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
        ) : null}
      </SectionCard>

      <SectionCard title="Current run">
        <Text style={styles.sectionText}>Distance: {metrics.distanceKm.toFixed(2)} km</Text>
        <Text style={styles.sectionText}>Pace: {metrics.paceLabel} min/km</Text>
        <Text style={styles.sectionText}>Fresh captures: {metrics.capturedTiles}</Text>
        <Text style={styles.sectionText}>Steps: {metrics.steps}</Text>
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
    </ScrollView>
  );
}
