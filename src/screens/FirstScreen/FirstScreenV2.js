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
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';

// Get Language Data
const langData = require('../../../lang.json');

const FirstScreenV2 = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Get Map Initial Geolocation
  const getCurrentLocation = async () => {
    if (Platform.OS === 'ios') {
      // Meminta izin akses lokasi hanya untuk iOS
      Geolocation.requestAuthorization('whenInUse').then(result => {
        if (result === 'granted') {
          // Izin diberikan, dapatkan koordinat
          Geolocation.getCurrentPosition(
            position => {
              const latitude = position.coords.latitude;
              const longitude = position.coords.longitude;
            },
            error => {
              console.error(error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        }
      });
    } else if (Platform.OS === 'android') {
      // Meminta izin akses lokasi di Android
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Lokasi',
            message:
              'Aplikasi memerlukan izin akses lokasi untuk fungsi tertentu.',
            buttonPositive: 'Izinkan',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
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
            },
            error => {
              console.error(error);
            },
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
          );
        } else {
          // Izin ditolak, beri tahu pengguna atau lakukan tindakan lain
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

    const selectedLanguage = deviceLanguage === 'id' ? 'id' : 'eng';
    const language = langData[selectedLanguage];
    setLang(language);
  }, []);

  const onSignIn = () => {
    navigation.navigate('SignIn');
  };

  const onJoin = () => {
    navigation.navigate('SignUp');
  };

  const onJoinMobile = () => {
    navigation.navigate('SignUp');
  };

  const onResetPressed = () => {
    navigation.navigate('ForgotPassword');
  };

  const images = [
    require('../../../assets/images/image_firstSlider1.png'),
    require('../../../assets/images/image_firstSlider2.png'),
    require('../../../assets/images/image_firstSlider3.png'),
  ];

  const renderImage = ({item}) => (
    <Image source={item} style={styles.sliderImage} resizeMode="cover" />
  );

  return (
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
    </View>
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
    fontFamily: 'Poppins-Bold',
  },
  sliderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderImage: {
    width: Dimensions.get('window').width * 0.86, // 86% width of screen
    height: '95%',
    borderRadius: 10,
    marginHorizontal: 5,
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
    marginTop: 30,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#343a59',
  },
  link: {
    color: '#343a59',
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'underline',
    fontSize: 13,
    position: 'relative',
  },
});

export default FirstScreenV2;
