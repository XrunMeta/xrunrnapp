/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext/AuthContext';
import Navigation from './src/navigation';
import HomeScreen from './src/screens/HomeScreen/';
import {NavigationContainer} from '@react-navigation/native/';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

function App(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const Stack = createNativeStackNavigator();

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
        {isLoggedIn ? (
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        ) : (
          <Navigation />
        )}
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
