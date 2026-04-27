import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ImageBackground, ScrollView, Alert, Image, StatusBar
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../api';
import { launchImageLibrary } from 'react-native-image-picker';

type AddRecipeScreenProp = NativeStackNavigationProp<RootStackParamList, 'AddRecipe'>;

const CATEGORY_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegetarian', 'Fast Food', 'Soups', 'Drinks'];

const CATEGORY_EMOJIS: Record<string, string> = {
  Breakfast: '🍳', Lunch: '🥗', Dinner: '🍽️', Dessert: '🍰',
  Vegetarian: '🥦', 'Fast Food': '🍔', Soups: '🍲', Drinks: '🥤',
};

export default function AddRecipe() {
  const navigation = useNavigation<AddRecipeScreenProp>();
  const route = useRoute<any>();
  const userId = route.params?.userId;

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [image, setImage] = useState<any>(null);

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated.length ? updated : ['']);
  };
  const updateIngredient = (text: string, index: number) => {
    const updated = [...ingredients];
    updated[index] = text;
    setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated.length ? updated : ['']);
  };
  const updateStep = (text: string, index: number) => {
    const updated = [...steps];
    updated[index] = text;
    setSteps(updated);
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.assets && response.assets.length > 0) setImage(response.assets[0]);
    });
  };

  const handleSave = async () => {
    if (!userId) { Alert.alert('Error', 'User ID missing'); return; }
    if (!name || !selectedCategory) {
      Alert.alert('Error', 'Please enter a recipe name and select a category');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('selectedCategory', selectedCategory);
      formData.append('ingredients', JSON.stringify(ingredients));
      formData.append('steps', JSON.stringify(steps));
      formData.append('userId', userId);
      if (image) {
        formData.append('image', {
          uri: image.uri, type: image.type || 'image/jpeg', name: image.fileName || 'recipe.jpg',
        } as any);
      }
      const response = await fetch(`${API_URL}/api/AddRecipe/${userId}`, { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Recipe saved! 🎉', data.message);
        setName(''); setSelectedCategory(''); setIngredients(['']); setSteps(['']); setImage(null);
        navigation.goBack()

      } else {
        Alert.alert('Error', data.message || 'Failed to add recipe');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  return (
    <ImageBackground source={require('../photo/loginbackground.jpg')} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.pageTitle}>Add a Recipe</Text>
        <Text style={styles.pageSubtitle}>Share something delicious</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>

          {/* Photo */}
          <TouchableOpacity style={styles.photoBtn} onPress={pickImage} activeOpacity={0.85}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderIcon}>📷</Text>
                <Text style={styles.photoPlaceholderText}>Tap to add a photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RECIPE NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Spaghetti Bolognese"
              placeholderTextColor="#b0a090"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryEmoji}>{CATEGORY_EMOJIS[cat]}</Text>
                  <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>INGREDIENTS</Text>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.rowInput}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder={`Ingredient ${index + 1}`}
                  placeholderTextColor="#b0a090"
                  value={ingredient}
                  onChangeText={text => updateIngredient(text, index)}
                />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeIngredient(index)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addRowBtn} onPress={addIngredient}>
              <Text style={styles.addRowBtnText}>+ Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          {/* Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>STEPS</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.rowInput}>
                <View style={styles.stepNumberCircle}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder={`Describe step ${index + 1}`}
                  placeholderTextColor="#b0a090"
                  value={step}
                  onChangeText={text => updateStep(text, index)}
                  multiline
                />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeStep(index)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addRowBtn} onPress={addStep}>
              <Text style={styles.addRowBtnText}>+ Add Step</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save Recipe 💾</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(20,14,8,0.55)', paddingTop: 55 },
  header: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8 },
  backBtn: {
    backgroundColor: 'rgba(255,248,238,0.2)', paddingVertical: 8,
    paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,248,238,0.4)',
  },
  backBtnText: { color: '#FFF8EE', fontSize: 14, fontWeight: '600' },
  pageTitle: { color: '#FFF8EE', fontSize: 28, fontWeight: '900', marginBottom: 2, paddingHorizontal: 20 },
  pageSubtitle: { color: '#D4C4A8', fontSize: 13, marginBottom: 16, paddingHorizontal: 20 },

  formScroll: { paddingHorizontal: 20, paddingBottom: 50 },

  photoBtn: { borderRadius: 18, overflow: 'hidden', marginBottom: 20 },
  photoPreview: { width: '100%', height: 200, borderRadius: 18 },
  photoPlaceholder: {
    width: '100%', height: 160, backgroundColor: 'rgba(255,248,238,0.12)',
    borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,248,238,0.3)',
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center',
  },
  photoPlaceholderIcon: { fontSize: 36, marginBottom: 8 },
  photoPlaceholderText: { color: '#D4C4A8', fontSize: 14 },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#D4C4A8',
    letterSpacing: 1.5, marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFF8EE', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#2C1A0E', marginBottom: 10,
    borderWidth: 1.5, borderColor: '#E8D5BC',
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: 'rgba(255,248,238,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,248,238,0.3)',
  },
  categoryChipSelected: { backgroundColor: '#C45C2E', borderColor: '#C45C2E' },
  categoryEmoji: { fontSize: 14 },
  categoryChipText: { color: '#D4C4A8', fontSize: 13, fontWeight: '600' },
  categoryChipTextSelected: { color: '#FFF8EE', fontWeight: '700' },

  rowInput: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  stepNumberCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#C45C2E',
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumber: { color: '#FFF8EE', fontSize: 13, fontWeight: '800' },
  removeBtn: { backgroundColor: 'rgba(196,92,46,0.8)', borderRadius: 10, padding: 10 },
  removeBtnText: { color: '#FFF8EE', fontSize: 14, fontWeight: '700' },
  addRowBtn: {
    borderWidth: 1.5, borderColor: 'rgba(255,248,238,0.3)', borderRadius: 12,
    borderStyle: 'dashed', padding: 12, alignItems: 'center',
  },
  addRowBtnText: { color: '#D4C4A8', fontSize: 14, fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#C45C2E', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 10,
    shadowColor: '#C45C2E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { color: '#FFF8EE', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
});
