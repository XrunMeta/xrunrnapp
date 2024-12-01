import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Modal,
  Platform,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Logo from '../../../assets/images/xrun_round.png';
import crashlytics from '@react-native-firebase/crashlytics';
import VersionCheck from 'react-native-version-check';
import Geolocation from 'react-native-geolocation-service';
import {fontSize, getFontFam} from '../../../utils';

const SplashScreen = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isPopupUpdateVersionShow, setIsPopupUpdateVersionShow] =
    useState(false);

  useEffect(() => {
    crashlytics().log('App mounted Lagi');

    // Check current version app and playstore version
    const checkLatestVersion = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

      const provider = Platform.OS === 'ios' ? 'appStore' : 'playStore';

      // Using this package for check version: https://github.com/kimxogus/react-native-version-check
      VersionCheck.getLatestVersion({provider}).then(latestVersion => {
        const currentVersion = VersionCheck.getCurrentVersion();
        console.log(
          `Current version app: ${currentVersion} || ${provider} version app: ${latestVersion}`,
        );

        if (currentVersion < latestVersion) {
          setIsPopupUpdateVersionShow(true);
        } else {
          if (isLoggedIn) {
            navigation.reset({routes: [{name: 'Home'}]});
          } else {
            navigation.reset({index: 0, routes: [{name: 'First'}]});
          }
        }
      });
    };

    checkLatestVersion();
  }, []);

  // Get Map Initial Geolocation
  const getCurrentLocation = async () => {
    if (Platform.OS === 'ios') {
      // Meminta izin akses lokasi hanya untuk iOS
      Geolocation.requestAuthorization('whenInUse').then(result => {
        if (result === 'granted') {
          console.log('Lokasi iOS diijinin boy');
          // Izin diberikan, dapatkan koordinat
          Geolocation.getCurrentPosition(
            position => {
              // Set To AsyncStorage => selfCoordinate
              AsyncStorage.setItem(
                'selfCoordinate',
                JSON.stringify({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                }),
              ).catch(err => {
                console.error('Error saving location: ', err);
              });

              var jams = JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });

              console.log('FSV2' + jams);
            },
            error => {
              console.error(error);
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
          );
        } else {
          // Izin ditolak, beri tahu pengguna atau lakukan tindakan lain
          setModalVisible(true);
        }
      });
    } else if (Platform.OS === 'android') {
      // Meminta izin akses lokasi di Android
      console.log('Android bro');
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Lokasi Android diijinin boy');
          // Izin diberikan, dapatkan koordinat
          Geolocation.getCurrentPosition(
            position => {
              // Set To AsyncStorage => selfCoordinate
              AsyncStorage.setItem(
                'selfCoordinate',
                JSON.stringify({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                }),
              ).catch(err => {
                console.error('Error saving location: ', err);
              });

              var jams = JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });

              console.log('FSV2' + jams);
            },
            error => {
              console.error(error);
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
          );
        } else {
          // Izin ditolak, beri tahu pengguna atau lakukan tindakan lain
          setModalVisible(true);
        }
      } catch (error) {
        console.error(error);
        console.log('error bro');
      }
    }
  };

  // Panggil fungsi ini saat Anda ingin mendapatkan koordinat
  getCurrentLocation();

  const exitApp = () => {
    BackHandler.exitApp();
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const doUpdate = () => {
    const storeUrl =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/kr/app/xrun-go/id6502924173'
        : 'https://play.google.com/store/apps/details?id=run.xrun.xrunapp';

    Linking.openURL(storeUrl);
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image source={Logo} />
      </View>

      {/* Popup check the app using latest version or not */}
      {isPopupUpdateVersionShow && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isPopupUpdateVersionShow}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalCard, {paddingVertical: 20}]}>
              <Text style={styles.modalTitle}>
                We have new version at{' '}
                {Platform.OS === 'ios' ? 'Appstore' : 'Playstore'}
              </Text>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={doUpdate}
                  style={{
                    marginTop: 24,
                    backgroundColor: '#ffdc04',
                    padding: 10,
                    width: 120,
                    borderRadius: 6,
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: getFontFam() + 'Medium',
                      fontSize: fontSize('subtitle'),
                      textAlign: 'center',
                    }}>
                    Update
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {modalVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Notice</Text>
              <Text style={styles.modalDescription}>
                You may use this app with permission required.
              </Text>
              <View
                style={{
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  alignSelf: 'flex-end',
                  gap: 10,
                  marginTop: 10,
                }}>
                <TouchableOpacity onPress={exitApp}>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: getFontFam() + 'Medium',
                      fontSize: fontSize('body'),
                      textAlign: 'right',
                      paddingLeft: 10,
                    }}>
                    Exit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openAppSettings}>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: getFontFam() + 'Medium',
                      fontSize: fontSize('body'),
                      textAlign: 'right',
                      paddingLeft: 10,
                    }}>
                    Device Authorization Letter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'left',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  modalTitle: {
    fontSize: fontSize('title'),
    color: '#343a59',
    fontFamily: getFontFam() + 'Bold',
  },
  modalDescription: {
    fontSize: fontSize('body'),
    color: 'black',
    fontFamily: getFontFam() + 'Regular',
    marginBottom: 20,
    textAlign: 'left',
  },
});

export default SplashScreen;
