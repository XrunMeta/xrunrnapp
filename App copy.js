// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import React, {useState, useEffect} from 'react';
// import {SafeAreaView, StyleSheet} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {AuthProvider} from './src/context/AuthContext/AuthContext';
// import {Navigation} from './src/navigation';
// import Home from './src/screens/HomeScreen';
// import {useNavigation} from '@react-navigation/native';

// function App(): JSX.Element {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const navigation = useNavigation();

//   useEffect(() => {
//     checkLoginStatus();
//   }, []);

//   // Fungsi untuk check status login
//   const checkLoginStatus = async () => {
//     try {
//       const value = await AsyncStorage.getItem('isLoggedIn');

//       if (value === 'true') {
//         setIsLoggedIn(true);
//         navigation.navigate('Home');
//       } else {
//         setIsLoggedIn(false);
//       }
//     } catch (error) {
//       console.error('Error checking login status:', error);
//     }
//   };

//   console.log('Status login : ', isLoggedIn);

//   return (
//     <AuthProvider>
//       <SafeAreaView style={styles.root}>
//         <Navigation />
//       </SafeAreaView>
//     </AuthProvider>
//   );
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
// });

// export default App;

// import React, {useState, useEffect} from 'react';
// import {SafeAreaView, StyleSheet} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {NavigationContainer, useNavigation} from '@react-navigation/native';
// import {AuthProvider} from './src/context/AuthContext/AuthContext';
// import FirstScreen from './src/screens/FirstScreen';
// import HomeScreen from './src/screens/HomeScreen';

// function App(): JSX.Element {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigation = useNavigation();

//   useEffect(() => {
//     checkLoginStatus();
//   }, []);

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

//   // Navigasi ke layar yang sesuai berdasarkan status login
//   const navigateToScreen = () => {
//     if (isLoggedIn) {
//       navigation.navigate('Home');
//     } else {
//       navigation.navigate('FirstScreen');
//     }
//   };

//   useEffect(() => {
//     // Setelah mengecek status login, navigasi ke layar yang sesuai
//     navigateToScreen();
//   }, [isLoggedIn]);

//   console.log('Status login : ', isLoggedIn);

//   return (
//     <AuthProvider>
//       <SafeAreaView style={styles.root}>
//         <NavigationContainer>
//           {/* Tempatkan NavigationContainer di sini */}
//         </NavigationContainer>
//       </SafeAreaView>
//     </AuthProvider>
//   );
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
// });

// export default App;

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import FirstScreen from './src/screens/FirstScreen/';
import SignInScreen from './src/screens/SignInScreen/';
import EmailAuthScreen from './src/screens/EmailAuthScreen/';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen/';
import SignUpScreen from './src/screens/SignUpScreen/';
import ConfirmEmailScreen from './src/screens/ConfirmEmailScreen/';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen/';
import NewPasswordScreen from './src/screens/NewPasswordScreen/';
import Home from './src/screens/HomeScreen';
import ChooseRegionScreen from './src/screens/ChooseRegionScreen/ChooseRegionScreen';
import ARScreen from './src/screens/ARScreen/ARScreen';
import InfoScreen from './src/screens/InfoScreen/InfoScreen';
import AppInformation from './src/screens/AppInformation/AppInformation';
import PersonalPolicy from './src/screens/PersonalPolicyScreen/PersonalPolicy';
import CustomTabBarButton from './src/components/CustomTabBarButton';
import ClauseScreen from './src/screens/ClauseScreen/ClauseScreen';
import ServiceClause from './src/screens/ServiceClauseScreen/ServiceClause';
import ClauseForUsage from './src/screens/ClauseForUsage/ClauseForUsage';
import ClauseForPersonal from './src/screens/ClauseForPersonal/ClauseForPersonal';
import Testing from './src/screens/testing';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Fungsi untuk check status login
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isLoggedIn');

        console.log('Status Login : ' + value);

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
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="First"
        screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="ARScreen" component={ARScreen} />
            <Stack.Screen name="AppInformation" component={AppInformation} />
          </>
        ) : (
          <>
            <Stack.Screen name="First" component={FirstScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
            <Stack.Screen
              name="EmailVerif"
              component={EmailVerificationScreen}
            />
            <Stack.Screen name="ChooseRegion" component={ChooseRegionScreen} />
            <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
