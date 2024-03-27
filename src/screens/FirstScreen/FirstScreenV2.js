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
  Button,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import React, {useState, useEffect} from 'react';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {getFontFam} from '../../../utils';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import crashlytics from '@react-native-firebase/crashlytics';

async function adul(user) {
  crashlytics().log('Tes Pagi');
  await Promise.all([
    crashlytics().setUserId(user.uid),
    crashlytics().setAttribute('credits', String(user.credits)),
    crashlytics().setAttributes({
      role: 'admin',
      followers: '13',
      email: user.email,
      username: user.username,
    }),
  ]);
  console.log('Bgst');
}

const FirstScreenV2 = ({navigation}) => {
  const [lang, setLang] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const {width} = Dimensions.get('window');
  const itemWidth = width - 30;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    crashlytics().log('App mounted Lagi');
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

        {/* <Button
          title="Crashed me!"
          onPress={() =>
            adul({
              uid: 'Aa0Bb1Cc2Dd3Ee4Ff5Gg6Hh7Ii8Jj9',
              username: 'Joaquin Phoenix',
              email: 'herubudi@example.com',
              credits: 12,
            })
          }
        />
        <Button title="Test Crash" onPress={() => crashlytics().crash()} /> */}

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
              width: 10,
              height: 10,
              borderRadius: 5,
              marginHorizontal: -2,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }} // Gaya titik pagination yang aktif
            inactiveDotStyle={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: -2,
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
                        fontFamily: getFontFam() + 'Medium',
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
                        fontFamily: getFontFam() + 'Medium',
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
    fontFamily: getFontFam() + 'Regular',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#343a59',
  },
  link: {
    color: '#343a59',
    fontFamily: getFontFam() + 'Regular',
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
    fontFamily: getFontFam() + 'Bold',
  },
  modalDescription: {
    fontSize: 13,
    color: 'black',
    fontFamily: getFontFam() + 'Regular',
    marginBottom: 20,
    textAlign: 'left',
  },
});

export default FirstScreenV2;
