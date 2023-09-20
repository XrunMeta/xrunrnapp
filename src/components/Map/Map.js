import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Text,
  DeviceEventEmitter,
  Image,
} from 'react-native';
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ArrowMarker from './ArrowMarker';
import {gyroscope} from 'react-native-sensors';
import markerData from './TempAPI';

const markers = markerData.map(item => (
  <Marker
    key={item.id}
    coordinate={{
      latitude: item.latitude,
      longitude: item.longitude,
    }}
    title={item.name}
    onPress={() => {
      alert(`Ini adalah ${item.name}`);
    }}>
    <Image
      source={require('../../../assets/images/logo_xrun.png')} // Gantilah dengan path yang sesuai
      style={{width: 15, height: 15}}
    />
  </Marker>
));

const MapComponent = () => {
  const [pin, setPin] = useState({
    latitude: 37.4226711,
    longitude: -122.0849872,
  });
  const [loading, setLoading] = useState(true);
  const [mapRotation, setMapRotation] = useState(0);
  const [gyroData, setGyroData] = useState({x: 0, y: 0, z: 0});

  useEffect(() => {
    const getSelfCoordinate = async () => {
      try {
        const selfCoordinate = await AsyncStorage.getItem('selfCoordinate');

        if (selfCoordinate !== null) {
          const coordinate = JSON.parse(selfCoordinate);

          setPin(coordinate);
          setLoading(false);
        }
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
        setLoading(false);
      }
    };

    getSelfCoordinate();
  }, []);

  useEffect(() => {
    const getCurrentLocation = async () => {
      if (Platform.OS === 'ios') {
        // Meminta izin akses lokasi hanya untuk iOS
        Geolocation.requestAuthorization('whenInUse').then(result => {
          if (result === 'granted') {
            // Izin diberikan, dapatkan koordinat
            Geolocation.getCurrentPosition(
              position => {
                // Set To State
                setPin({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              error => {
                console.error(error);
              },
              {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
            );
          }
        });
      } else if (Platform.OS === 'android') {
        // Meminta izin akses lokasi di Android
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Izin Lokasi',
              message:
                'Aplikasi memerlukan izin akses lokasi untuk fungsi tertentu.',
              buttonPositive: 'Izinkan',
            },
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // Izin diberikan, dapatkan koordinat
            Geolocation.getCurrentPosition(
              position => {
                // Set To State
                setPin({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });

                console.log(pin);
              },
              error => {
                console.error(error);
              },
              {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
            );
          } else {
            // Izin ditolak, beri tahu pengguna atau lakukan tindakan lain
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    // Panggil fungsi ini saat Anda ingin mendapatkan koordinat
    getCurrentLocation();

    const gyroscopeSubscription = gyroscope.pipe().subscribe(({x, y, z}) => {
      // x, y, dan z adalah nilai rotasi perangkat di tiga sumbu dari giroskop.

      // Menggunakan nilai-z (roll) untuk mengatur rotasi marker.
      const roll = z * (180 / Math.PI); // Ubah radian ke derajat
      console.log('Roll: ', roll);

      // Set rotasi marker sesuai dengan nilai roll.
      // Jika Anda memiliki gambar panah yang mengarah ke atas, ini akan memutar marker sesuai dengan rotasi perangkat.
      setGyroData({x, y, z});
    });

    return () => {
      gyroscopeSubscription.unsubscribe(); // Berhenti mendengarkan sensor ketika komponen unmount
    };
  });

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>
          {console.log(
            `Loading = true => Lat: ${pin.latitude} & Lng: ${pin.longitude}`,
          )}
          Loading...
        </Text> // Tampilkan pesan loading selama data dimuat
      ) : (
        <MapView
          style={styles.mapStyle}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: pin.latitude,
            longitude: pin.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true}>
          {/* <Marker
            draggable={false}
            coordinate={pin}
            title={'Rotated Marker'}
            description={'This is a rotated marker'}
            rotation={gyroData.z * (180 / Math.PI)} // Atur rotasi sesuai mapRotation
            image={require('../../../assets/images/icon_arrowCircle.png')}> */}
          {/* <Image
              source={require('../../../assets/images/icon_arrowCircle.png')} // Gantilah dengan path yang sesuai
              style={{width: 20, height: 20}}
            /> */}
          {/* </Marker> */}
          {/* <Circle center={pin} radius={500} /> */}
          {markers}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default MapComponent;
