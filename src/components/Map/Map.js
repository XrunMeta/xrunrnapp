import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Platform, PermissionsAndroid} from 'react-native';
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const MapComponent = () => {
  const [pin, setPin] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  useEffect(() => {
    const getCurrentLocation = async () => {
      if (Platform.OS === 'ios') {
        // Meminta izin akses lokasi hanya untuk iOS
        Geolocation.requestAuthorization('whenInUse').then(result => {
          if (result === 'granted') {
            // Izin diberikan, dapatkan koordinat
            Geolocation.getCurrentPosition(
              position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
              },
              error => {
                console.error(error);
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
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
  });

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapStyle}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.4226711,
          longitude: -122.0849872,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}>
        <Marker
          draggable={false}
          coordinate={pin}
          title={'Test Marker'}
          description={'This is a description of the marker'}
        />

        <Circle center={pin} radius={100} />
      </MapView>
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
