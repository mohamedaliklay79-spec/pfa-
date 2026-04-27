import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ImageBackground,
  FlatList, ActivityIndicator, Image, StatusBar
} from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { API_URL } from '../../api';

type DinnerScreenProp = NavigationProp<RootStackParamList, 'Dinner'>;

type Recipe = {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
};

export default function Dinner() {
  const navigation = useNavigation<DinnerScreenProp>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/recipes?category=Dinner`)
      .then(res => res.json())
      .then(data => {
        setRecipes(data.map((item: any) => ({ ...item, id: item._id })));
        setLoading(false);
      })
      .catch(() => { setError('Could not load recipes'); setLoading(false); });
  }, []);

  return (
    <ImageBackground source={require('../../photo/loginbackground.jpg')} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>🍽️ Dinner</Text>
        <Text style={styles.subtitle}>{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</Text>

        {loading && <ActivityIndicator size="large" color="#C45C2E" style={{ marginTop: 40 }} />}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          data={recipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('RecipeDetails', { recipe: item, userId })}
              activeOpacity={0.85}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={{ fontSize: 36 }}>🍽️</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.ingredients.length} ingredients</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
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
  card: {
    backgroundColor: '#FFF8EE', borderRadius: 18, marginBottom: 14,
    overflow: 'hidden', shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15,
    shadowRadius: 6, elevation: 4,
  },
  cardImage: { width: '100%', height: 160 },
  cardImagePlaceholder: {
    width: '100%', height: 100, backgroundColor: '#F5EDE0',
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { padding: 14 },
  cardName: { color: '#2C1A0E', fontSize: 17, fontWeight: '800', marginBottom: 6 },
  badge: {
    backgroundColor: '#FDE8DC', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start',
  },
  badgeText: { color: '#C45C2E', fontSize: 12, fontWeight: '700' },
  errorText: { color: '#C45C2E', textAlign: 'center', marginTop: 20 },
});
