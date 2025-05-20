import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FirstScreen from '../screens/FirstScreen';
import Home from '../screens/HomeScreen';
import ARScreen from '../screens/ARScreen/ARScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EmailAuthScreen from '../screens/EmailAuthScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import EmailVerificationLoginScreen from '../screens/EmailVerificationScreen/EmailVerificationLoginScreen';
import PhoneVerificationScreen from '../screens/EmailVerificationScreen/PhoneVerificationScreen';
import PhoneLoginScreen from '../screens/EmailVerificationScreen/PhoneLogin';
import ChooseRegionScreen from '../screens/ChooseRegionScreen';
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import SuccessJoinScreen from '../screens/EmailVerificationScreen/SuccessJoinScreen';
import SignPasswordScreen from '../screens/SignInScreen/SignPasswordScreen';
import PasswordMissedScreen from '../screens/EmailVerificationScreen/PasswordMissed';
import SignUpByEmailScreen from '../screens/EmailAuthScreen/SignUpByEmailScreen';
import SignUpCreatePassword from '../screens/EmailAuthScreen/SignUpCreatePasswordScreen';
import SignUpCreateGender from '../screens/EmailAuthScreen/SignUpCreateGenderScreen';
import SignUpCreateName from '../screens/EmailAuthScreen/SignUpCreateNameScreen';
import InfoScreen from '../screens/InfoScreen/InfoScreen';
import AppInformation from '../screens/AppInformation/AppInformation';
import ClauseScreen from '../screens/ClauseScreen/ClauseScreen';
import ServiceClause from '../screens/ServiceClauseScreen/ServiceClause';
import ClauseForPersonal from '../screens/ClauseForPersonal/ClauseForPersonal';
import ClauseForUsage from '../screens/ClauseForUsage/ClauseForUsage';
import ConfirmPasswordScreen from '../screens/ConfirmPasswordScreen';
import ConfirmPasswordEdit from '../screens/ConfirmPasswordScreen/ConfirmPassword_EditScreen';
import EditPassword from '../screens/ModifInfoScreen/EditPasswordScreen';
import ModifInfoScreen from '../screens/ModifInfoScreen';
import RecommendScreen from '../screens/RecommendScreen/RecommendScreen';
import RegistRecommendScreen from '../screens/RecommendScreen/RegistRedommendScreen';
import RandomRecommendScreen from '../screens/RecommendScreen/RandomRecommendScreen';
import CustomerServiceScreen from '../screens/CustomerServiceScreen/CustomerServiceScreen';
import CommonProblemScreen from '../screens/CustomerServiceScreen/CommonProblemScreen';
import OneProblemScreen from '../screens/CustomerServiceScreen/OneProblemScreen';
import SettingScreen from '../screens/SettingScreen/SettingScreen';
import CloseMembershipScreen from '../screens/SettingScreen/CloseMembershipScreen';
import CloseConfirmPassword from '../screens/SettingScreen/ConfirmPasswordScreen_Close';
import NotifyScreen from '../screens/NotifyScreen/NotifyScreen';
import AdvertiseScreen from '../screens/AdvertiseScreen/AdvertiseScreen';
import WalletScreen from '../screens/WalletScreen';
import SendWalletScreen from '../screens/SendWalletScreen';
import ShowAdScreen from '../screens/AdvertiseScreen/ShowAdScreen';
import CompleteSend from '../screens/CompleteSend';
import CompleteExchange from '../screens/CompleteExchange';
import Change from '../screens/ChangeWalletScreen';
import {View} from 'react-native';
import CompleteConversion from '../screens/CompleteConversion';
import SuccessCloseMembership from '../screens/SettingScreen/SuccessCloseMembership';
import Exchange from '../screens/ExchangeWalletScreen';
import SplashScreen from '../screens/SplashScreen/SplashScreen';
import IOSWallet from '../screens/WalletScreen/IOSWallet';
import EmailVerifForModifScreen from '../screens/ModifInfoScreen/EmailVerifForModifScreen';
import EmailCodeForModif from '../screens/ModifInfoScreen/EmailCodeForModifScreen';
import EmailCodeForModifNumberScreen from '../screens/ModifInfoScreen/EmailCodeForModifNumberScreen';
import PhoneModifScreen from '../screens/ModifInfoScreen/PhoneModifScreen';
import KeyDownload from '../screens/KeyDownloadScreen';
import KeyDownloadAuthScreen from '../screens/KeyDownloadScreen/KeyDownloadAuthScreen';
import KeyShowDownload from '../screens/KeyDownloadScreen/KeyShowDownload';
import RecommendByMeScreen from '../screens/RecommendScreen/RecommendByMeScreen';
import ShopScreen from '../screens/ShopScreen/ShopScreen';
import IndividualAdsScreen from '../screens/IndividualAdsScreen/IndividualAdsScreen';
import FirstNewAdsScreen from '../screens/IndividualAdsScreen/NewAdsScreen/FirstNewAdsScreen';
import SelectAreaNewAdsScreen from '../screens/IndividualAdsScreen/NewAdsScreen/SelectAreaNewAdsScreen';
import AdsDetailScreen from '../screens/IndividualAdsScreen/AdsPurchaseScreen/AdsDetailScreen';
import AdsCompletePurchase from '../screens/IndividualAdsScreen/AdsPurchaseScreen/AdsCompletePurchaseScreen';
import ManageAdsScreen from '../screens/IndividualAdsScreen/ManageAdsScreen/ManageAdsScreen';
import WalletDetailScreen from '../screens/WalletScreen/WalletDetail';
import TransactionDetailScreen from '../screens/WalletScreen/TxDetail';

export default Router = () => {
  const Stack = createNativeStackNavigator();

  return (
    <View style={{flex: 1}}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="First" component={FirstScreen} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ARScreen" component={ARScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
        <Stack.Screen name="EmailVerif" component={EmailVerificationScreen} />
        <Stack.Screen
          name="EmailVerifLogin"
          component={EmailVerificationLoginScreen}
        />
        <Stack.Screen name="PhoneVerif" component={PhoneVerificationScreen} />
        <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
        <Stack.Screen name="ChooseRegion" component={ChooseRegionScreen} />
        <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
        <Stack.Screen name="SuccessJoin" component={SuccessJoinScreen} />
        <Stack.Screen name="SignPassword" component={SignPasswordScreen} />
        <Stack.Screen name="PasswordMissed" component={PasswordMissedScreen} />
        <Stack.Screen name="SignupByEmail" component={SignUpByEmailScreen} />
        <Stack.Screen
          name="SignupCreatePassword"
          component={SignUpCreatePassword}
        />
        <Stack.Screen name="SignupCreateName" component={SignUpCreateName} />
        <Stack.Screen
          name="SignupCreateGender"
          component={SignUpCreateGender}
        />

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
        <Stack.Screen
          name="EmailVerifForModif"
          component={EmailVerifForModifScreen}
        />
        <Stack.Screen
          name="EmailCodeForModifNumber"
          component={EmailCodeForModifNumberScreen}
        />
        <Stack.Screen name="EmailCodeForModif" component={EmailCodeForModif} />
        <Stack.Screen name="PhoneModif" component={PhoneModifScreen} />
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
        <Stack.Screen name="RecommendByMe" component={RecommendByMeScreen} />
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
        <Stack.Screen name="ShopHome" component={ShopScreen} />
        <Stack.Screen
          name="SuccessCloseMembership"
          component={SuccessCloseMembership}
        />

        {/* Wallet */}
        <Stack.Screen name="WalletHome" component={WalletScreen} />
        <Stack.Screen name="WalletDetail" component={WalletDetailScreen} />
        <Stack.Screen name="IOSWallet" component={IOSWallet} />
        <Stack.Screen name="SendWallet" component={SendWalletScreen} />
        <Stack.Screen name="ShowAd" component={ShowAdScreen} />
        <Stack.Screen name="CompleteSend" component={CompleteSend} />
        <Stack.Screen name="CompleteExchange" component={CompleteExchange} />
        <Stack.Screen name="Change" component={Change} />
        <Stack.Screen name="Exchange" component={Exchange} />
        <Stack.Screen
          name="CompleteConversion"
          component={CompleteConversion}
        />
        <Stack.Screen name="KeyDownload" component={KeyDownload} />
        <Stack.Screen
          name="KeyDownloadAuth"
          component={KeyDownloadAuthScreen}
        />
        <Stack.Screen name="KeyShowDownload" component={KeyShowDownload} />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetailScreen}
        />

        {/* Individual Ads */}
        <Stack.Screen name="IndAds" component={IndividualAdsScreen} />
        <Stack.Screen name="NewIndAds" component={FirstNewAdsScreen} />
        <Stack.Screen
          name="SelectAreaIndAds"
          component={SelectAreaNewAdsScreen}
        />
        <Stack.Screen name="IndAdsDetail" component={AdsDetailScreen} />
        <Stack.Screen
          name="IndAdsCompletePurchase"
          component={AdsCompletePurchase}
        />
        <Stack.Screen name="ManageIndAds" component={ManageAdsScreen} />
      </Stack.Navigator>
    </View>
  );
};
