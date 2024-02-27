import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Linking,
  Platform,
  PermissionsAndroid,
  Dimensions,
  Modal,
  TouchableOpacity,
  BackHandler,
  Alert,
  SafeAreaView,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import React, {useState, useEffect} from 'react';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {getFontFam} from '../../../utils';

// Get Language Data

const FirstScreenV2 = ({navigation}) => {
  const [lang, setLang] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Get Map Initial Geolocation
  const getCurrentLocation = async () => {
    if (Platform.OS === 'ios') {
      // Meminta izin akses lokasi hanya untuk iOS
      Geolocation.requestAuthorization('whenInUse').then(result => {
        if (result === 'granted') {
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

  useEffect(() => {
    const checkIsLoggedIn = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn) {
        navigation.reset({routes: [{name: 'Home'}]});
        return;
      } else {
        // navigation.reset({routes: [{name: 'First'}]});
      }
    };

    checkIsLoggedIn();
  }, []);

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

  useEffect(() => {
    if (lang.popup) {
      Alert.alert(
        '',
        lang && lang.popup && lang.popup.notice ? lang.popup.notice : '',
        [
          {
            text:
              lang && lang.screen_wallet && lang.screen_wallet.confirm_alert
                ? lang.screen_wallet.confirm_alert
                : '',
          },
        ],
      );
    }
  }, [lang]);

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
          index % 2 === 1
            ? {marginHorizontal: 15, width: Dimensions.get('window').width - 55}
            : '',
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
          <FlatList
            data={images}
            renderItem={renderImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={event => {
              // Menghitung indeks gambar yang sedang aktif
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x /
                  event.nativeEvent.layoutMeasurement.width,
              );
              setActiveIndex(newIndex); // Set indeks gambar aktif
            }}
          />
          <View style={styles.sliderNavigator}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.sliderDot,
                  {
                    backgroundColor:
                      activeIndex === index ? '#343a59' : '#dcdcdc',
                  },
                ]}
              />
            ))}
          </View>
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
        />

        <View style={styles.descWrapper}>
          <Text style={styles.text}>
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[1] + ' '
              : ''}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL('https://app.xrun.run/7011.html');
              }}>
              {lang && lang.screen_first && lang.screen_first.terms
                ? lang.screen_first.terms
                : ''}
            </Text>{' '}
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[2]
              : ''}
            {'\n'}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL('https://app.xrun.run/7013.html');
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
                Linking.openURL('https://app.xrun.run/7012.html');
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
                        fontFamily: 'Roboto-Medium',
                        fontSize: 13,
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
                        fontFamily: 'Roboto-Medium',
                        fontSize: 13,
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
    marginVertical: 25,
  },
  title: {
    fontSize: 22,
    color: '#343a59',
    fontFamily: getFontFam() + 'Bold',
  },
  sliderWrapper: {
    flex: 1,
  },
  sliderImage: {
    flex: 1,
    flexShrink: 0,
    width: Dimensions.get('window').width - 40,
    height: '95%',
    borderRadius: 10,
  },
  sliderNavigator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  descWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
  },
  text: {
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#343a59',
  },
  link: {
    color: '#343a59',
    fontFamily: 'Roboto-Regular',
    textDecorationLine: 'underline',
    fontSize: 13,
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
    fontSize: 22,
    color: '#343a59',
    fontFamily: 'Roboto-Bold',
  },
  modalDescription: {
    fontSize: 13,
    color: 'black',
    fontFamily: 'Roboto-Regular',
    marginBottom: 20,
    textAlign: 'left',
  },
});

export default FirstScreenV2;
