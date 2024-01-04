import React, {useState, useEffect} from 'react';
import {
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import ARScreen from '../ARScreen/ARScreen';
import MapParent from './MapParentScreen';
import TestCam from '../ARScreen/testCam';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';

export default function Home({route}) {
  const [lang, setLang] = useState({});
  const {sendActiveTab} = route.params || {};
  const {isLoggedIn} = useAuth();
  console.log('Status Login di Home : ' + isLoggedIn);
  const [activeTab, setActiveTab] = useState('Map');
  const [openScreen, setOpenScreen] = useState();
  const [popupNotif, setPopupNotif] = useState(true);

  const navigation = useNavigation();

  const handleTabChange = tabName => {
    setActiveTab(tabName);
  };

  useEffect(() => {
    if (sendActiveTab) {
      console.log('Di Home Screen disuruh buka Tab -> ' + sendActiveTab);
      setActiveTab(sendActiveTab);
    }
  }, [sendActiveTab]);

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        let langData;

        switch (currentLanguage) {
          case 'id':
            langData = require('../../../languages/id.json');
            break;
          case 'en':
            langData = require('../../../languages/en.json');
            break;
          case 'ko':
            langData = require('../../../languages/ko.json');
            break;
          case 'zh':
            langData = require('../../../languages/zh.json');
            break;
          default:
            langData = require('../../../languages/en.json');
            break;
        }

        const language = langData;
        setLang(language);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage();

    const getUserData = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');

        const apiUrl = `${URL_API}&act=login-01&email=${userEmail}&tp=6`;
        const response = await fetch(apiUrl);
        const userData = await response.json();

        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        console.log(`
        Email Bahloooolllll => ${userEmail}
        Data : ${JSON.stringify(userData)}`);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getUserData(); // Get Language
  }, [isLoggedIn]);

  const renderTabButton = (tabName, icon, text, onPress) => (
    <TouchableOpacity
      style={[
        styles.buttonTabItem,
        // {backgroundColor: activeTab === tabName ? '#ffdc04' : 'transparent'},
      ]}
      onPress={() => {
        console.log('Pergi ke ' + tabName);
        onPress();
      }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{
          width: 25,
          height: 25,
          // tintColor: activeTab === tabName ? 'black' : '#343a59',
        }}
      />
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
              require('../../../assets/images/icon_wallet.png'),
              'Wallet',
              () => {
                navigation.navigate('WalletHome');
              },
            )}
            {renderTabButton(
              'Advertise',
              require('../../../assets/images/icon_advertisement.png'),
              'Advertise',
              () => {
                navigation.navigate('AdvertiseHome');
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
              'Notify',
              () => {
                navigation.navigate('NotifyHome');
              },
            )}
            {renderTabButton(
              'Info',
              require('../../../assets/images/icon_user.png'),
              'Info',
              () => {
                navigation.navigate('InfoHome');
              },
            )}
          </View>
        </View>
      ) : (
        <Text>You are not logged in.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  buttonTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  bottomTabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    bottom: 0,
    position: 'absolute',
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
    fontFamily: 'Poppins-Medium',
    color: 'black',
    fontSize: 10.5,
    marginBottom: -15,
  },
});
