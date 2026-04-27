import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ImageBackground, ActivityIndicator, Image, StatusBar
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../api';

type MyRecipesScreenProp = NativeStackNavigationProp<RootStackParamList, 'MyRecipes'>;

type Recipe = {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
};

export default function MyRecipes() {
  const navigation = useNavigation<MyRecipesScreenProp>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const [search, setSearch] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        if (!userId) { setError('User not logged in'); setLoading(false); return; }
        const response = await fetch(`${API_URL}/api/myrecipes/${userId}`);
        const data = await response.json();
        setRecipes(data.map((item: any) => ({ ...item, id: item._id, imageUrl: item.imageUrl })));
        setLoading(false);
      } catch {
        setError('Could not load your recipes');
        setLoading(false);
      }
    };
    fetchMyRecipes();
  }, [userId]);

  const filtered = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetails', {
        recipe: item,
        userId,
        fromMyRecipes: true, // enables Edit & Delete buttons in RecipeDetails
      })}
      activeOpacity={0.85}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={{ fontSize: 30 }}>📖</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
      </View>
      <Text style={styles.icon}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../photo/loginbackground.jpg')} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>My Recipes</Text>
        <Text style={styles.subtitle}>{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} created</Text>

        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Search your recipes..."
            placeholderTextColor="#b0a090"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading && <ActivityIndicator size="large" color="#C45C2E" style={{ marginTop: 40 }} />}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && recipes.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍳</Text>
            <Text style={styles.emptyTitle}>No recipes yet</Text>
            <Text style={styles.emptyDesc}>Tap "Add Recipe" on the home screen to create your first dish!</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(20,14,8,0.55)', padding: 20, paddingTop: 55 },
  header: { flexDirection: 'row', marginBottom: 10 },
  backBtn: {
    backgroundColor: 'rgba(255,248,238,0.2)', paddingVertical: 8,
    paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,248,238,0.4)',
  },
  backBtnText: { color: '#FFF8EE', fontSize: 14, fontWeight: '600' },
  title: { color: '#FFF8EE', fontSize: 28, fontWeight: '900', marginBottom: 2 },
  subtitle: { color: '#D4C4A8', fontSize: 13, marginBottom: 16 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,248,238,0.15)', borderRadius: 14,
    paddingHorizontal: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,248,238,0.25)',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchBar: { flex: 1, paddingVertical: 12, color: '#FFF8EE', fontSize: 15 },
  card: {
    flexDirection: 'row', backgroundColor: '#FFF8EE', borderRadius: 18,
    marginBottom: 12, overflow: 'hidden', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  cardImage: { width: 80, height: 80 },
  cardImagePlaceholder: {
    width: 80, height: 80, backgroundColor: '#F5EDE0',
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1, padding: 12 },
  cardName: { color: '#2C1A0E', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  badge: {
    backgroundColor: '#E8F4E8', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start',
  },
  badgeText: { color: '#4A7C59', fontSize: 12, fontWeight: '700' },
  icon: { fontSize: 26, color: '#9A7B5A', paddingHorizontal: 14 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { color: '#FFF8EE', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { color: '#D4C4A8', fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },
  errorText: { color: '#C45C2E', textAlign: 'center', marginTop: 20 },
});
