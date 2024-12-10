import React, {useState, useEffect} from 'react';
import {
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  BackHandler,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import ARScreen from '../ARScreen/ARScreen2';
import MapParent from './MapParentScreen';
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  URL_API_NODEJS,
  getFCMToken,
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
  sha256Encrypt,
  saveLogsDB,
  openWebWithEncryptedData,
  secretParams,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

export default function Home({route}) {
  const [lang, setLang] = useState({});
  const {sendActiveTab} = route.params || {};
  const {isLoggedIn} = useAuth();
  console.log('Status Login di Home : ' + isLoggedIn);
  const [activeTab, setActiveTab] = useState('Map');
  const isFocused = useIsFocused();
  const [countAds, setCountAds] = useState(0);
  const [showWallet, setShowWallet] = useState(false);
  const [ssidw, setSsidw] = useState('none');
  const [member, setMember] = useState('none');
  const [extrastr, setExtrastr] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const handleTabChange = tabName => {
    setActiveTab(tabName);
  };

  useEffect(() => {
    const getShowWalletStatus = async () => {
      try {
        const response = await fetch(`${URL_API_NODEJS}/ap1000-i01`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authcode}`,
          },
        });
        const data = await response.json();

        if (data.data.result == 1 && Platform.OS === 'ios') {
          setShowWallet(true);
        } else if (Platform.OS === 'android') {
          setShowWallet(true);
        }
      } catch (error) {
        console.error('Error get show wallet status: ', err);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    };

    const getIpAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const getIP = data?.ip.replace(/\./g, '') * 2;

        setIpAddress(getIP);
      } catch (error) {
        console.error('Error getting IP address:', error);
      }
    };

    getIpAddress(); // Get Public Address of User
    getShowWalletStatus(); // Get Show Wallet Status
  }, []);

  useEffect(() => {
    if (sendActiveTab) {
      console.log('Di Home Screen disuruh buka Tab -> ' + sendActiveTab);
      setActiveTab(sendActiveTab);
    }
  }, [sendActiveTab]);

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        // Set your language state
        setLang(screenLang);
      } catch (err) {
        console.error('Error in fetchData:', err);
      }
    };

    const getUserData = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userData = await AsyncStorage.getItem('userData');
        const responseUserData = JSON.parse(userData);

        saveLogsDB(
          '5000100',
          responseUserData?.member,
          `${userEmail} - User Entered Mainpage`,
          `User Entered Mainpage`,
        );

        const encryptedSession = await sha256Encrypt(
          responseUserData?.extrastr,
        );
        setSsidw(encryptedSession);
        setMember(responseUserData?.member);
        setExtrastr(responseUserData?.extrastr);
        const countResponse = await fetch(
          `${URL_API_NODEJS}/app5010-01-counter`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authcode}`,
            },
            body: JSON.stringify({
              member: responseUserData?.member,
            }),
          },
        );
        const dataCount = await countResponse.json();
        setCountAds(dataCount.data[0].count);

        console.log(`
          Email Bahloooolllll => ${userEmail}
          Data : ${userData}`);

        // Get Firebase Token
        if (isLoggedIn) {
          getFCMToken(fcmToken => {
            console.log(`FCMToken: ${fcmToken}`);
            const member = JSON.parse(userData).member;

            fetch(`${URL_API_NODEJS}/login-pushkeyreg`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authcode}`,
              },
              body: JSON.stringify({
                pushkey: fcmToken,
                member,
              }),
            })
              .then(response => response)
              .then(() => console.log('Success save pushkey to database'))
              .catch(err => {
                crashlytics().recordError(new Error(err));
                crashlytics().log(err);
              });
          });
        }
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchData(); // Get Language
    getUserData(); // Get User Data
  }, [isLoggedIn]);

  // User press back, show notif want exit app or not
  const handleBackPress = () => {
    if (isFocused) {
      Alert.alert('', 'Are you sure you want to exit the app?', [
        {
          text: 'CANCEL',
        },
        {
          text: 'OK',
          onPress: () => {
            BackHandler.exitApp();
          },
        },
      ]);
      return true;
    }

    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [isFocused]);

  const goToWalletsite = async () => {
    setIsLoading(true);

    try {
      const encryptedSession = await sha256Encrypt(extrastr);
      // console.log({extrastr, encryptedSession});

      const ssidwReq = await fetch(`${URL_API_NODEJS}/saveSsidw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          member,
          ssidw: encryptedSession,
        }),
      });

      const ssidwRes = await ssidwReq.json();

      // console.log(
      //   'https://www.xrun.run/react/login?numses=' + ssidw + '!' + ipAddress,
      // );

      if (ssidwRes) {
        Linking.openURL(
          'https://www.xrun.run/react/login?numses=' + ssidw + '!' + ipAddress,
        );
      } else {
        Linking.openURL(
          'https://www.xrun.run/react/login?numses=' + ssidw + '!' + ipAddress,
        );
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Failed', 'Server has error');
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabButton = (tabName, icon, text, onPress) => (
    <TouchableOpacity
      style={[styles.buttonTabItem]}
      onPress={() => {
        console.log('Pergi ke ' + tabName);
        if (tabName === 'Wallet') {
          if (Platform.OS === 'android') {
            navigation.dispatch(CommonActions.navigate('WalletHome'));
            // goToWalletsite();
          } else if (Platform.OS === 'ios' && showWallet) {
            goToWalletsite();
          } else if (!showWallet) {
            Linking.openURL('https://www.xrun.run/');
          } else {
            onPress();
          }
        } else {
          onPress();
        }
      }}
      disabled={
        Platform.OS === 'ios' && tabName === 'Wallet' && showWallet && isLoading
      }>
      {isLoading && tabName === 'Wallet' ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Image
          source={icon}
          resizeMode="contain"
          style={{
            width: 25,
            height: 25,
          }}
        />
      )}
      {tabName === 'Advertise' && countAds > 0 && (
        <View
          style={{
            backgroundColor: tabName === 'Advertise' ? 'green' : 'pink',
            width: 30,
            height: 30,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: -12,
            right: 8,
          }}>
          <Text
            style={{
              fontFamily: getFontFam() + 'Light',
              fontSize: fontSize('note'),
              color: 'white',
            }}>
            {countAds > 100 ? countAds : '99+'}
          </Text>
        </View>
      )}

      <Text style={styles.tabText}>{text}</Text>
    </TouchableOpacity>
  );

  if (isLoggedIn == undefined) {
    return null;
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      {isLoggedIn ? (
        <View style={styles.root}>
          {activeTab === 'Map' ? <MapParent /> : <ARScreen />}

          {/* Bottom Tab Navigator */}
          <View style={styles.bottomTabContainer}>
            {renderTabButton(
              'Wallet',
              showWallet
                ? require('../../../assets/images/icon_wallet.png')
                : require('../../../assets/images/icon_web.png'),
              showWallet
                ? lang && lang.screen_bottomTab && lang.screen_bottomTab.wallet
                  ? lang.screen_bottomTab.wallet.title
                  : 'Wallet'
                : 'Site',
              () => {
                if (showWallet) {
                  Linking.openURL(
                    'https://www.xrun.run/react/login?numses=' +
                      ssidw +
                      '!' +
                      member,
                  );
                } else {
                  Linking.openURL('https://www.xrun.run/');
                }
              },
            )}
            {renderTabButton(
              'Advertise',
              require('../../../assets/images/icon_advertisement.png'),
              lang && lang.screen_bottomTab && lang.screen_bottomTab.advertise
                ? lang.screen_bottomTab.advertise.title
                : 'Advertise',
              () => {
                navigation.dispatch(CommonActions.navigate('AdvertiseHome'));
              },
            )}

            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#343a59',
                borderRadius: 50,
                height: 50,
                width: 100,
                marginHorizontal: -5,
                alignSelf: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.5,
                shadowRadius: 5,
                elevation: 2,
              }}>
              {/* Map Button */}
              <TouchableOpacity
                style={[
                  {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 5,
                  },
                  activeTab === 'Map'
                    ? {
                        backgroundColor: '#ffdc04',
                        borderRadius: 50,
                      }
                    : {},
                ]}
                onPress={() => handleTabChange('Map')}>
                <Image
                  source={
                    activeTab === 'Map'
                      ? require('../../../assets/images/icon_map.png')
                      : require('../../../assets/images/icon_map_white.png')
                  }
                  resizeMode="contain"
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
              </TouchableOpacity>

              {/* Camera Button */}
              <TouchableOpacity
                style={[
                  {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 5,
                  },
                  activeTab === 'Camera'
                    ? {
                        backgroundColor: '#ffdc04',
                        borderRadius: 50,
                      }
                    : {},
                ]}
                onPress={() => handleTabChange('Camera')}>
                <Image
                  source={
                    activeTab === 'Camera'
                      ? require('../../../assets/images/icon_camera.png')
                      : require('../../../assets/images/icon_camera_white.png')
                  }
                  resizeMode="contain"
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
              </TouchableOpacity>
            </View>

            {renderTabButton(
              'Notify',
              require('../../../assets/images/icon_bell.png'),
              lang && lang.screen_bottomTab && lang.screen_bottomTab.notify
                ? lang.screen_bottomTab.notify.title
                : 'Notify',
              () => {
                navigation.dispatch(CommonActions.navigate('NotifyHome'));
              },
            )}
            {renderTabButton(
              'Info',
              require('../../../assets/images/icon_user.png'),
              lang && lang.screen_bottomTab && lang.screen_bottomTab.info
                ? lang.screen_bottomTab.info.title
                : 'Info',
              () => {
                navigation.dispatch(CommonActions.navigate('InfoHome'));
              },
            )}
          </View>
        </View>
      ) : (
        <Text
          style={{
            fontFamily: getFontFam() + 'Regular',
            fontSize: fontSize('body'),
            color: 'red',
            margin: 'auto',
          }}>
          You are not logged in.
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    zIndex: 1000,
  },
  buttonTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    position: 'relative',
  },
  bottomTabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    bottom: 0,
    position: 'absolute',
    zIndex: 100,
  },
  middleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#343a59',
    borderRadius: 50,
    height: 50,
    width: 100,
    marginHorizontal: -5,
    alignSelf: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
    }),
  },
  tabText: {
    fontFamily: getFontFam() + 'Medium',
    color: 'black',
    fontSize: fontSize('note'),
    marginBottom: -15,
  },
});
