import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ImageBackground, StatusBar
} from 'react-native';
import { API_URL } from '../api';

export default function Signup({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Account created! 🎉', data.message);
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message);
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
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.appName}>Join Flavora</Text>
          <Text style={styles.tagline}>Start building your recipe collection</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>

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
              placeholder="Choose a password"
              placeholderTextColor="#b0a090"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor="#b0a090"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} activeOpacity={0.85}>
            <Text style={styles.signupBtnText}>Create Account →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text></Text>
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
  emoji: { fontSize: 52, marginBottom: 10 },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFF8EE',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#D4C4A8',
    marginTop: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  inputWrapper: { marginBottom: 14 },
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
  signupBtn: {
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
  signupBtnText: {
    color: '#FFF8EE',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: '#9A7B5A', fontSize: 14 },
  loginLinkBold: { color: '#C45C2E', fontWeight: '700' },
});
