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
import {getLanguage2, getFontFam, getLanguage, fontSize} from '../../../utils';
import * as RNLocalize from 'react-native-localize';

// Offset Value of Slider Card
const initialOffset = 110;
const defaultOffset = 20;

// ########## Main Component ##########
export default function MapParent() {
  const [lang, setLang] = useState({});
  const [curLang, setCurLang] = useState(null);
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
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const selfCoordinate = await AsyncStorage.getItem('selfCoordinate');

        // Set Language
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
        setCurLang(deviceLanguage);

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
    fetchData();

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
    <SafeAreaView style={{flex: 1, marginBottom: 70}}>
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
                if (countDistance === 'Infinity' || countDistance > 1000) {
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
              lang={lang.screen_map}
              updateRange={rangeToMarker}
              // GPSActive={GPSActive => setGPSActive(GPSActive)}
              GPSActive={GPSActive => console.log('Status GPS -> ' + GPSActive)}
              curLang={curLang}
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
                bottom: 95,
                height: 170,
                pointerEvents: 'none',
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  marginBottom: -60,
                }}>
                <View
                  style={{
                    marginBottom: 0,
                  }}>
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
                  {markerCount > 0 ? (
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Medium',
                        fontSize: fontSize('note'),
                        color: 'white',
                        flexWrap: 'wrap',
                      }}>
                      {curLang != null && curLang === 'ko'
                        ? markerCount + ' '
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
                        {curLang != null && curLang === 'ko' ? '' : markerCount}{' '}
                        XRUN
                      </Text>
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_card_shadow
                        ? lang.screen_map.section_card_shadow.and + ' '
                        : ''}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Medium',
                        fontSize: fontSize('note'),
                        color: 'white',
                        marginBottom: 3,
                      }}>
                      {lang &&
                        lang.screen_map &&
                        lang.screen_map.section_card_shadow &&
                        lang.screen_map.section_card_shadow.noCoin + ' '}
                      {'\n'}
                      {lang &&
                        lang.screen_map &&
                        lang.screen_map.section_card_shadow &&
                        lang.screen_map.section_card_shadow.noCoin2}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-end',
                    marginBottom: 0,
                  }}>
                  <Text
                    style={{
                      fontFamily: getFontFam() + 'Medium',
                      fontSize: fontSize('note'),
                      color: 'white',
                      opacity: 0,
                      pointerEvents: 'none',
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
                      marginTop: 1,
                    }}>
                    <Image
                      source={require('../../../assets/images/icon_diamond_white.png')}
                      style={{
                        height: 13,
                        tintColor: '#ffdc04',
                      }}
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
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Card Information */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                // bottom: -40,
                bottom: 0,
                left: 0,
                right: 0,
              },
              animatedStyles,
            ]}>
            <View
              style={{
                backgroundColor: '#e4e8e8',
                paddingHorizontal: 20,
                paddingBottom: 15,
                borderTopStartRadius: 30,
                borderTopEndRadius: 30,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 150,
                paddingBottom: 40,
                zIndex: 2,
              }}>
              <View style={{paddingTop: 5}}>
                <Pressable
                  onPress={handleShowDetail}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 90,
                    zIndex: 1,
                    // backgroundColor: '#FFFFFF4D',
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
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
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
                  <Text style={[styles.desc, {marginTop: 12}]}>
                    <Text style={styles.desc}>
                      {lang &&
                      lang.screen_map &&
                      lang.screen_map.section_slider_card
                        ? lang.screen_map.section_slider_card.desc1
                        : ''}
                    </Text>
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
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('title'),
    color: '#343a59',
  },
  subTitle: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('title'),
    color: '#343a59',
    marginBottom: -9,
  },
  desc: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
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
    backgroundColor: 'white',
  },
  mapPointButton: {
    alignItems: 'center',
    position: 'absolute',
    width: 60,
    height: 35,
    zIndex: 1,
    padding: 10,
    marginVertical: 5,
    right: -8,
    // backgroundColor: 'pink',
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
  buttonTabItem: {
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
