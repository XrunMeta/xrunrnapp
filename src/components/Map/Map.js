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

const MapComponent = ({clickedMarker, clickedRange}) => {
  const [pin, setPin] = useState({
    latitude: 37.4226711,
    longitude: -122.0849872,
  });
  const [pinTarget, setPinTarget] = useState({
    latitude: -6.294915,
    longitude: 106.785179,
  });
  const [initialRegion, setInitialRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markersData, setMarkersData] = useState([]);
  const [brandLogo, setBrandLogo] = useState([]);
  const [adThumbnail, setAdThumbnail] = useState([]);
  const [distance, setDistance] = useState(null);

  const saveBlobAsImage = async (blob, filename) => {
    const path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;
    await RNFetchBlob.fs.writeFile(path, blob, 'base64');
    return path;
  };

  useEffect(() => {
    // Get Self Cordinate
    const getSelfCoordinate = async () => {
      try {
        const selfCoordinate = await AsyncStorage.getItem('selfCoordinate');

        if (selfCoordinate !== null) {
          const coordinate = JSON.parse(selfCoordinate);

          setPin(coordinate);
          setLoading(false);

          // Call API for getting Coin on Map
          const data = await fetchMarkerData(
            coordinate.latitude,
            coordinate.longitude,
          );

          // Saving to State
          if (data) {
            setMarkersData(data.data);

            data.data.map(async item => {
              const brandLogo = await saveBlobAsImage(
                item.brandlogo,
                `${item.coin}.png`,
              );

              const adThumbnail = await saveBlobAsImage(
                item.adthumbnail2,
                `${item.coin}.png`,
              );

              setBrandLogo(brandLogo);
              setAdThumbnail(adThumbnail);
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
    // Update Self Coordinate repeatable
    const getCurrentLocation = async () => {
      // IOS
      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization('whenInUse').then(result => {
          if (result === 'granted') {
            // Is Permission = true -> Get Coordinate
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
        // ANDROID
      } else if (Platform.OS === 'android') {
        // Ask for Permission
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
            // Is Permission = true -> Get Coordinate
            Geolocation.getCurrentPosition(
              position => {
                // Set To State
                setPin({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });

                // console.log(
                //   `Lat : ${position.coords.latitude} --- Lng : ${position.coords.longitude}
                //   `,
                // );
              },
              error => {
                console.error(error);
              },
              {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
            );
          } else {
            // Is Permission = false -> Do something
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    // Get Update for Coordinate
    getCurrentLocation();
  });

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        // Dapatkan lokasi pengguna (position.coords.latitude dan position.coords.longitude)
        // Hitung jarak antara pengguna dan lokasi tujuan
        const newDistance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          pinTarget.latitude,
          pinTarget.longitude,
        );
        // Perbarui teks yang menampilkan jarak
        setDistance(newDistance);
        clickedRange(newDistance);
        // console.log('Jarak : ', newDistance);
      },
      error => {
        console.error(error);
      },
      {
        enableHighAccuracy: true, // Aktifkan untuk mendapatkan akurasi tinggi jika perlu
        distanceFilter: 10, // Atur threshold perubahan jarak yang akan memicu pemanggilan fungsi
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [pin]);

  const handleMarkerClick = item => {
    // Memanggil prop onMarkerClick sebagai fungsi
    clickedMarker(item);
    setPinTarget({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lng),
    });
  };

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth Radius on Kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const range = R * c; // Range on Kilometers
    return range;
  }

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
          showsUserLocation={true}
          showsMyLocationButton={false}>
          <Circle center={pin} radius={500} />
          {/* {console.log('Jarak Sekarang : ', distance)} */}

          {markersData &&
            markersData.map &&
            adThumbnail &&
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
                  // source={require('../../../assets/images/logo_xrun.png')} // Gantilah dengan path yang sesuai
                  source={{uri: `file://${adThumbnail}`}} // Gantilah dengan path yang sesuai
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
                          source={{uri: `file://${brandLogo}`}} // Gantilah dengan path yang sesuai
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
                        {/* {console.log(
                          `Jarak coin ${item.coin} = `,
                          item.distance,
                        )} */}
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
