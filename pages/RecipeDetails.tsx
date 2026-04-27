import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ImageBackground, Alert, Modal, TextInput, StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { API_URL } from '../api';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetails'>;

export default function RecipeDetails({ route, navigation }: Props) {
  const { recipe, userId, fromMyRecipes } = route.params;

  const imageSource = recipe.imageUrl || recipe.image;

  const [isFavorite, setIsFavorite] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(recipe.name);
  const [editIngredients, setEditIngredients] = useState<string[]>(recipe.ingredients || []);
  const [editSteps, setEditSteps] = useState<string[]>(recipe.steps || []);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await fetch(`${API_URL}/api/favorites/${userId}`);
        const data = await res.json();
        setIsFavorite(data.some((item: any) => item._id === recipe.id));
      } catch {
        console.log('Error checking favorites');
      }
    };
    if (userId) checkFavorite();
  }, []);

  const handleToggleFavorite = async () => {
    try {
      const endpoint = isFavorite
        ? `${API_URL}/api/favorites/remove`
        : `${API_URL}/api/favorites/add`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recipeId: recipe.id }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsFavorite(!isFavorite);
        Alert.alert('', isFavorite ? '💔 Removed from favorites' : '❤️ Added to favorites');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/recipes/${recipe.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
              });
              const data = await response.json();
              if (response.ok) {
                Alert.alert('Deleted', 'Recipe has been deleted.', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Error', data.message || 'Could not delete recipe');
              }
            } catch {
              Alert.alert('Error', 'Could not connect to server');
            }
          },
        },
      ]
    );
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          ingredients: editIngredients,
          steps: editSteps,
          userId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Updated! ✅', 'Recipe has been updated.');
        setEditModalVisible(false);
        recipe.name = editName;
        recipe.ingredients = editIngredients;
        recipe.steps = editSteps;
      } else {
        Alert.alert('Error', data.message || 'Could not update recipe');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  return (
    <ImageBackground
      source={require('../photo/loginbackground.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          {imageSource ? (
            <Image source={{ uri: imageSource }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 56 }}>🍽️</Text>
            </View>
          )}

          <View style={styles.titleCard}>
            <Text style={styles.name}>{recipe.name}</Text>
            {recipe.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{recipe.category}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧂 Ingredients</Text>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ing, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyFieldText}>No ingredients listed.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
            {recipe.steps && recipe.steps.length > 0 ? (
              recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyFieldText}>No steps listed.</Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            {/* Favorite — always visible */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isFavorite ? styles.favBtnActive : styles.favBtnInactive,
              ]}
              onPress={handleToggleFavorite}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>{isFavorite ? '❤️ Saved' : '🤍 Save'}</Text>
            </TouchableOpacity>

            {/* Edit & Delete — only when coming from MyRecipes */}
            {fromMyRecipes && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => setEditModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnText}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={handleDelete}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

        </ScrollView>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Recipe</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '85%' }}>
              <Text style={styles.modalLabel}>RECIPE NAME</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Recipe name"
                placeholderTextColor="#b0a090"
              />

              <Text style={styles.modalLabel}>INGREDIENTS</Text>
              {editIngredients.map((ing, i) => (
                <View key={i} style={styles.modalRowInput}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                    value={ing}
                    onChangeText={text => {
                      const updated = [...editIngredients];
                      updated[i] = text;
                      setEditIngredients(updated);
                    }}
                    placeholder={`Ingredient ${i + 1}`}
                    placeholderTextColor="#b0a090"
                  />
                  <TouchableOpacity
                    style={styles.modalRemoveBtn}
                    onPress={() => {
                      const updated = editIngredients.filter((_, idx) => idx !== i);
                      setEditIngredients(updated.length ? updated : ['']);
                    }}
                  >
                    <Text style={styles.modalRemoveBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={() => setEditIngredients([...editIngredients, ''])}
              >
                <Text style={styles.modalAddBtnText}>+ Add Ingredient</Text>
              </TouchableOpacity>

              <Text style={styles.modalLabel}>STEPS</Text>
              {editSteps.map((step, i) => (
                <View key={i} style={styles.modalRowInput}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberCircleText}>{i + 1}</Text>
                  </View>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                    value={step}
                    onChangeText={text => {
                      const updated = [...editSteps];
                      updated[i] = text;
                      setEditSteps(updated);
                    }}
                    placeholder={`Step ${i + 1}`}
                    placeholderTextColor="#b0a090"
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.modalRemoveBtn}
                    onPress={() => {
                      const updated = editSteps.filter((_, idx) => idx !== i);
                      setEditSteps(updated.length ? updated : ['']);
                    }}
                  >
                    <Text style={styles.modalRemoveBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.modalAddBtn}
                onPress={() => setEditSteps([...editSteps, ''])}
              >
                <Text style={styles.modalAddBtnText}>+ Add Step</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveEdit} activeOpacity={0.85}>
                <Text style={styles.modalSaveBtnText}>Save Changes ✅</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(20,14,8,0.55)' },
  container: { padding: 20, paddingTop: 55, paddingBottom: 40 },

  backBtn: {
    backgroundColor: 'rgba(255,248,238,0.2)', paddingVertical: 8,
    paddingHorizontal: 16, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.4)', alignSelf: 'flex-start', marginBottom: 16,
  },
  backBtnText: { color: '#FFF8EE', fontSize: 14, fontWeight: '600' },

  image: { width: '100%', height: 220, borderRadius: 20, marginBottom: 16 },
  imagePlaceholder: {
    width: '100%', height: 160, backgroundColor: 'rgba(255,248,238,0.1)',
    borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },

  titleCard: {
    backgroundColor: '#FFF8EE', borderRadius: 16, padding: 18, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  name: { color: '#2C1A0E', fontSize: 24, fontWeight: '900', marginBottom: 10 },
  categoryBadge: {
    backgroundColor: '#FDE8DC', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start',
  },
  categoryBadgeText: { color: '#C45C2E', fontSize: 13, fontWeight: '700' },

  section: {
    backgroundColor: '#FFF8EE', borderRadius: 16, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  sectionTitle: { color: '#2C1A0E', fontSize: 18, fontWeight: '900', marginBottom: 14 },

  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C45C2E', marginRight: 10 },
  ingredientText: { color: '#3D2512', fontSize: 15, flex: 1 },

  stepRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#C45C2E',
    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2, flexShrink: 0,
  },
  stepNumberText: { color: '#FFF8EE', fontSize: 13, fontWeight: '800' },
  stepText: { color: '#3D2512', fontSize: 15, flex: 1, lineHeight: 22 },

  emptyFieldText: { color: '#9A7B5A', fontSize: 14, fontStyle: 'italic' },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  actionBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  actionBtnText: { color: '#FFF8EE', fontSize: 13, fontWeight: '800' },
  favBtnInactive: { backgroundColor: '#4A7C59' },
  favBtnActive: { backgroundColor: '#C45C2E' },
  editBtn: { backgroundColor: '#5C6BC0' },
  deleteBtn: { backgroundColor: '#8B2020' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#FFF8EE', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { color: '#2C1A0E', fontSize: 22, fontWeight: '900' },
  modalClose: { color: '#9A7B5A', fontSize: 20, fontWeight: '700', padding: 4 },
  modalLabel: {
    fontSize: 11, fontWeight: '700', color: '#9A7B5A',
    letterSpacing: 1.5, marginBottom: 8, marginTop: 14,
  },
  modalInput: {
    backgroundColor: '#F5EDE0', borderRadius: 12, padding: 12,
    fontSize: 15, color: '#2C1A0E', marginBottom: 8, borderWidth: 1.5, borderColor: '#E8D5BC',
  },
  modalRowInput: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  stepNumberCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#C45C2E',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  stepNumberCircleText: { color: '#FFF8EE', fontSize: 13, fontWeight: '800' },
  modalRemoveBtn: { backgroundColor: 'rgba(139,32,32,0.7)', borderRadius: 10, padding: 10 },
  modalRemoveBtnText: { color: '#FFF8EE', fontSize: 13, fontWeight: '700' },
  modalAddBtn: {
    borderWidth: 1.5, borderColor: '#E8D5BC', borderRadius: 12,
    borderStyle: 'dashed', padding: 10, alignItems: 'center', marginBottom: 4,
  },
  modalAddBtnText: { color: '#9A7B5A', fontSize: 14, fontWeight: '600' },
  modalSaveBtn: {
    backgroundColor: '#C45C2E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 20,
    shadowColor: '#C45C2E', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
  modalSaveBtnText: { color: '#FFF8EE', fontSize: 16, fontWeight: '900' },
});
