import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext/AuthContext';
import Router from './src/navigation/Router';
import { Linking } from 'react-native';
import { saveLogsDB } from './utils';

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

  useEffect(() => {


const handleDeepLink = (event) => {
	const url = event.url;
	console.log("Received url: " + url)

	saveLogsDB(
		'5071000',
		0,
		'User open app by URl Scheme',
		'User open app by URl Scheme',
	  );
}

Linking.addEventListener('url', handleDeepLink);

Linking.getInitialURL().then((url) => {
	if(url) {
		handleDeepLink({url})
	}
})

return () => {
	Linking.removeAllListeners('url', handleDeepLink)
}
  }, [])

  return (
    <AuthProvider>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </AuthProvider>
  );
}
