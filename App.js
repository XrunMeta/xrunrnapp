import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext/AuthContext';
import Router from './src/navigation/Router';
import firebase from '@react-native-firebase/app';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Inisialisasi Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp({
      // Konfigurasi Firebase Anda
      apiKey: 'AIzaSyB7y2_p3wC3t9y76UvPfYgx4ac5a6qIiuw',
      projectId: 'xrun-app',
      messagingSenderId: '1031480595776',
      appId: '1:1031480595776:android:0f934aff40f18ed6ae96a5',
    });
  }

  useEffect(() => {
    // Fungsi untuk check status login
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isLoggedIn');

        if (value === 'true') {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </AuthProvider>
  );
}
