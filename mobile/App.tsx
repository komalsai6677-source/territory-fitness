import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { AppShell } from './src/AppShell';
import { AppProvider } from './src/context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.appFrame}>
          <View style={styles.glowTop} />
          <View style={styles.glowSide} />
          <View style={styles.gridOverlay} />
          <AppShell />
        </View>
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#051016',
  },
  appFrame: {
    flex: 1,
    backgroundColor: '#051016',
    overflow: 'hidden',
  },
  glowTop: {
    backgroundColor: '#0f766e',
    borderRadius: 220,
    height: 220,
    opacity: 0.14,
    position: 'absolute',
    right: -40,
    top: -60,
    width: 220,
  },
  glowSide: {
    backgroundColor: '#f97316',
    borderRadius: 240,
    bottom: 120,
    height: 240,
    left: -120,
    opacity: 0.08,
    position: 'absolute',
    width: 240,
  },
  gridOverlay: {
    borderColor: 'rgba(148,163,184,0.06)',
    borderWidth: 1,
    bottom: 12,
    left: 12,
    position: 'absolute',
    right: 12,
    top: 12,
  },
});
