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
  {spotID: 5, x: 50, y: 150},
  {spotID: 6, x: 0, y: -140},
  {spotID: 7, x: 100, y: -50},
  {spotID: 8, x: -100, y: -50},
  {spotID: 9, x: -100, y: 240},
];

// const AnimatedSpot = ({id, clickable}) => {
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

  const startShakeAnimation = () => {
    const shakeRange = getShakeRange(coinsData.spotID);
    shakeAnimation.current = Animated.sequence([
      Animated.timing(position, {
        toValue: {
          x: getRandomOffset(spots[coinsData.spotID - 1].x, shakeRange), // Add radom offset
          y: getRandomOffset(spots[coinsData.spotID - 1].y, shakeRange),
        },
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(position, {
        toValue: {
          x: spots[coinsData.spotID - 1].x,
          y: spots[coinsData.spotID - 1].y,
        },
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    shakeAnimation.current.start(() => startShakeAnimation()); // Recursive to start shake
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
          toValue: 0.3, // Opacity turun ke 0.3
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1, // Opacity naik kembali ke 1
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // In Animation to position
    Animated.parallel([
      Animated.timing(position, {
        toValue: {
          x: getRandomObjectOffset(spots[coinsData.spotID - 1].x),
          y: getRandomObjectOffset(spots[coinsData.spotID - 1].y),
        },
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => startShakeAnimation()); // Start shake when Object in

    // Remove object after 5s
    setTimeout(() => {
      stopShakeAndStartExit();
    }, 5000);
  }, []);

  const stopShakeAndStartExit = () => {
    // Stop shake animation
    shakeAnimation.current && shakeAnimation.current.stop();

    // Tentukan arah lempar secara acak: kiri (-) atau kanan (+)
    const direction = Math.random() < 0.5 ? -1 : 1;

    // Tentukan posisi akhir lempar, jauh di luar layar
    const throwDistance = 700 * direction; // 300 unit ke kiri atau kanan

    // Exit animation (lempar keluar)
    Animated.parallel([
      Animated.timing(position, {
        toValue: {
          x: spots[coinsData.spotID - 1].x + throwDistance, // Tambahkan jarak lempar
          y: spots[coinsData.spotID - 1].y,
        },
        duration: 600,
        easing: Easing.out(Easing.quad), // Easing lebih halus keluar layar
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0, // Skala mengecil ke 0
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0, // Opacity menjadi 0
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(); // Animasi selesai tanpa loop
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
          position => {
            const userCoordinate = {
              // latitude: position.coords.latitude,
              // longitude: position.coords.longitude,
              latitude: -6.0858965,
              longitude: 106.74651,
            };
            setUserLocation(userCoordinate);
            console.log(
              `Lat : ${userCoordinate.latitude}, Lng : ${userCoordinate.longitude}`,
            );

            // Memanggil API setelah mendapatkan lokasi pengguna
            const getARCoin = async () => {
              try {
                const request = await fetch(`${URL_API_NODEJS}/app2000-01`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authcode}`,
                  },
                  body: JSON.stringify({
                    member: parseUserData.member, // Gunakan data member yang sudah didapatkan
                    latitude: userCoordinate.latitude,
                    longitude: userCoordinate.longitude,
                    limit: 30,
                  }),
                });

                const response = await request.json();

                if (response?.data && response?.data?.length > 0) {
                  const coinsData = response?.data.map(item => ({
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

                  setCoinsData(coinsData);
                  console.log('Hasil COIN ada -> ' + coinsData.length);
                } else {
                  console.log('Coin dikosongin');
                  setCoinsData([]);
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
  const organizeData = () => {
    const newOrganizedData = [];
    const dataBelow30 = coinsData.filter(item => item.distance < 30);
    const dataAbove30 = coinsData.filter(item => item.distance >= 30);

    // Isi spot pertama (id: 1) dengan data < 30 jika ada
    if (dataBelow30.length > 0) {
      newOrganizedData.push({...spots[0], ...dataBelow30[0]});
      dataBelow30.shift();
    } else {
      newOrganizedData.push({...spots[0], ...dataAbove30[0]});
      dataAbove30.shift();
    }

    // Isi spot selanjutnya dengan data >= 30
    for (let i = 1; i < spots.length; i++) {
      const dataItem = dataAbove30.shift() || dataBelow30.shift();
      if (dataItem) {
        newOrganizedData.push({...spots[i], ...dataItem});
      }
    }

    console.log('bgstttt -> ' + newOrganizedData.length);

    setOrganizedData(newOrganizedData); // Set organized data
  };

  useEffect(() => {
    // Organize data setelah coinsData diperbarui
    if (coinsData.length > 0) {
      organizeData();
    } else {
      console.log('bahluuulllllll -> ' + coinsData.length);
    }

    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 6000); // Repeat animation setiap 6 detik

    return () => clearInterval(interval);
  }, [coinsData]);

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
            <View style={styles.container}>
              {organizedData.map(spot => (
                <AnimatedSpot
                  key={spot.spotID}
                  member={userData?.member}
                  coinsData={spot}
                />
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
});

export default ARScreen;
