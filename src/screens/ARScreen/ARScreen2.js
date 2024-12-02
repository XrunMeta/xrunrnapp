import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  fontSize,
  getFontFam,
  URL_API_NODEJS,
  authcode,
  getLanguage2,
} from '../../../utils';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

// Fungsi khusus untuk objek 1 dengan range kecil
const getShakeRange = id => {
  return id === 1 ? 5 : 10; // Range 5 untuk objek 1, 10 untuk lainnya
};

// Shake Range Effect
const getRandomOffset = (value, range) => {
  return value + (Math.random() * (range * 2) - range);
};

// Object Position Randomize
const getRandomObjectOffset = (value, range = 100) => {
  const offset = Math.random() * (range * 2) - range; // Range between -20 until 20
  return value + offset;
};

const spots = [
  {spotID: 1, x: 0, y: 0}, // Clickable is center
  {spotID: 2, x: -100, y: 50},
  {spotID: 3, x: 100, y: 50},
  {spotID: 4, x: -50, y: 150},
];

const AnimatedSpot = ({member, coinsData}) => {
  const position = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const scaleAnim = useRef(new Animated.Value(0)).current; // Default scale 0
  const fadeAnim = useRef(new Animated.Value(0)).current; // Default opacity 0
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(null);
  const navigation = useNavigation();

  const clickedCoin = (memberID = member, advertisement, coin) => {
    navigation.replace('ShowAd', {
      screenName: 'Home',
      member: memberID,
      advertisement: advertisement,
      coin: coin,
      coinScreen: true,
    });
  };

  // const startShakeAnimation = () => {
  //   const shakeRange = getShakeRange(coinsData.spotID);
  //   shakeAnimation.current = Animated.sequence([
  //     Animated.timing(position, {
  //       toValue: {
  //         x: getRandomOffset(spots[coinsData.spotID - 1].x, shakeRange), // Add radom offset
  //         y: getRandomOffset(spots[coinsData.spotID - 1].y, shakeRange),
  //       },
  //       duration: 500,
  //       easing: Easing.inOut(Easing.ease),
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(position, {
  //       toValue: {
  //         x: spots[coinsData.spotID - 1].x,
  //         y: spots[coinsData.spotID - 1].y,
  //       },
  //       duration: 500,
  //       easing: Easing.inOut(Easing.ease),
  //       useNativeDriver: true,
  //     }),
  //   ]);

  //   shakeAnimation.current.start(() => startShakeAnimation()); // Recursive to start shake
  // };

  const startShakeAnimation = () => {
    // Ease Beizer Animation
    const bezierCurves = [
      Easing.bezier(0.25, 0.1, 0.25, 1), // Standard smooth ease
      Easing.bezier(0.42, 0, 0.58, 1), // Smooth acceleration & deceleration
      Easing.bezier(0.5, 0, 0.75, 0.9), // Fun and playful
      Easing.bezier(0.15, 0.85, 0.85, 0.15), // Bounce-like effect
      Easing.bezier(0.68, -0.55, 0.27, 1.55), // Elastic, exaggerated bounce
      Easing.bezier(0.6, 0.04, 0.98, 0.34), // Fast in, slow out
      Easing.bezier(0.5, 1.5, 0.75, 1), // Overshoot effect
      Easing.bezier(0.5, 0.05, 1, 0.5), // Relaxed
      Easing.bezier(0.1, 0.7, 0.1, 1), // Calm and steady
      Easing.bezier(0.36, 0.07, 0.19, 0.97), // Dynamic but smooth

      // Easing.bezier(0.42, 0, 0.58, 1), // Ease-in-out (smooth acceleration and deceleration)
      // Easing.bezier(0.25, 1, 0.5, 1), // Ease-out back (snappy ending)
      // Easing.bezier(0.42, 0.2, 0.6, 1), // Smooth and lively curve
      // Easing.bezier(0.17, 0.67, 0.83, 0.67), // Bounce-like with less intensity
      // Easing.bezier(0.34, 1.56, 0.64, 1), // Springy effect
      // Easing.bezier(0.68, -0.6, 0.32, 1.6), // Energetic bounce
      // Easing.bezier(0.29, 0.58, 0.45, 1), // Soft, lively ease-in
      // Easing.bezier(0.5, 0, 0.5, 1), // Linear but with some variation
      // Easing.bezier(0.76, 0, 0.24, 1), // Fast start, slow end
      // Easing.bezier(0.1, 0.57, 0.1, 1), // Very gentle start and finish
    ];

    // Random pick for ease beize animation
    const randomBezier =
      bezierCurves[Math.floor(Math.random() * bezierCurves.length)];
    const randomDuration = 700 + Math.random() * 500; // Hasil antara 700 dan 1200
    // const randomDelay = Math.random() * (2000 - 1000) + 1000; // Delay antara 1-2 detik
    const randomDelay = 1000; // Delay antara 1-2 detik
    const randomRange = 150 + Math.random() * 150; // Randomize range 200-500px

    // Animasi sequence
    shakeAnimation.current = Animated.sequence([
      Animated.delay(randomDelay), // Delay sebelum animasi dimulai

      // Pindahkan posisi ke acak dengan offset sekitar 200 unit
      Animated.timing(position, {
        toValue: {
          x: getRandomOffset(spots[coinsData.spotID - 1].x, 70), // Offset Horizontal
          y: getRandomOffset(spots[coinsData.spotID - 1].y, 170), // Offset Vertical
        },
        // duration: randomDuration, // Durasi pergerakan
        // easing: randomBezier,
        duration: 300, // Durasi pergerakan
        easing: bezierCurves[0],
        useNativeDriver: true,
      }),

      // Menahan di posisi baru selama 1-5 detik
      Animated.delay(Math.random() * (5000 - 1000) + 1000), // Hold selama 1-5 detik

      // Kembali ke posisi awal dengan animasi
      Animated.timing(position, {
        toValue: {
          x: spots[coinsData.spotID - 1].x,
          y: spots[coinsData.spotID - 1].y,
        },
        // duration: randomDuration,
        // easing: randomBezier,
        duration: 300,
        easing: bezierCurves[0],
        useNativeDriver: true,
      }),

      // Kembali ke posisi acak setelah delay lagi dan ulangi animasi
      Animated.delay(randomDelay),
    ]);

    shakeAnimation.current.start(() => startShakeAnimation()); // Recursive untuk memulai animasi lagi
  };

  useEffect(() => {
    // Default position since out of screen
    position.setValue({
      x: Math.random() * 300 - 150,
      y: Math.random() * 300 - 150,
    });

    // Catch Blink Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0, // Opacity turun ke 0.3
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1, // Opacity naik kembali ke 1
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    animateObject(); // Mulai animasi saat komponen dimount
  }, []);

  const animateObject = () => {
    const direction = Math.random() < 0.5 ? -1 : 1;
    const throwDistance = 400 * direction;

    // In Animation to position
    Animated.parallel([
      Animated.timing(position, {
        toValue: {
          x: spots[coinsData.spotID - 1].x + throwDistance, // Gerakan horizontal
          y: spots[coinsData.spotID - 1].y - 200, // Gerakan vertikal (lebih tinggi, membuat lengkungan)
        },
        duration: 50, // Durasi gerakan
        easing: Easing.circle, // Easing yang menghasilkan gerakan melengkung
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      startShakeAnimation(); // Start shake when object is in
      setTimeout(() => {
        stopShakeAndStartExit();
      }, 30000); // Wait for 30s before exit animation
    });
  };

  const stopShakeAndStartExit = () => {
    shakeAnimation.current && shakeAnimation.current.stop();

    const direction = Math.random() < 0.5 ? -1 : 1;
    const throwDistance = 400 * direction;

    // Exit animation
    Animated.parallel([
      Animated.timing(position, {
        toValue: {
          x: spots[coinsData.spotID - 1].x + throwDistance,
          y: spots[coinsData.spotID - 1].y,
        },
        duration: 300,
        // easing: Easing.out(Easing.quad),
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Restart the animation sequence after completion
      setTimeout(() => {
        animateObject(); // Mulai lagi animasi
      }, 100); // Delay sebelum restart, opsional
    });
  };

  return (
    <Animated.View
      key={coinsData.spotID}
      style={[
        styles.spot,
        {
          zIndex: parseFloat(10) < 30 ? 20 : 1,
          opacity: fadeAnim,
          transform: [
            // Coin Positioning at Screen (Adjust range at parameter || normal 0-30)
            {
              translateX: position.x.interpolate({
                inputRange: [-200, 200],
                outputRange: [
                  -200 + getRandomObjectOffset(0, 5),
                  200 + getRandomObjectOffset(0, 5),
                ],
              }),
            },
            {
              translateY: position.y.interpolate({
                inputRange: [-200, 200],
                outputRange: [
                  -200 + getRandomObjectOffset(0, 5),
                  200 + getRandomObjectOffset(0, 5),
                ],
              }),
            },
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1], // Scale in from small to big
              }),
            },
          ],
        },
      ]}>
      <ImageBackground
        source={require('../../../assets/images/image_arcoin_wrapper2.png')}
        style={styles.imageBackground}>
        <View style={styles.innerContainer}>
          {parseFloat(coinsData.distance) < 30 && (
            <>
              <Animated.Image
                source={require('../../../assets/images/icon_catch.png')}
                style={[
                  styles.blinkImage,
                  {
                    opacity: blinkAnim,
                  },
                ]}
              />
            </>
          )}
          <TouchableOpacity
            onPress={() =>
              clickedCoin(member, coinsData.advertisement, coinsData.coin)
            }
            disabled={parseFloat(coinsData.distance) < 30 ? false : true}
            style={styles.button}>
            <Image
              source={require('./../../../assets/images/icon_xrun_white.png')}
              style={styles.icon}
            />
            <Text style={styles.titleText}>
              {coinsData.coins}
              {coinsData.title}
            </Text>
            <Text style={styles.subtitleText}>{coinsData.distance}M</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const ARScreen = () => {
  const [lang, setLang] = useState({});
  const [curLang, setCurLang] = useState(null);
  const [visible, setVisible] = useState(true);
  const [coinsData, setCoinsData] = useState([]);
  const [organizedData, setOrganizedData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('pending');
  const device = useCameraDevice('back');
  const chunkSize = 4;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true); // Get Loading Info

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
    const getUserDataAndLocationAndCoins = async () => {
      try {
        // Mengambil data user dari AsyncStorage
        const storedUserData = await AsyncStorage.getItem('userData');
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

        // Set Bahasa
        const screenLang = await getLanguage2(currentLanguage, 'screen_map');
        setLang(screenLang);

        const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
        setCurLang(deviceLanguage);

        const parseUserData = JSON.parse(storedUserData);
        setUserData(parseUserData);

        console.log({parseUserData});

        // Mengambil lokasi pengguna
        const watchId = Geolocation.watchPosition(
          async position => {
            const userCoordinate = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              // latitude: -6.0858965,
              // longitude: 106.74651,
            };
            setUserLocation(userCoordinate);
            console.log(
              `Lat : ${userCoordinate.latitude}, Lng : ${userCoordinate.longitude}`,
            );

            const astorCoinsData = await AsyncStorage.getItem('astorCoinsData');
            const coinsData = JSON.parse(astorCoinsData);

            // Memanggil API setelah mendapatkan lokasi pengguna
            const getARCoin = async () => {
              try {
                // const request = await fetch(`${URL_API_NODEJS}/app2000-01`, {
                //   method: 'POST',
                //   headers: {
                //     'Content-Type': 'application/json',
                //     Authorization: `Bearer ${authcode}`,
                //   },
                //   body: JSON.stringify({
                //     member: parseUserData.member, // Gunakan data member yang sudah didapatkan
                //     latitude: userCoordinate.latitude,
                //     longitude: userCoordinate.longitude,
                //     limit: 30,
                //   }),
                // });

                // const response = await request.json();

                // if (response?.data && response?.data?.length > 0) {
                if (coinsData.length > 0) {
                  // const coinsData = response?.data.map(item => ({
                  //   lat: item.lat,
                  //   lng: item.lng,
                  //   title: item.title,
                  //   distance: item.distance,
                  //   adthumbnail2: item.adthumbnail2,
                  //   adthumbnail: item.adthumbnail,
                  //   coins: item.coins,
                  //   symbol: item.symbol,
                  //   coin: item.coin,
                  //   advertisement: item.advertisement,
                  //   cointype: item.cointype,
                  //   adcolor1: item.adcolor1,
                  //   brand: item.brand,
                  //   isbigcoin: item.isbigcoin,
                  // }));

                  organizeData(coinsData);
                  setLoading(false);
                  setCoinsData(coinsData);
                  console.log('Hasil COIN ada -> ' + coinsData.length);
                } else {
                  console.log('Coin dikosongin');
                  setCoinsData([]);
                  setLoading(false);
                }
              } catch (error) {
                console.error('Error calling API:', error);
              }
            };

            getARCoin(); // Panggil fungsi getARCoin setelah mendapatkan lokasi pengguna
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
      } catch (err) {
        console.error('Error retrieving data or location:', err);
      }
    };

    getUserDataAndLocationAndCoins();
    getCamPermission();
  }, []); // Hanya dijalankan sekali saat komponen pertama kali dirender

  // Fungsi untuk menggabungkan data berdasarkan aturan
  const organizeData = oCoinData => {
    // if (coinsData.length === 0) return;
    if (oCoinData.length === 0) return;

    // Ambil data 9 item berdasarkan currentIndex
    const nextData = oCoinData.slice(currentIndex, currentIndex + chunkSize);

    // Jika kurang dari 9 item (berarti sampai akhir), reset indeks ke awal
    if (nextData.length < chunkSize) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prevIndex => prevIndex + chunkSize);
    }

    // Gabungkan spot dengan data kelompok yang diambil
    const newOrganizedData = spots.map((spot, index) => {
      return nextData[index] ? {...spot, ...nextData[index]} : spot;
    });

    setOrganizedData(newOrganizedData); // Set data terorganisir
  };

  useEffect(() => {
    // Panggil organizeData setiap interval
    const interval = setInterval(() => {
      organizeData(coinsData);
      // setVisible(prev => !prev); // Toggle animasi
    }, 32000); // Ulangi setiap 6 detik

    return () => clearInterval(interval); // Bersihkan interval saat unmount
  }, [coinsData, currentIndex]); // Ulangi jika coinsData atau currentIndex berubah

  return (
    <SafeAreaView style={{flex: 1}}>
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
                flexDirection: 'row',
                position: 'absolute',
                top: 0,
                right: 0,
                alignItems: 'center',
                marginRight: 10,
                marginTop: 10,
              }}>
              <Image
                source={require('../../../assets/images/icon_diamond_white.png')}
                style={{height: 13, tintColor: '#ffdc04'}}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontFamily: getFontFam() + 'Bold',
                  fontSize: fontSize('note'),
                  color: 'white',
                  marginTop: -2,
                }}>
                Jackpot 10,000 XRUN
              </Text>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#343a59" />
                <Text
                  style={{
                    color: 'white',
                    fontFamily: getFontFam() + 'Regular',
                    fontSize: fontSize('body'),
                  }}>
                  {lang && lang?.screen_map?.section_marker
                    ? lang?.screen_map?.section_marker?.loader
                    : 'Loading...'}
                </Text>
                {/* Show Loading While Data is Load */}
              </View>
            ) : (
              <View style={styles.container}>
                {coinsData.length > 0 &&
                  organizedData.map(spot => (
                    <AnimatedSpot
                      key={spot.spotID}
                      member={userData?.member}
                      coinsData={spot}
                    />
                  ))}
              </View>
            )}

            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                top: 0,
                left: 0,
                zIndex: 20,
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
                    bottom: 85,
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
                        ? coinsData.length + ' '
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
                          : coinsData.length}{' '}
                        XRUN
                      </Text>
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.and + ' '
                        : ''}
                    </Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#001a477a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 150,
    left: 0,
  },
  spot: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: 150,
    height: 175,
    borderRadius: 150,
  },
  imageBackground: {
    resizeMode: 'contain',
    height: 105,
    width: 77,
    alignItems: 'center',
    borderRadius: 55,
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  blinkImage: {
    resizeMode: 'contain',
    height: 100,
    width: 100,
    position: 'absolute',
    top: -80,
  },
  button: {
    height: 77,
    width: 77,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: 25,
    width: 25,
  },
  titleText: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: 'white',
    marginTop: 3,
  },
  subtitleText: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('note'),
    color: 'grey',
    marginTop: -3,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
});

export default ARScreen;
