import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, FlatList, StatusBar
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/native';

type CategoryScreens = 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Vegetarian' | 'FastFood' | 'Soups' | 'Drinks';
type CategoriesScreenProp = NativeStackNavigationProp<RootStackParamList, CategoryScreens>;

const CATEGORIES: {
  id: string;
  name: string;
  icon: string;
  bg: string;
  accent: string;
  route: CategoryScreens;
}[] = [
  { id: '1', name: 'Breakfast', icon: '🍳', bg: '#FFF3DC', accent: '#B8860B', route: 'Breakfast' },
  { id: '2', name: 'Lunch', icon: '🥗', bg: '#E8F4E8', accent: '#4A7C59', route: 'Lunch' },
  { id: '3', name: 'Dinner', icon: '🍽️', bg: '#E8EAF6', accent: '#5C6BC0', route: 'Dinner' },
  { id: '4', name: 'Dessert', icon: '🍰', bg: '#FDE8DC', accent: '#C45C2E', route: 'Dessert' },
  { id: '5', name: 'Vegetarian', icon: '🥦', bg: '#E8F4E8', accent: '#2E7D32', route: 'Vegetarian' },
  { id: '6', name: 'Fast Food', icon: '🍔', bg: '#FFF3DC', accent: '#E65100', route: 'FastFood' },
  { id: '7', name: 'Soups', icon: '🍲', bg: '#FDE8DC', accent: '#8D4E26', route: 'Soups' },
  { id: '8', name: 'Drinks', icon: '🥤', bg: '#E3F2FD', accent: '#1565C0', route: 'Drinks' },
];

export default function Categories() {
  const navigation = useNavigation<CategoriesScreenProp>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.bg, borderBottomColor: item.accent }]}
      onPress={() => (navigation.navigate as any)(item.route, { userId })}
      activeOpacity={0.82}
    >
      <Text style={styles.cardIcon}>{item.icon}</Text>
      <Text style={[styles.cardName, { color: item.accent }]}>{item.name}</Text>
    </TouchableOpacity>
  );

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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Browse Categories</Text>
        <Text style={styles.subtitle}>What are you in the mood for?</Text>

        <FlatList
          data={CATEGORIES}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,14,8,0.55)',
    padding: 20,
    paddingTop: 55,
  },
  header: { flexDirection: 'row', marginBottom: 10 },
  backBtn: {
    backgroundColor: 'rgba(255,248,238,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.4)',
  },
  backBtnText: { color: '#FFF8EE', fontSize: 14, fontWeight: '600' },
  title: { color: '#FFF8EE', fontSize: 28, fontWeight: '900', marginBottom: 4 },
  subtitle: { color: '#D4C4A8', fontSize: 14, marginBottom: 4 },
  row: { justifyContent: 'space-between', marginBottom: 14 },
  card: {
    width: '48%',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cardIcon: { fontSize: 42, marginBottom: 10 },
  cardName: { fontSize: 15, fontWeight: '800' },
});
