import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/context/AuthContext/AuthContext';
import Router from './src/navigation/Router';
import {Linking} from 'react-native';
import {saveLogsDB} from './utils';

export default function App() {
  useEffect(() => {
    const handleDeepLink = event => {
      const url = event.url;
      console.log('Received url: ' + url);

      saveLogsDB(
        '5071000',
        0,
        'User open app by URl Scheme',
        'User open app by URl Scheme',
      );
    };

    Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({url});
      }
    });

    return () => {
      Linking.removeAllListeners('url', handleDeepLink);
    };
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </AuthProvider>
  );
}
