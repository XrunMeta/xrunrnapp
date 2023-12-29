import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider} from './src/context/AuthContext/AuthContext';

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
import ConfirmPasswordScreen from './src/screens/ConfirmPasswordScreen';
import ModifInfoScreen from './src/screens/ModifInfoScreen';
import TemplateScreen from './src/screens/TemplateScreen';
import ConfirmPasswordEdit from './src/screens/ConfirmPasswordScreen/ConfirmPassword_EditScreen';
import EditPassword from './src/screens/ModifInfoScreen/EditPasswordScreen';
import RecommendScreen from './src/screens/RecommendScreen/RecommendScreen';
import RegistRecommendScreen from './src/screens/RecommendScreen/RegistRedommendScreen';
import RandomRecommendScreen from './src/screens/RecommendScreen/RandomRecommendScreen';
import CustomerServiceScreen from './src/screens/CustomerServiceScreen/CustomerServiceScreen';
import CommonProblemScreen from './src/screens/CustomerServiceScreen/CommonProblemScreen';
import OneProblemScreen from './src/screens/CustomerServiceScreen/OneProblemScreen';
import SettingScreen from './src/screens/SettingScreen/SettingScreen';
import CloseMembershipScreen from './src/screens/SettingScreen/CloseMembershipScreen';
import CloseConfirmPassword from './src/screens/SettingScreen/ConfirmPasswordScreen_Close';
import NotifyScreen from './src/screens/NotifyScreen/NotifyScreen';
import WalletScreen from './src/screens/WalletScreen';
import AdvertiseScreen from './src/screens/AdvertiseScreen/AdvertiseScreen';
import SendWalletScreen from './src/screens/SendWalletScreen';
import ShowAdScreen from './src/screens/AdvertiseScreen/ShowAdScreen';
import CompleteSend from './src/screens/CompleteSend';
import ConversionRequest from './src/screens/ConversionRequestWalletScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {console.log('Status Login  di Apps: ' + isLoggedIn)}
          <Stack.Screen name="First" component={FirstScreen} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="ARScreen" component={ARScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
          <Stack.Screen name="EmailVerif" component={EmailVerificationScreen} />
          <Stack.Screen name="ChooseRegion" component={ChooseRegionScreen} />
          <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          {/* Category -> Info */}
          <Stack.Screen name="InfoHome" component={InfoScreen} />
          <Stack.Screen name="AppInformation" component={AppInformation} />
          <Stack.Screen name="Clause" component={ClauseScreen} />
          <Stack.Screen name="ServiceClause" component={ServiceClause} />
          <Stack.Screen name="UsageClause" component={ClauseForUsage} />
          <Stack.Screen name="PersonalClause" component={ClauseForPersonal} />
          <Stack.Screen
            name="ConfirmPassword"
            component={ConfirmPasswordScreen}
          />
          <Stack.Screen
            name="ConfirmPasswordEdit"
            component={ConfirmPasswordEdit}
          />
          <Stack.Screen name="EditPassword" component={EditPassword} />
          <Stack.Screen name="ModifInfo" component={ModifInfoScreen} />
          <Stack.Screen name="Recommend" component={RecommendScreen} />
          <Stack.Screen
            name="RegistRecommend"
            component={RegistRecommendScreen}
          />
          <Stack.Screen
            name="RandomRecommend"
            component={RandomRecommendScreen}
          />
          <Stack.Screen
            name="CustomerService"
            component={CustomerServiceScreen}
          />
          <Stack.Screen name="CommonProblem" component={CommonProblemScreen} />
          <Stack.Screen name="OneProblem" component={OneProblemScreen} />
          <Stack.Screen name="Setting" component={SettingScreen} />
          <Stack.Screen name="CloseMember" component={CloseMembershipScreen} />
          <Stack.Screen name="CloseConfirm" component={CloseConfirmPassword} />
          <Stack.Screen name="NotifyHome" component={NotifyScreen} />
          <Stack.Screen name="AdvertiseHome" component={AdvertiseScreen} />

          {/* Wallet */}
          <Stack.Screen name="WalletHome" component={WalletScreen} />
          <Stack.Screen name="SendWallet" component={SendWalletScreen} />
          <Stack.Screen name="ShowAd" component={ShowAdScreen} />
          <Stack.Screen name="CompleteSend" component={CompleteSend} />
          <Stack.Screen
            name="ConversionRequest"
            component={ConversionRequest}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
