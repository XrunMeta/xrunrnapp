import React from 'react';
import {NavigationContainer} from '@react-navigation/native/';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import FirstScreen from '../screens/FirstScreen/';
import SignInScreen from '../screens/SignInScreen/';
import EmailAuthScreen from '../screens/EmailAuthScreen/';
import EmailVerificationScreen from '../screens/EmailVerificationScreen/';
import SignUpScreen from '../screens/SignUpScreen/';
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen/';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/';
import NewPasswordScreen from '../screens/NewPasswordScreen/';
import HomeScreen from '../screens/HomeScreen/';
import ChooseRegionScreen from '../screens/ChooseRegionScreen/ChooseRegionScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="First"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="First" component={FirstScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
        <Stack.Screen name="EmailVerif" component={EmailVerificationScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ChooseRegion" component={ChooseRegionScreen} />
        <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
