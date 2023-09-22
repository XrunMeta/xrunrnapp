import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Text,
  Image,
} from 'react-native';
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Callout,
} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchMarkerData} from './APIGetMarker';
import RNFetchBlob from 'rn-fetch-blob';

const MapComponent = ({clickedMarker}) => {
  const [pin, setPin] = useState({
    latitude: 37.4226711,
    longitude: -122.0849872,
  });
  const [loading, setLoading] = useState(true);
  const [markersData, setMarkersData] = useState([]);
  const [blobData, setBlobData] = useState([]);

  const saveBlobAsImage = async (blob, filename) => {
    const path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;
    await RNFetchBlob.fs.writeFile(path, blob, 'base64');
    return path;
  };

  useEffect(() => {
    const getSelfCoordinate = async () => {
      try {
        const selfCoordinate = await AsyncStorage.getItem('selfCoordinate');

        if (selfCoordinate !== null) {
          const coordinate = JSON.parse(selfCoordinate);

          setPin(coordinate);
          setLoading(false);

          const data = await fetchMarkerData(
            coordinate.latitude,
            coordinate.longitude,
          );

          if (data) {
            // Simpan data ke dalam state markerData
            setMarkersData(data.data);

            data.data.map(async item => {
              const imagePath = await saveBlobAsImage(
                item.symbolimg,
                `${item.coin}.png`,
              );

              setBlobData(imagePath);
            });
          }
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

  const handleMarkerClick = item => {
    // Memanggil prop onMarkerClick sebagai fungsi
    clickedMarker(item);
    console.log('Item yang diklik:', item.title);
  };

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
          <Circle center={pin} radius={500} />

          {markersData &&
            markersData.map &&
            markersData.map(item => (
              // Marker of Coin
              <Marker
                key={item.coin}
                coordinate={{
                  latitude: parseFloat(item.lat),
                  longitude: parseFloat(item.lng),
                }}
                title={item.title}
                onPress={() => {
                  handleMarkerClick(item);
                }}>
                <Image
                  source={require('../../../assets/images/logo_xrun.png')} // Gantilah dengan path yang sesuai
                  // source={{uri: `file://${imagePath}`}} // Gantilah dengan path yang sesuai
                  style={{width: 15, height: 15}}
                />
                <Callout tooltip>
                  <View
                    style={{
                      backgroundColor: 'white',
                      borderColor: '#ffdc04',
                      borderWidth: 3,
                      flexDirection: 'row',
                      width: 200,
                      height: 80,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderTopLeftRadius: 50,
                      borderTopRightRadius: 15,
                      borderBottomLeftRadius: 50,
                      borderBottomRightRadius: 15,
                      gap: 7,
                      elevation: 4,
                    }}>
                    <View
                      style={{
                        justifyContent: 'space-between',
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          marginTop: -10,
                        }}>
                        <Image
                          source={{uri: `file://${blobData}`}} // Gantilah dengan path yang sesuai
                          style={{
                            width: 37,
                            height: 37,
                          }}
                          onError={err => console.log('Error Bgst! : ', err)}
                        />
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: 'Poppins-Medium',
                        }}>
                        {item.distance}m
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: 'Poppins-Medium',
                          marginTop: 3,
                        }}>
                        There is an {item.brand} {'\n'}with {item.brand}.
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: 'Poppins-SemiBold',
                          marginBottom: -5,
                          color: 'black',
                        }}>
                        {item.coins} {item.brand}
                      </Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
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
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: 'blue',
    borderWidth: '16',
    alignSelf: 'center',
    marginTop: -0.5,
  },
});

export default MapComponent;
