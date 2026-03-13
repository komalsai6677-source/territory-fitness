import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useAppState } from '../context/AppContext';
import { SectionCard } from '../ui/cards';
import { screenStyles as styles } from '../ui/screenStyles';

export function SocialScreen() {
  const { chatMessages, groups, metrics, nearbyRunners, races, sendGroupMessage, sessionActive } = useAppState();
  const [draftMessage, setDraftMessage] = useState('');
  const primaryGroupId = groups[0]?.id;
  const groupMessages = primaryGroupId ? chatMessages.filter((message) => message.groupId === primaryGroupId) : [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SectionCard title="People near you">
        <Text style={styles.sectionText}>
          Nearby athlete discovery is core to this product. You should be able to spot active runners around you and join the same competitive space.
        </Text>
        {nearbyRunners.map((runner) => (
          <View key={runner.id} style={styles.nearbyCard}>
            <View style={styles.runnerRow}>
              {runner.id === 'u1' ? (
                <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60' }} style={styles.nearbyPhoto} />
              ) : runner.id === 'u2' ? (
                <Image source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60' }} style={styles.nearbyPhoto} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{runner.name.slice(0, 1)}</Text>
                </View>
              )}
              <View>
                <Text style={styles.runnerName}>{runner.name}</Text>
                <Text style={styles.runnerMeta}>{runner.status}</Text>
                <Text style={styles.runnerMeta}>
                  {runner.distanceAwayKm.toFixed(1)} km away | {runner.sharedTiles} contested tiles nearby
                </Text>
              </View>
            </View>
            <View style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Race invites">
        {races.slice(0, 3).map((race) => (
          <View key={race.id} style={styles.nearbyCard}>
            <View>
              <Text style={styles.runnerName}>{race.title}</Text>
              <Text style={styles.runnerMeta}>
                {race.distanceKm} km | {race.entrants} runners | {race.type}
              </Text>
            </View>
            <View style={styles.followButton}>
              <Text style={styles.followButtonText}>Join</Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Visible nearby">
        <Text style={styles.sectionEmphasis}>{nearbyRunners.length} athletes detected in your competitive area</Text>
        <Text style={styles.sectionSubtle}>
          {sessionActive
            ? `Your active session has opened ${metrics.capturedTiles} fresh tiles for social visibility.`
            : 'Start a session to broadcast your movement inside the nearby runner feed.'}
        </Text>
      </SectionCard>

      <SectionCard title="Groups">
        {groups.length === 0 ? (
          <Text style={styles.sectionSubtle}>No synced groups yet.</Text>
        ) : (
          groups.map((group) => (
            <View key={group.id} style={styles.infoRow}>
              <Text style={styles.runnerName}>{group.name}</Text>
              <Text style={styles.infoRowText}>
                {group.description} | {group.members} members | {group.sampleMembers.join(', ')}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Group chat">
        {primaryGroupId ? (
          <>
            {groupMessages.length === 0 ? (
              <Text style={styles.sectionSubtle}>No messages yet.</Text>
            ) : (
              groupMessages.slice(-4).map((message) => (
                <View key={message.id} style={styles.infoRow}>
                  <Text style={styles.runnerName}>{message.authorName}</Text>
                  <Text style={styles.infoRowText}>{message.text}</Text>
                </View>
              ))
            )}
            <View style={styles.chatRow}>
              <TextInput
                onChangeText={setDraftMessage}
                placeholder="Message your group"
                placeholderTextColor="#6b7f90"
                style={[styles.chatInput, { flex: 1 }]}
                value={draftMessage}
              />
              <Pressable
                onPress={() => {
                  void sendGroupMessage(primaryGroupId, draftMessage);
                  setDraftMessage('');
                }}
                style={styles.sendButton}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.sectionSubtle}>Join a group to use chat.</Text>
        )}
      </SectionCard>
    </ScrollView>
  );
}
