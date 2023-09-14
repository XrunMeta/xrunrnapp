import React, {useState} from 'react';
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
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';

export default function Home() {
  const {isLoggedIn, logout} = useAuth();
  const [showDetail, setShowDetail] = useState(false);

  const navigation = useNavigation();

  const handleShowDetail = () => {
    setShowDetail(!showDetail);
  };

  const handleLogout = () => {
    // Lakukan logout dan set state isLoggedIn menjadi false
    logout();
    navigation.navigate('First');
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {isLoggedIn ? (
        <View style={styles.root}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']} // Gradient from Black to Transparent
            start={{x: 0, y: -0.5}} // From Gradien
            end={{x: 0, y: 1}} // To Gradien
            style={styles.navWrapper}>
            <Image
              source={require('../../../assets/images/logoMain_XRUN_White.png')}
              resizeMode="contain"
              style={{
                width: 110,
                height: 35,
              }}
            />
            <Pressable
              style={styles.mapPointButton}
              onPress={handleLogout}
              // android_ripple={{color: 'rgba(0, 0, 0, 0.01)'}}
            >
              <Image
                source={require('../../../assets/images/icon_mapPoint.png')}
                resizeMode="contain"
                style={{
                  flex: 1,
                  margin: 'auto',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Pressable>
          </LinearGradient>

          <View style={styles.container}>
            <MapView
              style={styles.mapStyle}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              // customMapStyle={mapStyle}
            >
              <Marker
                draggable
                coordinate={{
                  latitude: 37.78825,
                  longitude: -122.4324,
                }}
                onDragEnd={e => alert(JSON.stringify(e.nativeEvent.coordinate))}
                title={'Test Marker'}
                description={'This is a description of the marker'}
              />
            </MapView>
          </View>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              bottom: showDetail ? -110 : 0,
              left: 0,
              right: 0,
              backgroundColor: '#e4e8e8',
              paddingHorizontal: 20,
              paddingVertical: 15,
              borderTopStartRadius: 30,
              borderTopEndRadius: 30,
            }}>
            <Pressable onPress={handleShowDetail}>
              <Image
                source={require('../../../assets/images/icon_bottom.png')}
                resizeMode="contain"
                style={{
                  width: 20,
                  marginTop: -15,
                  marginBottom: 10,
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
              <Image
                source={require('../../../assets/images/icon_arrow.png')}
                resizeMode="contain"
                style={{marginRight: 10}}
              />
              <View
                style={{
                  flex: 1,
                }}>
                <Text style={styles.subTitle}>66.13m</Text>
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
                  height: 70,
                  width: 70,
                }}
              />
            </View>
          </View>
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
    fontFamily: 'Poppins-Medium',
    fontSize: 26,
    color: '#343a59',
  },
  desc: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#343a59',
  },
  navWrapper: {
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    zIndex: 1,
  },
  mapPointButton: {
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    alignItems: 'center',
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
