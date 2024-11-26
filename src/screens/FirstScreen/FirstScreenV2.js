import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  Platform,
  PermissionsAndroid,
  Dimensions,
  Modal,
  TouchableOpacity,
  BackHandler,
  SafeAreaView,
  Button,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import React, {useState, useEffect} from 'react';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {fontSize, getFontFam, saveLogsDB} from '../../../utils';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import crashlytics from '@react-native-firebase/crashlytics';
import VersionCheck from 'react-native-version-check';

const FirstScreenV2 = ({navigation}) => {
  const [lang, setLang] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const {width} = Dimensions.get('window');
  const itemWidth = width - 30;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPopupUpdateVersionShow, setIsPopupUpdateVersionShow] =
    useState(false);
  const [currLanguage, setCurrLanguage] = useState('id');

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
          }
        }
      });
    };

    checkLatestVersion();
    saveLogsDB(
      '5000010',
      0,
      'User open app',
      'User open app and see first screen',
    );
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
      }
    }
  };

  // Panggil fungsi ini saat Anda ingin mendapatkan koordinat
  getCurrentLocation();

  const setCurrentLanguage = async language => {
    try {
      // Simpan bahasa yang digunakan ke dalam AsyncStorage
      await AsyncStorage.setItem('currentLanguage', language);
      console.log('Bahasa saat ini disimpan: ', language);
    } catch (error) {
      console.error(
        'Error saat menyimpan bahasa ke dalam AsyncStorage: ',
        error,
      );
    }
  };

  useEffect(() => {
    const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
    setCurrentLanguage(deviceLanguage);
    setCurrLanguage(deviceLanguage);
    let langData;

    switch (deviceLanguage) {
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
  }, []);

  const onSignIn = () => {
    navigation.navigate('SignIn');
  };

  const onJoin = () => {
    navigation.navigate('SignUp');
  };

  const images = [
    require('../../../assets/images/image_firstSlider1.png'),
    require('../../../assets/images/image_firstSlider2.png'),
    require('../../../assets/images/image_firstSlider3.png'),
  ];

  const renderImage = ({item, index}) => {
    return (
      <Image
        source={item}
        style={[
          styles.sliderImage,
          {
            width: Dimensions.get('window').width - 45,
            alignSelf: 'center',
          },
        ]}
        resizeMode="cover"
      />
    );
  };

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
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.root}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_first && lang.screen_first.title
              ? lang.screen_first.title[1]
              : ''}
          </Text>
          <Text style={[styles.title, {marginTop: -5}]}>
            {lang && lang.screen_first && lang.screen_first.title
              ? lang.screen_first.title[2]
              : ''}
          </Text>
        </View>

        <View style={styles.sliderWrapper}>
          <Carousel
            layout={'default'}
            data={images}
            renderItem={renderImage}
            sliderWidth={width}
            itemWidth={itemWidth} // Atur lebar item sesuai dengan perhitungan di atas
            onSnapToItem={index => setActiveIndex(index)} // Fungsi untuk mengubah indeks item aktif saat digulir
          />
          {/* Pagination */}
          <Pagination
            dotsLength={images.length} // Jumlah titik di pagination
            activeDotIndex={activeIndex} // Indeks titik aktif
            containerStyle={{paddingBottom: 0, paddingTop: 15}} // Gaya kontainer pagination
            dotStyle={{
              width: 8,
              height: 8,
              borderRadius: 5,
              marginHorizontal: -20,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }} // Gaya titik pagination yang aktif
            inactiveDotStyle={{
              width: 5,
              height: 5,
              borderRadius: 4,
              marginHorizontal: -20,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }} // Gaya titik pagination yang tidak aktif
            inactiveDotOpacity={0.4} // Opasitas titik pagination yang tidak aktif
            inactiveDotScale={0.6} // Skala titik pagination yang tidak aktif
          />
        </View>

        <CustomButton
          text={
            lang && lang.screen_first && lang.screen_first.login
              ? lang.screen_first.login
              : ''
          }
          onPress={onSignIn}
          firstScreen
        />
        <CustomButton
          text={
            lang && lang.screen_first && lang.screen_first.signUp
              ? lang.screen_first.signUp
              : ''
          }
          type="SECONDARY"
          onPress={onJoin}
          firstScreen
        />

        <View style={styles.descWrapper}>
          <Text style={styles.text}>
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[1] + ' '
              : ''}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL(
                  currLanguage === 'id'
                    ? 'https://app.xrun.run/7011.html'
                    : `https://app.xrun.run/7011-${currLanguage}.html`,
                );
              }}>
              {lang && lang.screen_first && lang.screen_first.terms
                ? lang.screen_first.terms
                : ''}
            </Text>{' '}
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[2]
              : ''}{' '}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL(
                  currLanguage === 'id'
                    ? 'https://app.xrun.run/7013.html'
                    : `https://app.xrun.run/7013-${currLanguage}.html`,
                );
              }}>
              {lang && lang.screen_first && lang.screen_first.privacy
                ? lang.screen_first.privacy
                : ''}
            </Text>{' '}
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[3] + ' '
              : ''}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL(
                  currLanguage === 'id'
                    ? 'https://app.xrun.run/7012.html'
                    : `https://app.xrun.run/7012-${currLanguage}.html`,
                );
              }}>
              {lang && lang.screen_first && lang.screen_first.information
                ? lang.screen_first.information
                : ''}
            </Text>{' '}
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[4] + ' '
              : ''}
          </Text>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    position: 'relative',
  },

  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f4f5',
  },
  containContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  titleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: fontSize('title'),
    color: '#343a59',
    fontFamily: getFontFam() + 'Bold',
  },
  sliderWrapper: {
    flex: 1,
    marginBottom: 8,
  },
  sliderImage: {
    flex: 1,
    // width: Dimensions.get('window').width,
    height: '95%',
    borderRadius: 10,
  },
  sliderNavigator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  descWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: 35,
    marginBottom: 20,
  },
  text: {
    fontFamily: getFontFam() + 'Regular',
    textAlign: 'center',
    fontSize: fontSize('body'),
    lineHeight: 14,
    color: '#343a59',
  },
  link: {
    color: '#343a59',
    fontFamily: getFontFam() + 'Regular',
    textDecorationLine: 'underline',
    fontSize: fontSize('body'),
    position: 'relative',
  },
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

export default FirstScreenV2;
