import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppState } from '../context/AppContext';

const avatarOptions = [
  { key: 'ember', label: 'Ember', color: '#f97316' },
  { key: 'ocean', label: 'Ocean', color: '#0ea5e9' },
  { key: 'storm', label: 'Storm', color: '#64748b' },
  { key: 'neon', label: 'Neon', color: '#22c55e' },
];

export function AuthScreen() {
  const { login } = useAppState();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [photoUrl, setPhotoUrl] = useState('');
  const [avatarKey, setAvatarKey] = useState('ember');

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Territory Network</Text>
        <Text style={styles.title}>Build your runner identity before you enter the map.</Text>
        <Text style={styles.copy}>
          Use your name with a phone number or email, pick an avatar, and enter the city where you want to compete.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Komal Sai"
          placeholderTextColor="#6f8798"
          style={styles.input}
        />

        <Text style={styles.label}>Mobile number or email</Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder="+91 98765 43210 or you@example.com"
          placeholderTextColor="#6f8798"
          style={styles.input}
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="Mumbai"
          placeholderTextColor="#6f8798"
          style={styles.input}
        />

        <Text style={styles.label}>Photo URL, optional</Text>
        <TextInput
          value={photoUrl}
          onChangeText={setPhotoUrl}
          placeholder="https://..."
          placeholderTextColor="#6f8798"
          style={styles.input}
        />

        <Text style={styles.label}>Avatar style</Text>
        <View style={styles.avatarRow}>
          {avatarOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setAvatarKey(option.key)}
              style={[styles.avatarOption, { borderColor: option.color }, avatarKey === option.key && styles.avatarOptionActive]}
            >
              <View style={[styles.avatarDot, { backgroundColor: option.color }]} />
              <Text style={styles.avatarText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() =>
            void login({
              name: name.trim() || 'Territory Runner',
              contact: contact.trim() || 'runner@territory.app',
              city: city.trim() || 'Mumbai',
              avatarKey,
              photoUrl: photoUrl.trim() || undefined,
            })
          }
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Enter the city</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#071419',
    flexGrow: 1,
    gap: 20,
    padding: 22,
  },
  hero: {
    backgroundColor: '#0d242b',
    borderRadius: 30,
    padding: 24,
  },
  eyebrow: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
    marginTop: 10,
  },
  copy: {
    color: '#d2dee6',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#0d1720',
    borderColor: '#1b3542',
    borderRadius: 28,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#091017',
    borderColor: '#213846',
    borderRadius: 16,
    borderWidth: 1,
    color: '#f8fafc',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  avatarOption: {
    alignItems: 'center',
    backgroundColor: '#091017',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatarOptionActive: {
    backgroundColor: '#102633',
  },
  avatarDot: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  avatarText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#f97316',
    borderRadius: 18,
    marginTop: 10,
    minHeight: 54,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff7ed',
    fontSize: 16,
    fontWeight: '800',
  },
});
