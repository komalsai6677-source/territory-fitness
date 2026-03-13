import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from './context/AppContext';
import { ActivityScreen } from './screens/ActivityScreen';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MapScreen } from './screens/MapScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SocialScreen } from './screens/SocialScreen';
import { TabKey } from './types';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'home', label: 'Command' },
  { key: 'activity', label: 'Track' },
  { key: 'map', label: 'Territory' },
  { key: 'social', label: 'League' },
  { key: 'profile', label: 'Identity' },
];

const avatarPalette: Record<string, string> = {
  ember: '#f97316',
  ocean: '#0ea5e9',
  storm: '#64748b',
  neon: '#22c55e',
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const { authenticated, currentUser, logout, metrics, sessionActive } = useAppState();

  const avatarColor = useMemo(() => avatarPalette[currentUser?.avatarKey ?? 'ember'] ?? '#f97316', [currentUser?.avatarKey]);

  if (!authenticated) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.kickerRow}>
            <Text style={styles.headerLabel}>Territory Pulse</Text>
            <View style={styles.headerChip}>
              <Text style={styles.headerChipText}>{sessionActive ? `${metrics.mode.toUpperCase()} LIVE` : 'Ready'}</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>
            {sessionActive ? 'Hold your line. Rivals are inside your grid.' : 'Choose your mode and take the next block.'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {currentUser?.photoUrl ? (
            <Image source={{ uri: currentUser.photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarBubble, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarBubbleText}>{currentUser?.name?.slice(0, 1) ?? 'Y'}</Text>
            </View>
          )}
          <Text style={styles.headerName}>{currentUser?.name ?? 'Runner'}</Text>
          <Pressable onPress={() => void logout()} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Exit</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>{renderScreen(activeTab)}</View>

      <View style={styles.tabWrap}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = tab.key === activeTab;

            return (
              <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tabButton, active && styles.tabButtonActive]}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function renderScreen(activeTab: TabKey) {
  switch (activeTab) {
    case 'activity':
      return <ActivityScreen />;
    case 'map':
      return <MapScreen />;
    case 'social':
      return <SocialScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  header: {
    backgroundColor: '#06161d',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  headerLeft: {
    gap: 8,
  },
  kickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  headerLabel: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    maxWidth: '82%',
  },
  headerChip: {
    backgroundColor: '#112733',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerChipText: {
    color: '#d9f99d',
    fontSize: 11,
    fontWeight: '800',
  },
  headerRight: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 20,
    top: 18,
  },
  avatarBubble: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarBubbleText: {
    color: '#fff7ed',
    fontSize: 18,
    fontWeight: '900',
  },
  avatarImage: {
    borderRadius: 999,
    height: 44,
    width: 44,
  },
  headerName: {
    color: '#d8e4eb',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutText: {
    color: '#8ca2b2',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabWrap: {
    backgroundColor: '#071419',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  tabBar: {
    backgroundColor: '#0a1a22',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  tabButtonActive: {
    backgroundColor: '#173443',
  },
  tabLabel: {
    color: '#7890a0',
    fontSize: 12,
    fontWeight: '800',
  },
  tabLabelActive: {
    color: '#f8fafc',
  },
});
