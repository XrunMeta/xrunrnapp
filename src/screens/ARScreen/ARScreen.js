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
  Platform
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
import {URL_API, getLanguage2, getFontFam} from '../../../utils';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CompassHeading from 'react-native-compass-heading';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// import crashlytics from '@react-native-firebase/crashlytics';

function ARScreen() {
  const [lang, setLang] = useState({});
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
  const navigation = useNavigation();
  const [brandCount, setBrandCount] = useState(0);
  const [bigCoin, setBigCoin] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0);
  const [prevCompassHeading, setPrevCompassHeading] = useState(0);

  // const getCamPermission = async () => {
  //   try {
  //     if (Platform.OS === 'android') {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //         // {
  //         //   title: 'Camera Permission',
  //         //   message:
  //         //     'XRUN needs access to your camera ' +
  //         //     'so you can enjoy AR and Catch the Coin!',
  //         //   buttonPositive: 'OK',
  //         //   buttonNegative: 'Cancel',
  //         // },
  //       );
  
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         setCameraReady(true);
  //         setCameraPermission('granted');
  //         console.log('Kamera android diizinin');
  //       } else {
  //         console.log('Kamera android ga diizinin');
  //         Linking.openSettings();
  //       }
  //     } else if (Platform.OS === 'ios') {
  //       const permissionStatus = await check(PERMISSIONS.IOS.CAMERA);
  //       if (permissionStatus === RESULTS.GRANTED) {
  //         setCameraReady(true);
  //         setCameraPermission('granted');
  //         console.log('Kamera ios diizinin');
  //       } else {
  //         console.log('Kamera ios ga diizinin');
  //         Linking.openSettings();
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const getCamPermission = async () => {
    try {
      let permission;
      if (Platform.OS === 'android') {
        permission = PERMISSIONS.ANDROID.CAMERA;
      } else if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.CAMERA;
      }
  
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        console.log('Camera permission granted');
        setCameraReady(true);
        setCameraPermission('granted');
      } else {
        console.log('Camera permission denied');
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
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

        // Set Language
        const screenLang = await getLanguage2(currentLanguage, 'screen_map');
        setLang(screenLang);

        setUserData(JSON.parse(storedUserData));
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getUserData();

    // Get Device Rotation
    const degree_update_rate = 3;

    CompassHeading.start(degree_update_rate, ({heading}) => {
      setCompassHeading(heading);

      if (heading >= 135 && heading <= 225) {
        console.log('Rotasi HP Bawah -> ' + heading);
      } else {
        console.log('Rotasi HP -> ' + heading);
      }
    });

    return () => {
      CompassHeading.stop();
    };
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
      console.log("API Get AR Coin: " + apiUrl)
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

        let brandcount = 0;
        let currentBrand = null;
        responseData.data.forEach(item => {
          const brand = item.advertisement;

          // Make sure Brand(Advertisement) isn't duplicate
          if (brand !== currentBrand) {
            currentBrand = brand;
            brandcount++;
          }
        });

        const getBigCoin = responseData.data.filter(
          item => item.isbigcoin === '1',
        ).length;

        console.log(`
          Jumlah Big Coin ada -> ${getBigCoin}
          Jumlah Brand Count ada -> ${brandcount}
        `);

        setBigCoin(getBigCoin);
        setBrandCount(brandcount);
        setCoinAPI(coinsData);
        console.log('Hasil API ada -> ' + coinsData.length);
      } else {
        console.log('Coin dikosongin');
        setCoinAPI([]);
      }
    } catch (error) {
      // crashlytics().recordError(new Error(error));
      // crashlytics().log(error);
      console.error('Error calling API:', error);
    }
  };

  const clickedCoin = (memberID, advertisement, coin) => {
    navigation.replace('ShowAd', {
      screenName: 'Home',
      member: memberID,
      advertisement: advertisement,
      coin: coin,
      coinScreen: true,
    });
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
        Math.floor(Math.random() * 5) + 6,
      );

      const itemsToDisplay = shuffledData
        .slice(currentIndex, currentIndex + displayCount)
        .map(item => {
          // const rotation = Math.random() * 360; // Menetapkan rotasi acak untuk koin
          const rotation = Math.random() * compassHeading; // Menetapkan rotasi acak untuk koin
          const x = Math.random() * (WINDOW_WIDTH - COIN_WIDTH); // Menetapkan posisi X acak untuk koin
          const y = (Math.random() - 0.1) * (WINDOW_HEIGHT - COIN_HEIGHT); // Menetapkan posisi Y acak untuk koin

          return {
            ...item,
            position: {
              x,
              y,
            },
            rotation,
          };
        });

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

      // Catch Image Showing
      var appendedCatchShow = catchShow + 1;
      if (appendedCatchShow <= 3) {
        setCatchShow(appendedCatchShow);
      } else {
        setCatchShow(0);
      }

      console.log('Jumlah Catch Show -> ' + appendedCatchShow);
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

  const renderCamera = () => {
    const commonProps = {
      fps: 25,
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
      },
      device: device,
      isActive: true,
      lowLightBoost: false,
    };
  
    if (Platform.OS === 'android') {
      return (
        <Camera
          {...commonProps}
          torch={flash === 'on' ? 'on' : 'off'}
          onInitialized={() => setTimeout(() => setFlash('off'), 500)}
        />
      );
    } else if (Platform.OS === 'ios') {
      return (
        <Camera
          {...commonProps}
          onInitialized={() => setTimeout(() => console.log('Bgst'), 100)}
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {cameraPermission === 'granted' && isCameraReady && device && (
          <>
            {renderCamera()}
            <View
              style={{
                position: 'absolute',
                // backgroundColor: '#001a477a',
                top: 0,
                bottom: 0,
                left: -50,
                right: -50,
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
                      display:
                        item.rotation >= 0 && item.rotation <= 200
                          ? 'block'
                          : item.rotation >= 210 && item.rotation <= 320
                          ? 'block'
                          : item.rotation >= 330 && rotation <= 360
                          ? 'block'
                          : 'none',
                    },
                    bouncingCoinAnimatedStyle,
                  ]}>
                  <TouchableOpacity
                    onPress={() =>
                      clickedCoin(
                        userData.member,
                        item.advertisement,
                        item.coin,
                      )
                    }>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {parseFloat(item.distance) < 30 && (
                        <>
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
                          source={{
                            uri: `data:image/jpeg;base64,${item.adthumbnail2.replace(
                              /(\r\n|\n|\r)/gm,
                              '',
                            )}`,
                          }}
                          style={{
                            height: 50,
                            width: 50,
                            marginTop: -35,
                          }}
                        />
                        <Text
                          style={{
                            fontFamily: getFontFam() + 'Medium',
                            fontSize: 16,
                            color: 'white',
                          }}>
                          {/* 0.05XRUN */}
                          {item.coins}
                          {item.title}
                        </Text>
                        <Text
                          style={{
                            fontFamily: getFontFam() + 'Regular',
                            fontSize: 13,
                            color: 'grey',
                            marginTop: -7,
                          }}>
                          {/* 2M */}
                          {item.distance}M
                        </Text>
                        {console.log('Rotasi Coin -> ' + item.rotation)}
                      </ImageBackground>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                top: 0,
                left: 0,
                zIndex: 10,
                pointerEvents: 'none',
              }}>
              {/* XRUN Amount that Shown on Map Screen */}
              <View
                style={[
                  {
                    position: 'absolute',
                    pointerEvents: 'none',
                    bottom: -20,
                    left: 0,
                    right: 0,
                    // transform: [{translateY: 110}],
                  },
                ]}>
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)']}
                  start={{x: 0, y: 0}} // From Gradien
                  end={{x: 0, y: 1}} // To Gradien
                  style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 95,
                    height: 170,
                    pointerEvents: 'none',
                  }}>
                  <View style={{marginBottom: -20}}>
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Medium',
                        fontSize: 10.5,
                        color: 'white',
                      }}>
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.radius
                        : ''}
                    </Text>
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Medium',
                        fontSize: 13,
                        color: 'white',
                      }}>
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.amount + ' '
                        : ''}
                      <Text
                        style={{
                          fontFamily: getFontFam() + 'Bold',
                        }}>
                        {brandCount} XRUN
                      </Text>{' '}
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.and + ' '
                        : ''}
                      <Text
                        style={{
                          fontFamily: getFontFam() + 'Bold',
                        }}>
                        {coinAPI.length} BIG XRUN{' '}
                      </Text>
                      {'\n'}
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.getable
                        : ''}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'flex-end',
                      marginBottom: -38,
                    }}>
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Medium',
                        fontSize: 13,
                        color: 'white',
                        marginTop: -2,
                      }}>
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.event
                        : ''}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <Image
                        source={require('../../../assets/images/icon_diamond_white.png')}
                        style={{height: 13, tintColor: '#ffdc04'}}
                        resizeMode="contain"
                      />
                      <Text
                        style={{
                          fontFamily: getFontFam() + 'Bold',
                          fontSize: 13,
                          color: '#ffdc04',
                          marginTop: -4,
                        }}>
                        {lang &&
                        lang.screen_map &&
                        lang.screen_map.section_card_shadow
                          ? lang.screen_map.section_card_shadow.diamond + ' '
                          : ''}
                        {bigCoin}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View
                style={{
                  position: 'absolute',
                  bottom: 74,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                  pointerEvents: 'none',
                }}>
                <View
                  style={{
                    backgroundColor: '#adadad',
                    paddingHorizontal: 20,
                    paddingVertical: 15,
                    borderTopStartRadius: 30,
                    borderTopEndRadius: 30,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 35,
                    zIndex: -2,
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: -15,
                      marginBottom: -20,
                      paddingHorizontal: 90,
                      paddingBottom: 20,
                      paddingTop: 15,
                      zIndex: 1,
                    }}>
                    <Image
                      source={require('../../../assets/images/icon_bottom.png')}
                      resizeMode="contain"
                      style={{
                        width: 20,
                        tintColor: '#7a7a7a',
                        transform: [{rotate: '180deg'}],
                      }}
                    />
                  </View>
                </View>
              </View>
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
                  fontFamily: getFontFam() + 'Medium',
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
    fontFamily: getFontFam() + 'Medium',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
});

export default ARScreen;
