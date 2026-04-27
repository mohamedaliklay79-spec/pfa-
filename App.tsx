import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './pages/login.tsx';
import Signup from './pages/Signup';
import Home from './pages/home.tsx';
import Favorites from './pages/Favorites.tsx';
import AddRecipe from './pages/AddRecipe.tsx';
import Categories from './pages/Categories.tsx';
import Breakfast from './pages/Categories/Breakfast.tsx';
import Lunch from './pages/Categories/Lunch.tsx';
import Dinner from './pages/Categories/Dinner.tsx';
import Dessert from './pages/Categories/Dessert.tsx';
import Vegetarian from './pages/Categories/Vegetarian.tsx';
import FastFood from './pages/Categories/FastFood.tsx';
import Soups from './pages/Categories/Soups.tsx';
import Drinks from './pages/Categories/Drinks.tsx';
import RecipeDetails from './pages/RecipeDetails';
import MyRecipes from './pages/MyRecipes';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: { userId: string };
  Favorites: { userId: string };
  MyRecipes: { userId: string };
  AddRecipe: { userId: string };
  Categories: { userId: string };
  Breakfast: { userId: string };
  Lunch: { userId: string };
  Dinner: { userId: string };
  Dessert: { userId: string };
  Vegetarian: { userId: string };
  FastFood: { userId: string };
  Soups: { userId: string };
  Drinks: { userId: string };
  RecipeDetails: {
    recipe: {
      id: string;
      name: string;
      category?: string;
      ingredients?: string[];
      steps?: string[];
      imageUrl?: string;
      image?: string;
    };
    userId: string;
    fromMyRecipes?: boolean;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);

  // On app launch, check if a userId is stored in AsyncStorage
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        setSavedUserId(userId); // null if not found
      } catch {
        setSavedUserId(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#C45C2E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={savedUserId ? 'Home' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        
        <Stack.Screen
          name="Home"
          component={Home}
          initialParams={savedUserId ? { userId: savedUserId } : undefined}
        />
        <Stack.Screen name="Favorites" component={Favorites} />
        <Stack.Screen name="AddRecipe" component={AddRecipe} />
        <Stack.Screen name="Categories" component={Categories} />
        <Stack.Screen name="Breakfast" component={Breakfast} />
        <Stack.Screen name="Lunch" component={Lunch} />
        <Stack.Screen name="Dinner" component={Dinner} />
        <Stack.Screen name="Dessert" component={Dessert} />
        <Stack.Screen name="Vegetarian" component={Vegetarian} />
        <Stack.Screen name="FastFood" component={FastFood} />
        <Stack.Screen name="Soups" component={Soups} />
        <Stack.Screen name="Drinks" component={Drinks} />
        <Stack.Screen name="RecipeDetails" component={RecipeDetails} />
        <Stack.Screen name="MyRecipes" component={MyRecipes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: 'rgba(20,14,8,1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
