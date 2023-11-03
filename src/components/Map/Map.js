import React, {useEffect, useState, useRef} from 'react';
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
import logoMarker from '../../../assets/images/logo_xrun.png';

// ########## Main Component ##########
const MapComponent = ({
  clickedMarker, // Get Data from Clicked Marker
  clickedRange, // Get Range from Clicked Marker
  brandCount, // Get Count of Brand from API
  markerCount, // Get Count of Marker That Shown on Map
  bigCoinCount, // Get Count of Big Coin from API
  degToTarget, // Get Degrees from User Coordinate -> Target Coordinate
  shouldResetMap,
  onResetMap,
}) => {
  const [pin, setPin] = useState({
    latitude: 37.4226711,
    longitude: -122.0849872,
  }); // Get User Coordinate
  const [pinTarget, setPinTarget] = useState({
    latitude: -6.294915,
    longitude: 106.785179,
  }); // Get Target Coordinate
  const [loading, setLoading] = useState(true); // Get Loading Info
  const [markersData, setMarkersData] = useState([]); // Save Marker Data from API
  const [brandLogo, setBrandLogo] = useState([]); // Save Brand Logo from BLOB API
  const [adThumbnail, setAdThumbnail] = useState([]); // Save AdThumbnail from BLOB API
  const mapRef = useRef(null);
  const [brandLogoCachePath, setBrandLogoCachePatch] = useState('');
  const [adThumbnailCachePath, setAdThumbnailPath] = useState('');

  // Blob to base64 PNG Converter
  const saveBlobAsImage = async (blob, filename) => {
    const path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;
    await RNFetchBlob.fs.writeFile(path, blob, 'base64');
    return path;
  };

  // 1 Time Use Effect
  useEffect(() => {
    // Get Self Cordinate from AsyncStorage
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
          console.log('Datanya : ' + JSON.stringify(data.data));

          if (data) {
            setMarkersData(data.data);

            // Get XRUN Brand
            let brandcount = 0;
            let currentBrand = null;

            data.data.forEach(item => {
              const brand = item.advertisement;

              // Make sure Brand(Advertisement) isn't duplicate
              if (brand !== currentBrand) {
                currentBrand = brand;
                brandcount++;
              }
            });

            // Get Big Coin
            const getBigCoin = data.data.filter(
              item => item.isbigcoin === '1',
            ).length;

            // Set to Props
            markerCount(data.data.length);
            brandCount(brandcount);
            bigCoinCount(getBigCoin);

            // Save BLOB to State
            // data.data.map(async item => {
            //   const brandLogo = await saveBlobAsImage(
            //     item.brandlogo,
            //     `${item.coin}.png`,
            //   );

            //   const adThumbnail = await saveBlobAsImage(
            //     item.adthumbnail2,
            //     `${item.coin}.png`,
            //   );

            //   setBrandLogo(brandLogo);
            //   setAdThumbnail(adThumbnail);
            // });
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

  // Tick Call UseEffect
  useEffect(() => {
    // Update Self Coordinate repeatable
    const getCurrentLocation = async () => {
      // ----- IOS
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
        // ----- ANDROID
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

  // As 'pin' change useEffect
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        // Get Range from User -> Target
        const newDistance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          pinTarget.latitude,
          pinTarget.longitude,
        );

        // Get Degrees from User -> Target
        const deg = arcT(
          position.coords.latitude,
          position.coords.longitude,
          pinTarget.latitude,
          pinTarget.longitude,
        );

        // Set to Props
        degToTarget(deg);
        clickedRange(newDistance);
      },
      error => {
        console.error(error);
      },
      {
        enableHighAccuracy: true, // True = Get High Acccuration
        distanceFilter: 10, // Set Treshold That Will Trigger Function Call
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [pin]);

  // As 'shouldResetMap' change useEffect
  useEffect(() => {
    if (shouldResetMap && mapRef.current) {
      const initialRegion = {
        latitude: pin.latitude,
        longitude: pin.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      mapRef.current.animateToRegion(initialRegion, 1000);

      onResetMap();
    }
  }, [shouldResetMap]);

  // When Marker is Clicked
  const handleMarkerClick = item => {
    clickedMarker(item);

    setPinTarget({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lng),
    });
  };

  // Count distance between Current Postition -> Target Position
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

  // Get Degrees between Current Postition -> Target Position
  function arcT(lat1, lon1, lat2, lon2) {
    const delLat = lat2 - lat1;
    const delLon = lon2 - lon1;

    let deg = 0;
    deg = Math.atan2(delLon, delLat);
    deg = (deg * 180) / Math.PI;

    return deg;
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>
          {console.log(
            `Loading = true => Lat: ${pin.latitude} & Lng: ${pin.longitude}`,
          )}
          Loading...
        </Text> // Show Loading While Data is Load
      ) : (
        <MapView
          ref={mapRef}
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
          {/* <Circle center={pin} radius={100} /> */}
          {/* {markersData &&
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
                  // source={{uri: `file://${adThumbnail}`}}
                  source={logoMarker}
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
                          // source={{uri: `file://${brandLogo}`}}
                          source={logoMarker}
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
            ))} */}
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
