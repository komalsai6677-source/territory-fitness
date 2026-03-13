import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from './context/AppContext';
import { ActivityScreen } from './screens/ActivityScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MapScreen } from './screens/MapScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SocialScreen } from './screens/SocialScreen';
import { TabKey } from './types';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'activity', label: 'Track' },
  { key: 'map', label: 'Map' },
  { key: 'social', label: 'Nearby' },
  { key: 'profile', label: 'Profile' },
];

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const { sessionActive, metrics } = useAppState();

  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Territory Fitness</Text>
          <Text style={styles.headerTitle}>{sessionActive ? 'Session live. Keep moving.' : 'Move outside. Own the city.'}</Text>
        </View>
        <View style={styles.headerChip}>
          <Text style={styles.headerChipText}>{sessionActive ? `${metrics.capturedTiles} tiles` : 'Beta'}</Text>
        </View>
      </View>

      <View style={styles.content}>{renderScreen(activeTab)}</View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
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
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerLabel: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
    marginTop: 4,
  },
  headerChip: {
    backgroundColor: '#1f2937',
    borderColor: '#334155',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerChipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#08131b',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  tabButtonActive: {
    backgroundColor: '#123341',
  },
  tabLabel: {
    color: '#7d91a2',
    fontSize: 13,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#ecfeff',
  },
});
