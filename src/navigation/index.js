import React from 'react';
import {NavigationContainer} from '@react-navigation/native/';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

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

import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        <Stack.Screen name="MainApp" component={MainApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

const MainApp = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <TabNavigator {...props} />}>
      <Tab.Screen name="Wallet" component={HomeScreen} />
      <Tab.Screen name="Adverti..." component={HomeScreen} />
      <Tab.Screen name="Map" component={HomeScreen} />
      <Tab.Screen name="AR" component={HomeScreen} />
      <Tab.Screen name="Notify" component={EmailAuthScreen} />
      <Tab.Screen name="My Info" component={NewPasswordScreen} />
    </Tab.Navigator>
  );
};
