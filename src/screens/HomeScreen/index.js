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

// Offset Value of Slider Card
const initialOffset = 110;
const defaultOffset = 20;

// ########## Main Component ##########
export default function Home() {
  const {isLoggedIn} = useAuth(); // Login Checker
  const [showDetail, setShowDetail] = useState(false); // Slider Card Bool
  const offset = useSharedValue(initialOffset); // Slider Card Animation
  const [selectedMarker, setSelectedMarker] = useState(null); // Get Data from Selected Marker
  const [rangeToMarker, setRangeToMarker] = useState(0); // Get Range of Selected Marker
  const [azimuth, setAzimuth] = useState(0);
  const [markerCount, setMarkerCount] = useState(0); // Count of Marker That Show on Map
  const [brandCount, setBrandCount] = useState(0); // Count of Brand from API
  const [bigCoin, setBigCoin] = useState(0); // Count of Big Coin from API
  const [degToTarget, setDegToTarget] = useState(0); // Get Degrees from User Coordinate -> Target Coordinate
  const [shouldResetMap, setShouldResetMap] = useState(false); // Reset Map after Click Back To Point on Map
  const rotationValue = useSharedValue(0); // Init Rotation of Arrow
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{translateY: offset.value}],
  })); // Slider Card Translate Animation
  const arrowStyle = useAnimatedStyle(() => {
    return {transform: [{rotate: `${rotationValue.value}deg`}]};
  }); // Arrow Rotate Animation

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

  // As 'showDetail' change UseEffect
  useEffect(() => {
    if (showDetail) {
      offset.value = withSpring(initialOffset); // Show Card
    } else {
      offset.value = withSpring(defaultOffset); // Hide Card
    }

    console.log(`
      ShowCard?      : ${showDetail}
      Initial Offset : ${initialOffset}
      Default Offset : ${defaultOffset}
    `);
  }, [showDetail]);

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
            style={{...styles.navWrapper, pointerEvents: 'none'}}>
            <Image
              source={require('../../../assets/images/logoMain_XRUN_White.png')}
              resizeMode="contain"
              style={{
                width: 75,
                height: 35,
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
          </LinearGradient>

          {/* Map View */}
          <View style={styles.container}>
            <MapComponent
              clickedMarker={item => setSelectedMarker(item)}
              clickedRange={distance => {
                let fixedDistance = (distance * 1000).toFixed(2);
                setRangeToMarker(fixedDistance);
              }}
              markerCount={marker => setMarkerCount(marker)}
              brandCount={brandcount => setBrandCount(brandcount)}
              bigCoinCount={bigcoin => setBigCoin(bigcoin)}
              degToTarget={deg => setDegToTarget(deg)}
              shouldResetMap={shouldResetMap}
              onResetMap={() => setShouldResetMap(false)}
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
              colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}
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
                bottom: 90, // Atur bottom ke 0 untuk selalu menempel ke bawah
                height: 170,
                pointerEvents: 'none',
              }}>
              <View style={{marginBottom: -20}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 10,
                    color: 'white',
                  }}>
                  Within a radius of 1000 meters
                </Text>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 11,
                    color: 'white',
                  }}>
                  There are{' '}
                  <Text
                    style={{
                      fontFamily: 'Poppins-Bold',
                    }}>
                    {brandCount} XRUN
                  </Text>{' '}
                  dan{' '}
                  <Text
                    style={{
                      fontFamily: 'Poppins-Bold',
                    }}>
                    {markerCount} BIG XRUN{' '}
                  </Text>
                  {'\n'}
                  bisa didapatkan
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                  marginBottom: -20,
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 11,
                    color: 'white',
                  }}>
                  XRUN Event
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 3,
                  }}>
                  <Image
                    source={require('../../../assets/images/icon_diamond_white.png')}
                    style={{height: 15, tintColor: '#ffdc04'}}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 11,
                      color: '#ffdc04',
                    }}>
                    Diamond {bigCoin}
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
                  marginTop: -20,
                  marginBottom: 5,
                  paddingHorizontal: 90,
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
                      height: 25,
                      width: 25,
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
                    There is a XRUN of{' '}
                    <Text style={{fontFamily: 'Poppins-Bold'}}>XRUN</Text> that
                    can be acquired.
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
    fontSize: 30,
    color: '#343a59',
  },
  subTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#343a59',
  },
  desc: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
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
  },
  mapPointButton: {
    alignItems: 'center',
    padding: 10,
    marginRight: -16,
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
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const mapStyle = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}],
  },
];
