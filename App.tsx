/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthProvider} from './src/context/AuthContext/AuthContext';
import {Navigation, MainTabNavigator} from './src/navigation';

function App(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

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

  console.log('Status login : ', isLoggedIn);

  return (
    <AuthProvider>
      <SafeAreaView style={styles.root}>
        {isLoggedIn ? <MainTabNavigator /> : <Navigation />}
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default App;
