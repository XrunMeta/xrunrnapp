import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext/AuthContext';
import Router from './src/navigation/Router';

export default function App() {
  const [setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   // Fungsi untuk check status login
  //   const checkLoginStatus = async () => {
  //     try {
  //       const value = await AsyncStorage.getItem('isLoggedIn');

  //       if (value === 'true') {
  //         setIsLoggedIn(true);
  //       } else {
  //         setIsLoggedIn(false);
  //       }
  //     } catch (error) {
  //       console.error('Error checking login status:', error);
  //     }
  //   };

  //   checkLoginStatus();
  // }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </AuthProvider>
  );
}