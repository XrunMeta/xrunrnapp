import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet, Text, View, Image} from 'react-native';

import FirstScreen from '../screens/FirstScreen/';
import SignInScreen from '../screens/SignInScreen/';
import EmailAuthScreen from '../screens/EmailAuthScreen/';
import EmailVerificationScreen from '../screens/EmailVerificationScreen/';
import SignUpScreen from '../screens/SignUpScreen/';
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen/';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/';
import NewPasswordScreen from '../screens/NewPasswordScreen/';
import HomeScreen from '../screens/HomeScreen';
import ChooseRegionScreen from '../screens/ChooseRegionScreen/ChooseRegionScreen';
import ARScreen from '../screens/ARScreen/ARScreen';
import InfoScreen from '../screens/InfoScreen/InfoScreen';
import AppInformation from '../screens/AppInformation/AppInformation';
import PersonalPolicy from '../screens/PersonalPolicyScreen/PersonalPolicy';
import CustomTabBarButton from '../components/CustomTabBarButton';
import ClauseScreen from '../screens/ClauseScreen/ClauseScreen';
import ServiceClause from '../screens/ServiceClauseScreen/ServiceClause';
import ClauseForUsage from '../screens/ClauseForUsage/ClauseForUsage';
import ClauseForPersonal from '../screens/ClauseForPersonal/ClauseForPersonal';
import Testing from '../screens/testing';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main Screen -> Map and AR
const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="MapHome"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="MapHome" component={HomeScreen} />
      <Stack.Screen name="AR" component={ARScreen} />
    </Stack.Navigator>
  );
};

// Main Screen -> Info
const InfoStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="InfoHome"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="InfoHome" component={InfoScreen} />
      <Stack.Screen name="AppInformation" component={AppInformation} />
      <Stack.Screen name="Clause" component={ClauseScreen} />
      <Stack.Screen name="ServiceClause" component={ServiceClause} />
      <Stack.Screen name="UsageClause" component={ClauseForUsage} />
      <Stack.Screen name="PersonalClause" component={ClauseForPersonal} />
      <Stack.Screen name="PersonalPolicy" component={PersonalPolicy} />
    </Stack.Navigator>
  );
};

export const Navigation = () => {
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
        <Stack.Screen name="ARScreen" component={ARScreen} />
        <Stack.Screen name="AppInformation" component={AppInformation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
