import MapView, {Circle, Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {useCallback, useEffect, useRef, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import InputIndAds from '../CustomInput/InputIndAds';
import ButtonListWithSub from '../ButtonList/ButtonListWithSub';

const MapAds = ({
  lang,
  setIsShowPopupFloating,
  labelAround = 'Around',
  valueAround,
}) => {
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // For mark if user click on the map
  const [radius, setRadius] = useState(valueAround); // State to control radius

  useEffect(() => {
    setRadius(valueAround);
  }, [valueAround]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Lokasi',
            message: 'Aplikasi membutuhkan akses lokasi Anda',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Batal',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }
  };

  const getUserLocation = async () => {
    try {
      console.log('Requesting permission...');
      const hasPermission = await requestLocationPermission();
      console.log('Permission result:', hasPermission);

      if (!hasPermission) {
        console.log('Location permission denied.');
        return;
      }

      console.log('Getting current position...');
      Geolocation.getCurrentPosition(
        position => {
          console.log('Position received:', position);
          const {latitude, longitude} = position.coords;

          mapRef.current?.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.0015,
              longitudeDelta: 0.0015,
            },
            1000,
          );
        },
        error => {
          console.error('Failed to get location:', error);
        },
      );
    } catch (error) {
      console.error('Error in getUserLocation:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      if (isMounted) {
        await getUserLocation();
      }
    };

    getLocation();

    return () => {
      isMounted = false; // Cleanup
    };
  }, []);

  const handleMapPress = useCallback(event => {
    const {coordinate} = event.nativeEvent;
    setSelectedLocation(coordinate);
    console.log('Selected Location:', coordinate);
  }, []);

  return (
    <View>
      <View style={styles.mapContainer}>
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
        <Pressable style={styles.mapPointButton} onPress={getUserLocation}>
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
        <MapView
          ref={mapRef}
          style={styles.mapStyle}
          initialRegion={{
            latitude: -6.2088,
            longitude: 106.8456,
            latitudeDelta: 0.0015,
            longitudeDelta: 0.0015,
          }}
          onPress={handleMapPress}
          showsUserLocation
          customMapStyle={[
            {
              featureType: 'poi',
              stylers: [
                {
                  visibility: 'off',
                },
              ],
            },
          ]}
          showsMyLocationButton={false}
          loadingEnabled>
          {selectedLocation && (
            <>
              <Marker
                coordinate={selectedLocation}
                title={
                  lang && lang
                    ? lang.screen_indAds.selected_location
                    : 'Selected Location'
                }>
                <Image
                  source={require('../../../assets/images/map-marker-red.png')}
                  style={{width: 35, height: 35}}
                  resizeMode="contain"
                />
              </Marker>

              {labelAround.toLowerCase() !== 'worldwide' && (
                <Circle
                  center={selectedLocation}
                  radius={radius}
                  strokeColor="rgba(0, 0, 255, 0.5)"
                  fillColor="rgba(0, 0, 255, 0.2)"
                />
              )}
            </>
          )}
        </MapView>
      </View>
      <View
        style={{
          marginHorizontal: 10,
          marginTop: 10,
          flexDirection: 'column',
          gap: 10,
        }}>
        <InputIndAds
          placeholder={
            lang && lang ? lang.screen_indAds.location : 'Location: '
          }
          value={
            selectedLocation
              ? lang.screen_indAds.location + selectedLocation.latitude
              : ''
          }
          isEditable={false}
        />
        <ButtonListWithSub
          isDropdown
          isTextColorGray
          label={`${lang && lang ? lang.screen_indAds.around : 'Around'}${
            labelAround !== 'Around' && labelAround != ''
              ? `: ${labelAround}`
              : ''
          }`}
          onPress={() => setIsShowPopupFloating(prevValue => !prevValue)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapStyle: {
    flex: 1,
  },
  mapContainer: {
    height: 350,
    marginTop: 20,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    width: 'auto',
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
  },
});

export default MapAds;
