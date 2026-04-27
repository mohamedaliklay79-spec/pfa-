import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api';

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
  const navigation = useNavigation<LoginScreenProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Persist the userId so the user stays logged in between app launches
        await AsyncStorage.setItem('userId', data.userId);
        Alert.alert('Welcome back! 👋', data.message);
        navigation.navigate('Home', { userId: data.userId });
      } else {
        Alert.alert('Oops!', data.message);
      }
    } catch (error) {
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
        <View style={styles.topSection}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.appName}>Flavora</Text>
          <Text style={styles.tagline}>Your personal recipe collection</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#b0a090"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#b0a090"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Sign In →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLinkText}>Don't have an account? <Text style={styles.signupLinkBold}>Create one</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 14, 8, 0.62)',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emoji: { fontSize: 56, marginBottom: 10 },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF8EE',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 15,
    color: '#D4C4A8',
    marginTop: 6,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#FFF8EE',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 20,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2C1A0E',
    marginBottom: 24,
  },
  inputWrapper: { marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A7B5A',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5EDE0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2C1A0E',
    borderWidth: 1.5,
    borderColor: '#E8D5BC',
  },
  loginBtn: {
    backgroundColor: '#C45C2E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#C45C2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnText: {
    color: '#FFF8EE',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  signupLink: { marginTop: 20, alignItems: 'center' },
  signupLinkText: { color: '#9A7B5A', fontSize: 14 },
  signupLinkBold: { color: '#C45C2E', fontWeight: '700' },
});
