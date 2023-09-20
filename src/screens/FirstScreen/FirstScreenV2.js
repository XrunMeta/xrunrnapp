import {
  Alert,
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Pressable,
  TouchableOpacity,
  FlatList,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';

const FirstScreenV2 = () => {
  const {height} = useWindowDimensions();
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const deviceLanguageLoggedRef = useRef(false);
  const [selfCoordinate, setSelfCoordinate] = useState(null);

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
    // <ScrollView showsVerticalScrollIndicator={false}>
    <View style={styles.root}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Dapatkan Rewardnya</Text>
        <Text style={styles.title}>Dan Ciptakan Momenmu!</Text>
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

      <CustomButton text="Log in" onPress={onSignIn} />
      <CustomButton
        text="Let's XRUN, Sign me up"
        type="SECONDARY"
        onPress={onJoin}
      />

      <View style={styles.descWrapper}>
        <Text style={styles.text}>
          Silakan baca{' '}
          <Text
            style={styles.link}
            onPress={() => {
              Linking.openURL('https://app.xrun.run/7011.html');
            }}>
            syarat & ketentuan
          </Text>{' '}
          serta{'\n'}
          <Text
            style={styles.link}
            onPress={() => {
              Linking.openURL('https://app.xrun.run/7013.html');
            }}>
            kebijakan privasi
          </Text>{' '}
          di bawah ini untuk mengetahui tentang fitur dan{' '}
          <Text
            style={styles.link}
            onPress={() => {
              Linking.openURL('https://app.xrun.run/7012.html');
            }}>
            penggunaan informasi
          </Text>{' '}
          yang disediakan oleh aplikasi ini.
        </Text>
      </View>
    </View>
    // </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
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
    fontSize: 23,
    color: '#343a59',
    fontFamily: 'Poppins-Bold',
  },
  sliderWrapper: {
    width: '100%',
  },
  sliderImage: {
    width: 351,
    height: 200,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sliderNavigator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
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
    fontSize: 15,
    lineHeight: 19,
  },

  link: {
    color: '#343a59',
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'underline',
    fontSize: 15,
    position: 'relative',
  },
});

export default FirstScreenV2;
