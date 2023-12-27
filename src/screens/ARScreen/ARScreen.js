import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Linking,
  TouchableOpacity,
  Image,
  ImageBackground,
  Text,
  Dimensions,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {URL_API} from '../../../utils';
import RNRestart from 'react-native-restart';

function ARScreen() {
  const [isCameraReady, setCameraReady] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('pending');
  const device = useCameraDevice('back');
  const [coins, setCoins] = useState([]);
  const [coinAPI, setCoinAPI] = useState([]);
  const bouncingCoinTranslateY = useSharedValue(-250);
  const blinkOpacity = useSharedValue(1);
  const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');
  const COIN_WIDTH = 150; // Ganti dengan lebar gambar koin Anda
  const COIN_HEIGHT = 275; // Ganti dengan tinggi gambar koin Anda
  const [userData, setUserData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [flash, setFlash] = useState('on');
  const [catchShow, setCatchShow] = useState(0);

  const jsonData = [
    {id: 1, data: 'Data 1'},
    {id: 2, data: 'Data 2'},
    {id: 3, data: 'Data 3'},
    {id: 4, data: 'Data 4'},
    {id: 5, data: 'Data 5'},
    {id: 6, data: 'Data 6'},
    {id: 7, data: 'Data 7'},
    {id: 8, data: 'Data 8'},
    {id: 9, data: 'Data 9'},
    {id: 10, data: 'Data 10'},
    {id: 11, data: 'Data 11'},
    {id: 12, data: 'Data 12'},
  ];

  const getCamPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message:
            'XRUN needs access to your camera ' +
            'so you can enjoy AR and Catch the Coin!',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Kamera diijinin boy');

        setCameraReady(true);
        setCameraPermission('granted');
      } else {
        // RNRestart.restart();
        // setCameraPermission('denied');
        console.log('Kamera ga diizinin');
        Linking.openSettings();
      }
    } catch (error) {
      console.error(error);
    }
  };

  getCamPermission();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        setUserData(JSON.parse(storedUserData));
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getUserData();
  }, []);

  // Coordinate User Listener
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        // Get user Coordinate
        const userCoordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(userCoordinate);

        console.log(`
            Lat : ${userCoordinate.latitude}
            Lng : ${userCoordinate.longitude}
          `);
      },
      error => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    // Update AR Coin from API
    if (userLocation && userData) {
      const {latitude, longitude} = userLocation;
      getARCoin(userData.member, latitude, longitude);
    }
  }, [userLocation, userData]);

  // Get API for Showing Coin Object
  const getARCoin = async (userID, latitude, longitude) => {
    try {
      const apiUrl = `${URL_API}&act=app2000-01&member=${userID}&limit=20&lat=${latitude}&lng=${longitude}`;
      const response = await fetch(apiUrl);
      const responseData = await response.json();

      if (responseData.data && responseData.data.length > 0) {
        const coinsData = responseData.data.map(item => ({
          lat: item.lat,
          lng: item.lng,
          title: item.title,
          distance: item.distance,
          adthumbnail2: item.adthumbnail2,
          adthumbnail: item.adthumbnail,
          coins: item.coins,
          symbol: item.symbol,
          coin: item.coin,
          advertisement: item.advertisement,
          cointype: item.cointype,
          adcolor1: item.adcolor1,
          brand: item.brand,
          isbigcoin: item.isbigcoin,
        }));

        setCoinAPI(coinsData);
        console.log('Hasil API ada -> ' + coinsData.length);
      } else {
        setCoinAPI([]);
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  };

  const clickedCoin = item => {
    console.log('Coin Clicked -> ', item);
  };

  const animateBouncingCoin = () => {
    bouncingCoinTranslateY.value = withRepeat(
      withSpring(10, {
        mass: 2.1,
        damping: 10,
        stiffness: 192,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        reduceMotion: Easing.bounce,
      }),
      -1,
      true,
    );
  };

  const animateBlink = () => {
    blinkOpacity.value = withRepeat(
      withSpring(0, {duration: 500}),
      -1,
      true,
      (_, isFinished) => {
        if (isFinished) {
          blinkOpacity.value = 1; // Setel kembali opacity ke nilai awal setelah selesai
        }
      },
    );
  };

  useEffect(() => {
    let currentIndex = 0;

    const displayItems = () => {
      const shuffledData = [...coinAPI].sort(() => Math.random() - 0.5);

      const displayCount = Math.min(
        shuffledData.length - currentIndex,
        Math.floor(Math.random() * 5) + 1,
      );

      const itemsToDisplay = shuffledData
        .slice(currentIndex, currentIndex + displayCount)
        .map(item => ({
          ...item,
          position: {
            x: Math.random() * (WINDOW_WIDTH - COIN_WIDTH),
            y: Math.random() * (WINDOW_HEIGHT - COIN_HEIGHT),
          },
        }));

      setCoins(itemsToDisplay);

      // Animasikan setiap koin
      animateBouncingCoin();

      // Mulai animasi blink setiap kali koin berubah
      animateBlink();

      setTimeout(() => {
        setCoins([]);
        bouncingCoinTranslateY.value = -250;
        blinkOpacity.value = 1;
      }, 3000);

      currentIndex = (currentIndex + displayCount) % shuffledData.length;
    };

    const intervalId = setInterval(displayItems, 4000);

    // Hentikan interval ketika komponen di-unmount
    return () => {
      clearInterval(intervalId);
      // bouncingCoinTranslateY.value = -250;
      // blinkOpacity.value = 1;
    };
  }, [coinAPI, coins]); // Perubahan coins ditambahkan di sini

  const bouncingCoinAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: bouncingCoinTranslateY.value}],
    };
  });

  const blinkAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: blinkOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {cameraPermission === 'granted' && isCameraReady && device && (
          <>
            <Camera
              fps={25}
              torch={flash === 'on' ? 'on' : 'off'}
              onInitialized={() => setTimeout(() => setFlash('off'), 1000)}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
              device={device}
              isActive={true}
              lowLightBoost={false}
            />
            <View
              style={{
                position: 'absolute',
                // backgroundColor: '#001a477a',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}>
              {coins.map((item, index) => (
                <Animated.View
                  key={item.coin}
                  style={[
                    {
                      position: 'absolute',
                      left: item.position.x,
                      top: item.position.y,
                      width: 150,
                      height: 275,
                    },
                    bouncingCoinAnimatedStyle,
                  ]}>
                  <TouchableOpacity onPress={() => clickedCoin('Jamal')}>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {item.distance < 30 && (
                        <>
                          {/* {(() => {
                            if (catchShow == 3) {
                              console.log('Udah 3');
                            } else {
                              setCatchShow(catchShow + 1);
                              console.log('Belummmmmm -> ' + catchShow);
                            }
                          })()} */}
                          <Animated.Image
                            source={require('../../../assets/images/icon_catch.png')}
                            style={[
                              {
                                resizeMode: 'contain',
                                height: 140,
                                width: 140,
                              },
                              blinkAnimatedStyle,
                            ]}
                          />
                        </>
                      )}
                      <ImageBackground
                        source={require('../../../assets/images/image_arcoin_wrapper.png')}
                        style={{
                          resizeMode: 'contain',
                          height: 155,
                          width: 114,
                          marginTop: -30,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Image
                          source={require('../../../assets/images/logo_xrun.png')}
                          style={{
                            height: 50,
                            width: 50,
                            marginTop: -35,
                          }}
                        />
                        <Text
                          style={{
                            fontFamily: 'Poppins-SemiBold',
                            fontSize: 16,
                            color: 'white',
                          }}>
                          {/* 0.05XRUN */}
                          {item.coins}
                          {item.title}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Poppins-Regular',
                            fontSize: 13,
                            color: 'grey',
                            marginTop: -7,
                          }}>
                          {/* 2M */}
                          {item.distance}M
                        </Text>
                      </ImageBackground>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </>
        )}
        {cameraPermission === 'denied' && (
          <View style={styles.permissionDeniedContainer}>
            <Text style={styles.permissionDeniedText}>
              Please allow access to the camera to continue.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#051C60',
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 5,
                elevation: 3,
              }}
              onPress={() => getCamPermission()}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  marginBottom: -3,
                  color: 'white',
                }}>
                Allow Camera
              </Text>
            </TouchableOpacity>
            {console.log('Status Kamera -> ' + cameraPermission)}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionDeniedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  permissionDeniedText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
});

export default ARScreen;
