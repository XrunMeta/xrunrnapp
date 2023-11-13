import React, {useState, useEffect} from 'react';
import {
  Text,
  Pressable,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import MapComponent from '../../components/Map/Map';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CompassHeading from 'react-native-compass-heading';

const langData = require('../../../lang.json');

// Offset Value of Slider Card
const initialOffset = 110;
const defaultOffset = 20;

// ########## Main Component ##########
export default function Home() {
  const [lang, setLang] = useState({});
  const {isLoggedIn} = useAuth(); // Login Checker
  const [showDetail, setShowDetail] = useState(false); // Slider Card Bool
  const offset = useSharedValue(initialOffset); // Slider Card Animation
  const [selectedMarker, setSelectedMarker] = useState(null); // Get Data from Selected Marker
  const [rangeToMarker, setRangeToMarker] = useState(0); // Get Range of Selected Marker
  const [markerCount, setMarkerCount] = useState(0); // Count of Marker That Show on Map
  const [brandCount, setBrandCount] = useState(0); // Count of Brand from API
  const [bigCoin, setBigCoin] = useState(0); // Count of Big Coin from API
  const [degToTarget, setDegToTarget] = useState(0); // Get Degrees from User Coordinate -> Target Coordinate
  const [shouldResetMap, setShouldResetMap] = useState(false); // Reset Map after Click Back To Point on Map
  const rotationValue = useSharedValue(0); // Init Rotation of Arrow
  const [compassHeading, setCompassHeading] = useState(0);
  const [targetLatitude, setTargetLatitude] = useState(0);
  const [targetLongitude, setTargetLongitude] = useState(0);
  const [pin, setPin] = useState(0); // Player Coordinate
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{translateY: offset.value}],
  })); // Slider Card Translate Animation

  const arrowStyle = useAnimatedStyle(() => {
    if (pin) {
      const deltaLatitude = targetLatitude - pin.latitude;
      const deltaLongitude = targetLongitude - pin.longitude;
      const dirToTarget =
        (Math.atan2(deltaLongitude, deltaLatitude) * 180) / Math.PI;

      return {
        transform: [{rotate: `${360 - compassHeading + dirToTarget}deg`}],
      };
    } else {
      return {transform: [{rotate: `${360 - compassHeading}deg`}]};
    }
  });

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const selfCoordinate = await AsyncStorage.getItem('selfCoordinate');

        // Set Language
        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);

        // Set Player Coordinate
        const coordinate = JSON.parse(selfCoordinate);
        setPin(coordinate);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };
    getLanguage();

    // Get Device Rotation
    const degree_update_rate = 3;

    CompassHeading.start(degree_update_rate, ({heading}) => {
      setCompassHeading(heading);
    });

    return () => {
      CompassHeading.stop();
    };
  }, []);

  // As 'degToTarget' change UseEffect
  useEffect(() => {
    // Convert value 'degToTarget' from -360 until 360
    const normalizedDeg = ((degToTarget % 360) + 360) % 360;

    // Start Rotate Animation
    rotationValue.value = withTiming(normalizedDeg, {
      duration: 500,
      easing: Easing.linear,
    });
  }, [degToTarget]);

  const rotateCompassToTarget = (latitude, longitude) => {
    setTargetLatitude(latitude);
    setTargetLongitude(longitude);
  };

  // As 'showDetail' change UseEffect
  useEffect(() => {
    if (showDetail) {
      offset.value = withSpring(initialOffset); // Show Card
    } else {
      offset.value = withSpring(defaultOffset); // Hide Card
    }
  }, [showDetail]);

  // Show Card when Marker is Clicked
  useEffect(() => {
    if (showDetail) {
      setShowDetail(!showDetail); // Show Card
    }

    if (selectedMarker !== null) {
      var latTarget = selectedMarker.lat;
      var lngTarget = selectedMarker.lng;

      rotateCompassToTarget(latTarget, lngTarget);
    }
  }, [selectedMarker]);

  // Button Collapse Slider Card
  const handleShowDetail = () => {
    setShowDetail(!showDetail);
  };

  // Button Back To Current Position on Map
  const getBackToPoint = () => {
    setShouldResetMap(true);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {isLoggedIn ? (
        <View style={styles.root}>
          {/* Header */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']}
            start={{x: 0, y: -0.5}} // From Gradien
            end={{x: 0, y: 1}} // To Gradien
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: 20,
              paddingVertical: 5,
              justifyContent: 'space-between',
              alignItems: 'center',
              height: 50,
              zIndex: 1,
              top: 0,
              right: 0,
              left: 0,
            }}
          />
          <Image
            source={require('../../../assets/images/logoMain_XRUN_White.png')}
            resizeMode="contain"
            style={{
              width: 75,
              height: 35,
              zIndex: 1,
              marginHorizontal: 15,
              marginVertical: 5,
            }}
          />
          <Pressable style={styles.mapPointButton} onPress={getBackToPoint}>
            <Image
              source={require('../../../assets/images/icon_mapPoint.png')}
              resizeMode="contain"
              style={{
                flex: 1,
                margin: 'auto',
                alignItems: 'center',
                justifyContent: 'center',
                width: 23,
              }}
            />
          </Pressable>

          {/* Map View */}
          <View style={styles.container}>
            <MapComponent
              clickedMarker={item => setSelectedMarker(item)}
              clickedRange={distance => {
                let fixedDistance;
                let countDistance = (distance * 1000).toFixed(2);
                if (countDistance === 'Infinity') {
                  fixedDistance = 0;
                } else {
                  fixedDistance = countDistance;
                }
                setRangeToMarker(fixedDistance);
              }}
              markerCount={marker => setMarkerCount(marker)}
              brandCount={brandcount => setBrandCount(brandcount)}
              bigCoinCount={bigcoin => setBigCoin(bigcoin)}
              degToTarget={deg => setDegToTarget(deg)}
              shouldResetMap={shouldResetMap}
              onResetMap={() => setShouldResetMap(false)}
              lang={lang}
              jamal={rangeToMarker}
            />
          </View>

          {/* XRUN Amount that Shown on Map Screen */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
              },
              animatedStyles,
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
                bottom: 95, // Atur bottom ke 0 untuk selalu menempel ke bawah
                height: 170,
                pointerEvents: 'none',
              }}>
              <View style={{marginBottom: -20}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
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
                    fontFamily: 'Poppins-Medium',
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
                      fontFamily: 'Poppins-Bold',
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
                      fontFamily: 'Poppins-Bold',
                    }}>
                    {markerCount} BIG XRUN{' '}
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
                    fontFamily: 'Poppins-Medium',
                    fontSize: 13,
                    color: 'white',
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
                      fontFamily: 'Poppins-Bold',
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
          </Animated.View>

          {/* Card Information */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: -40,
                left: 0,
                right: 0,
              },
              animatedStyles,
            ]}>
            <View
              style={{
                backgroundColor: '#e4e8e8',
                paddingHorizontal: 20,
                paddingVertical: 15,
                borderTopStartRadius: 30,
                borderTopEndRadius: 30,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 190,
                paddingBottom: 70,
                zIndex: 2,
              }}>
              <Pressable
                onPress={handleShowDetail}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -30,
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
                    transform: showDetail ? [{rotate: '180deg'}] : [],
                  }}
                />
              </Pressable>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Animated.Image
                  source={require('../../../assets/images/icon_arrow.png')}
                  resizeMode="contain"
                  style={[
                    {
                      marginRight: 10,
                      height: 20,
                      width: 20,
                    },
                    arrowStyle,
                  ]}
                />
                <View
                  style={{
                    flex: 1,
                  }}>
                  <Text style={styles.subTitle}>{rangeToMarker || 0}m</Text>
                  <Text style={styles.desc}>
                    {lang &&
                    lang.screen_map &&
                    lang.screen_map.section_slider_card
                      ? lang.screen_map.section_slider_card.desc1 + ' '
                      : ''}
                    <Text style={{fontFamily: 'Poppins-Bold'}}>XRUN</Text>{' '}
                    {lang &&
                    lang.screen_map &&
                    lang.screen_map.section_slider_card
                      ? lang.screen_map.section_slider_card.desc2
                      : ''}
                  </Text>
                </View>
                <Image
                  source={require('../../../assets/images/logo_xrun.png')}
                  resizeMode="contain"
                  style={{
                    marginLeft: 10,
                    height: 45,
                    width: 45,
                  }}
                />
              </View>
            </View>
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .1)']}
              start={{x: 0, y: 0}} // From Gradien
              end={{x: 0, y: 1}} // To Gradien
              style={{
                height: 20,
                position: 'absolute',
                bottom: 50,
                left: 0,
                right: 0,
                pointerEvents: 'none',
              }}></LinearGradient>
          </Animated.View>
        </View>
      ) : (
        <Text>You are not logged in.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#343a59',
  },
  subTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: '#343a59',
    marginBottom: -9,
  },
  desc: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
  },
  navWrapper: {
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    zIndex: 1,
    backgroundColor: 'pink',
  },
  mapPointButton: {
    alignItems: 'center',
    position: 'absolute',
    width: 60,
    height: 35,
    zIndex: 1,
    padding: 10,
    marginVertical: 5,
    right: 0,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
