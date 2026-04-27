import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert, ScrollView, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const MENU_ITEMS = [
  {
    key: 'Favorites',
    icon: '❤️',
    title: 'My Favorites',
    desc: 'Recipes you love',
    color: '#FDE8DC',
    accent: '#C45C2E',
  },
  {
    key: 'MyRecipes',
    icon: '📖',
    title: 'My Recipes',
    desc: 'Created by you',
    color: '#E8F4E8',
    accent: '#4A7C59',
  },
  {
    key: 'AddRecipe',
    icon: '➕',
    title: 'Add Recipe',
    desc: 'Share a new dish',
    color: '#FFF3DC',
    accent: '#B8860B',
  },
  {
    key: 'Categories',
    icon: '📂',
    title: 'Categories',
    desc: 'Browse by type',
    color: '#E8EAF6',
    accent: '#5C6BC0',
  },
];

export default function Home() {
  const navigation = useNavigation<HomeScreenProp>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const handlePress = (key: string) => {
    if (!userId && key !== 'Categories') {
      return Alert.alert('Error', 'User ID missing');
    }
    (navigation.navigate as any)(key, { userId });
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            // Clear the stored session
            await AsyncStorage.removeItem('userId');
            // Navigate back to Login and reset the stack so the user can't go back
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../photo/loginbackground.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good cooking! 👋</Text>
            <Text style={styles.appName}>Flavora</Text>
          </View>
          {/* Logout button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroText}>What will you{'\n'}cook today?</Text>
          <Text style={styles.heroSub}>Explore, create & save your favorites</Text>
        </View>

        {/* Menu grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        >
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.card, { backgroundColor: item.color, borderLeftColor: item.accent }]}
              onPress={() => handlePress(item.key)}
              activeOpacity={0.82}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: item.accent }]}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
              <Text style={[styles.cardArrow, { color: item.accent }]}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 14, 8, 0.55)',
    paddingTop: 55,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { color: '#D4C4A8', fontSize: 14, letterSpacing: 0.5 },
  appName: {
    color: '#FFF8EE',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Logout button replaces the old avatar circle
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,248,238,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,248,238,0.35)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  logoutIcon: { fontSize: 16 },
  logoutText: { color: '#FFF8EE', fontSize: 13, fontWeight: '700' },

  heroBanner: {
    backgroundColor: 'rgba(196,92,46,0.85)',
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
  },
  heroText: {
    color: '#FFF8EE',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 6,
  },
  heroSub: { color: 'rgba(255,248,238,0.8)', fontSize: 13 },
  grid: { paddingBottom: 40, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: { fontSize: 32, marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  cardDesc: { fontSize: 13, color: '#6B5744' },
  cardArrow: { fontSize: 28, fontWeight: '300' },
});
