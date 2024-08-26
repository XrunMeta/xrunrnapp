import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CompassHeading from 'react-native-compass-heading';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import crashlytics from '@react-native-firebase/crashlytics';
import * as RNLocalize from 'react-native-localize';

function ARScreen() {
  const [lang, setLang] = useState({});
  const [curLang, setCurLang] = useState(null);
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

  // Random move coin
  const [filterCoinsRandomMove, setFilterCoinsRandomMove] = useState([]);
  const randomLefts = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];
  const randomTops = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

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

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

        // Set Language
        const screenLang = await getLanguage2(currentLanguage, 'screen_map');
        setLang(screenLang);

        const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
        setCurLang(deviceLanguage);

        setUserData(JSON.parse(storedUserData));
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getCamPermission();
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
          // latitude: position.coords.latitude,
          // longitude: position.coords.longitude,
          latitude: '-6.085638',
          longitude: '106.746304',
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

    console.log('Ini berubah');
  }, [userLocation, userData]);

  // Get API for Showing Coin Object
  const getARCoin = async (userID, latitude, longitude) => {
    try {
      const apiUrl = `${URL_API}&act=app2000-01&member=${userID}&limit=20&lat=${latitude}&lng=${longitude}`;
      console.log('API Get AR Coin: ' + apiUrl);
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
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
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

  // Get random int for coin show animation from
  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
          const rotation = Math.random() * compassHeading; // Menetapkan rotasi acak untuk koin
          const x = Math.random() * (WINDOW_WIDTH - COIN_WIDTH); // Menetapkan posisi X acak untuk koin
          const y = (Math.random() - 0.1) * (WINDOW_HEIGHT - COIN_HEIGHT); // Menetapkan posisi Y acak untuk koin
          const randVertical = getRandomInt(-300, 300);
          const transY = randVertical;

          return {
            ...item,
            position: {
              x,
              y,
            },
            rotation,
            transY,
          };
        });

      setCoins(itemsToDisplay);

      // Animasikan setiap koin
      animateBouncingCoin();

      // Mulai animasi blink setiap kali koin berubah
      animateBlink();

      setTimeout(() => {
        setCoins([]);
        const randVertical = getRandomInt(-300, 300);

        bouncingCoinTranslateY.value = randVertical;
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
    };
  }, [coinAPI, coins]); // Perubahan coins ditambahkan di sini

  // Start Random move coin
  useEffect(() => {
    if (coins.length > 0) {
      const getRandomIndexCoin = (count = 4) => {
        // Ambil indeks 0 sampai 3 atau sesuai dengan jumlah koin yang ada
        return Array.from(
          {length: Math.min(count, coins.length)},
          (_, index) => index,
        );
      };

      const randomIndexCoin = getRandomIndexCoin();
      setFilterCoinsRandomMove(randomIndexCoin);
    }
  }, [coins]);

  const getRandomPosition = () => ({
    left: Math.random() * (WINDOW_WIDTH - 100),
    top: Math.random() * (WINDOW_HEIGHT - 350),
  });

  useEffect(() => {
    if (filterCoinsRandomMove.length > 0) {
      const timeoutCoin = setTimeout(() => {
        filterCoinsRandomMove.forEach((_, index) => {
          const {left, top} = getRandomPosition();
          randomLefts[index].value = withTiming(left, {
            duration: 700,
            easing: Easing.inOut(Easing.quad),
          });
          randomTops[index].value = withTiming(top, {
            duration: 700,
            easing: Easing.inOut(Easing.quad),
          });
        });
      }, 700);

      return () => clearTimeout(timeoutCoin);
    }
  }, [filterCoinsRandomMove]);

  // End Random move coin

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

  const bouncingCoinAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: bouncingCoinTranslateY.value}],
    };
  });

  const blinkAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: blinkOpacity.value,
    };
  });

  const onError = error => {
    console.error(error);
  };

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
      onError: onError,
    };
    if (Platform.OS === 'android') {
      return (
        <Camera
          {...commonProps}
          torch={flash === 'on' ? 'on' : 'off'}
          onInitialized={() => setTimeout(() => setFlash('off'), 1000)}
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

  const filteredCoins = coins.filter(item => parseFloat(item.distance) < 30);
  const selectedCoinIndex =
    filteredCoins.length > 0
      ? Math.floor(Math.random() * filteredCoins.length)
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {cameraPermission === 'granted' && isCameraReady && device && (
          <>
            <Camera
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
                top: 125,
                bottom: 0,
                left: 10,
                right: -50,
              }}>
              {coins.map((item, index) => {
                const isRandomCoin = filterCoinsRandomMove.includes(index);
                {
                  /* const moveUncatchLeft =
                  parseFloat(item.distance) < 30
                    ? item.position.x
                    : item.position.x - 200;
                const moveUncatchTop =
                  parseFloat(item.distance) < 30
                    ? item.position.y
                    : item.position.y - 150; */
                }
                const moveUncatchLeft =
                  parseFloat(item.distance) < 30
                    ? item.position.x
                    : item.position.x > WINDOW_WIDTH / 2
                    ? WINDOW_WIDTH - 1500 // posisikan lebih ke kanan layar
                    : -50; // posisikan lebih ke kiri layar
                const moveUncatchTop =
                  parseFloat(item.distance) < 30
                    ? item.position.y
                    : item.position.y > WINDOW_HEIGHT / 2
                    ? WINDOW_HEIGHT - 975 // posisikan lebih ke bawah layar
                    : -50; // posisikan lebih ke atas layar

                {
                  /* console.log({moveUncatchLeft, moveUncatchTop}); */
                }

                return (
                  <Animated.View
                    key={item.coin}
                    style={[
                      {
                        position: 'absolute',
                        left: isRandomCoin
                          ? randomLefts[index]
                          : selectedCoinIndex !== null &&
                            filteredCoins[selectedCoinIndex].coin === item.coin
                          ? WINDOW_WIDTH / 2 - 600
                          : moveUncatchLeft,
                        top: isRandomCoin
                          ? randomTops[index]
                          : selectedCoinIndex !== null &&
                            filteredCoins[selectedCoinIndex].coin === item.coin
                          ? WINDOW_HEIGHT / 2 - 270
                          : moveUncatchTop,
                        zIndex: parseFloat(item.distance) < 30 ? 20 : 1,
                        width: 150,
                        height: 275,
                        display:
                          item.rotation >= 0 && item.rotation <= 200
                            ? 'block'
                            : item.rotation >= 210 && item.rotation <= 320
                            ? 'block'
                            : item.rotation >= 330 && item.rotation <= 360
                            ? 'block'
                            : 'none',
                      },
                      // item.transY,
                      bouncingCoinAnimatedStyle,
                      // bouncingCoinAnimatedStyle(bouncingCoinTranslateY.value),
                    ]}>
                    <ImageBackground
                      source={require('../../../assets/images/image_arcoin_wrapper2.png')}
                      style={{
                        resizeMode: 'contain',
                        height: 165,
                        width: 120,
                        alignItems: 'center',
                        borderRadius: 55,
                      }}>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'relative',
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
                                  position: 'absolute',
                                  top: -105,
                                },
                                blinkAnimatedStyle,
                              ]}
                            />
                          </>
                        )}
                        <TouchableOpacity
                          onPress={() =>
                            clickedCoin(
                              userData.member,
                              item.advertisement,
                              item.coin,
                            )
                          }
                          disabled={
                            parseFloat(item.distance) < 30 ? false : true
                          }
                          style={{
                            height: 125,
                            width: 125,
                            borderRadius: 100,
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
                              height: 45,
                              width: 45,
                            }}
                          />
                          <Text
                            style={{
                              fontFamily: getFontFam() + 'Medium',
                              fontSize: fontSize('subtitle'),
                              color: 'white',
                              marginTop: 5,
                            }}>
                            {item.coins}
                            {item.title}
                          </Text>
                          <Text
                            style={{
                              fontFamily: getFontFam() + 'Regular',
                              fontSize: fontSize('body'),
                              color: 'grey',
                              marginTop: 3,
                            }}>
                            {item.distance}M
                          </Text>
                          {console.log('Rotasi Coin -> ' + item.rotation)}
                        </TouchableOpacity>
                      </View>
                    </ImageBackground>
                  </Animated.View>
                );
              })}
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
                  <View style={{marginBottom: -35}}>
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Medium',
                        fontSize: fontSize('note'),
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
                        fontSize: fontSize('body'),
                        color: 'white',
                      }}>
                      {curLang != null && curLang === 'ko'
                        ? coinAPI.length + ' '
                        : ''}
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.amount + ' '
                        : ''}
                      <Text
                        style={{
                          fontFamily: getFontFam() + 'Bold',
                        }}>
                        {curLang != null && curLang === 'ko'
                          ? ''
                          : coinAPI.length}{' '}
                        XRUN
                      </Text>
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.and + ' '
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
                        fontSize: fontSize('body'),
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
                          fontSize: fontSize('body'),
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
    fontSize: fontSize('subtitle'),
    fontFamily: getFontFam() + 'Medium',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
});

export default ARScreen;
