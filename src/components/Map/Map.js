import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  createRef,
} from 'react';
import {View, StyleSheet, Text, Image, ActivityIndicator} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Callout} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchMarkerData} from './APIGetMarker';
import RNFetchBlob from 'rn-fetch-blob';
import logoMarker from '../../../assets/images/logo_xrun.png';
import RangeText from './RangeText';

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
  lang,
  jamal,
}) => {
  const [pin, setPin] = useState(null); // Get User Coordinate
  const [pinTarget, setPinTarget] = useState(0); // Get Target Coordinate
  const [loading, setLoading] = useState(true); // Get Loading Info
  const [markersData, setMarkersData] = useState([]); // Save Marker Data from API
  const [brandLogo, setBrandLogo] = useState([]); // Save Brand Logo from BLOB API
  const [adThumbnail, setAdThumbnail] = useState([]); // Save AdThumbnail from BLOB API
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const markerRefs = useRef(markersData.map(() => createRef()));
  const prevUserCoordinate = useRef({
    latitude: 0,
    longitude: 0,
  });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [nearestMarkerDistance, setNearestMarkerDistance] = useState(
    Number.MAX_VALUE,
  );
  const [localClickedRange, setLocalClickedRange] = useState(0);

  // Blob to base64 PNG Converter
  const saveBlobAsImage = async (blob, filename) => {
    const path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;
    await RNFetchBlob.fs.writeFile(path, blob, 'base64');
    return path;
  };

  // Get Self Cordinate from AsyncStorage
  const getSelfCoordinate = async () => {
    try {
      const selfCoordinate = await AsyncStorage.getItem('selfCoordinate');

      if (selfCoordinate !== null) {
        const coordinate = JSON.parse(selfCoordinate);

        setPin(coordinate);

        // Call API for getting Coin on Map
        const data = await fetchMarkerData(
          coordinate.latitude,
          coordinate.longitude,
        );

        if (data) {
          setMarkersData(data.data);

          console.log('getSelfCoordinate() dipanggil');

          // Set default coordinate for Pin Target
          const nearestCoin = data.data.reduce(
            (nearest, item) => {
              const markerLatitude = parseFloat(item.lat);
              const markerLongitude = parseFloat(item.lng);
              const targetDistance = calculateDistance(
                coordinate.latitude,
                coordinate.longitude,
                markerLatitude,
                markerLongitude,
              );

              if (targetDistance < nearest.targetDistance) {
                return {
                  targetDistance,
                  latitude: markerLatitude,
                  longitude: markerLongitude,
                };
              }

              return nearest;
            },
            {targetDistance: Number.MAX_VALUE, latitude: 0, longitude: 0},
          );

          setPinTarget({
            latitude: nearestCoin.latitude,
            longitude: nearestCoin.longitude,
          });

          // Get XRUN Brand
          let brandcount = 0;
          let currentBrand = null;

          // Hitung jarak dari pengguna ke setiap marker dan temukan yang terdekat
          const userLatitude = coordinate.latitude;
          const userLongitude = coordinate.longitude;

          let nearestDistance = Number.MAX_VALUE;

          data.data.forEach(item => {
            const brand = item.advertisement;

            // Make sure Brand(Advertisement) isn't duplicate
            if (brand !== currentBrand) {
              currentBrand = brand;
              brandcount++;
            }

            const markerLatitude = parseFloat(item.lat);
            const markerLongitude = parseFloat(item.lng);
            const distance = calculateDistance(
              userLatitude,
              userLongitude,
              markerLatitude,
              markerLongitude,
            );

            if (distance < nearestDistance) {
              nearestDistance = distance;
            }
          });

          // Set nilai awal untuk clickedRange dan nearestMarkerDistance
          clickedRange(nearestDistance);
          setNearestMarkerDistance(nearestDistance);

          // Get Big Coin
          const getBigCoin = data.data.filter(
            item => item.isbigcoin === '1',
          ).length;

          // Set to Props
          markerCount(data.data.length);
          brandCount(brandcount);
          bigCoinCount(getBigCoin);

          // Save BLOB to State
          const imagePromises = data.data.map(async item => {
            // const brandLogo = await saveBlobAsImage(
            //   item.brandlogo,
            //   `${item.coin}.png`,
            // );

            const adThumbnail = await saveBlobAsImage(
              item.adthumbnail2,
              `${item.coin}.png`,
            );

            const brandLogo = item.brandlogo;

            return {brandLogo, adThumbnail};
          });

          // Waiting All Promise is finish
          Promise.all(imagePromises)
            .then(images => {
              const brandLogos = images.map(image => image.brandLogo);
              const adThumbnails = images.map(image => image.adThumbnail);

              setBrandLogo(brandLogos);
              setAdThumbnail(adThumbnails);

              setImagesLoaded(true);
              setLoading(false);
            })
            .catch(error => {
              console.error('Error while loading images:', error);
            });
        }
      }
    } catch (err) {
      console.error('Error retrieving selfCoordinate from AsyncStorage:', err);
    }
  };

  // 1 Time Use Effect
  useEffect(() => {
    getSelfCoordinate();
  }, []);

  // As 'pin' change useEffect
  const handlePinChange = useCallback(
    (position, target) => {
      // Get Range from User -> Target
      const newDistance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        target.latitude,
        target.longitude,
      );

      // Hanya perbarui posisi pengguna jika jarak lebih dari ambang tertentu
      if (newDistance > 0.001) {
        setPin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        degToTarget(
          arcT(
            position.coords.latitude,
            position.coords.longitude,
            target.latitude,
            target.longitude,
          ),
        );
        clickedRange(newDistance);

        var toMeter = (newDistance * 1000).toFixed(2);
        setLocalClickedRange(toMeter);
      }
    },
    [setPin, clickedRange, degToTarget, calculateDistance],
  );

  useEffect(() => {
    clickedRange(nearestMarkerDistance);
  }, [nearestMarkerDistance]);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        handlePinChange(position, pinTarget);

        // Mengambil koordinat pengguna saat ini
        const userCoordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Menghitung jarak antara koordinat pengguna saat ini dan sebelumnya
        const distance = calculateDistance(
          prevUserCoordinate.current.latitude,
          prevUserCoordinate.current.longitude,
          userCoordinate.latitude,
          userCoordinate.longitude,
        );

        // Jika perbedaan jarak melebihi 0.001, perbarui `pin` dan `degToTarget`
        if (distance > 0.0015) {
          handlePinChange(position, pinTarget);

          // Simpan koordinat pengguna saat ini sebagai koordinat sebelumnya
          prevUserCoordinate.current = userCoordinate;

          console.log('Jarak melebihi 0.0015 : ' + distance);

          getSelfCoordinate();
        }
      },
      error => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [handlePinChange, pinTarget]);

  // As 'shouldResetMap' change useEffect
  useEffect(() => {
    if (shouldResetMap && mapRef.current) {
      const initialRegion = {
        latitude: pin.latitude,
        longitude: pin.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };

      mapRef.current.animateToRegion(initialRegion, 1000);

      onResetMap();
    }
  }, [shouldResetMap]);

  // When Marker is Clicked
  const handleMarkerClick = item => {
    clickedMarker(item);
    setLocalClickedRange(localClickedRange);

    console.log('Marker di klik : ' + item.distance);

    const markerIndex = markersData.findIndex(m => m.coin === item.coin);
    const targetMarkerRef = markerRef.current[markerIndex];

    // console.log('Marker Index : ' + targetMarkerRef);

    // if (targetMarkerRef.current) {
    //   targetMarkerRef.current.showCallout();
    // }

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

  // Hide Default Marker Building
  const customMapStyle = [
    {
      featureType: 'poi',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
  ];

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.showCallout();
    }
  });

  // Menggunakan useMemo untuk menghindari pembaruan berulang
  const markers = useMemo(() => {
    if (!markersData) {
      return null;
    }

    return markersData.map((item, idx) => (
      <Marker
        // ref={markerRefs.current[idx]}
        ref={markerRef}
        key={item.coin}
        tracksInfoWindowChanges={true}
        coordinate={{
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lng),
        }}
        title={item.title}
        onPress={() => handleMarkerClick(item)}>
        <Image
          source={{uri: `file://${adThumbnail[idx]}`}}
          // source={logoMarker}
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
                  color: '#343a59',
                }}>
                <Image
                  source={{uri: `data:image/png;base64,${brandLogo[idx]}`}}
                  style={{
                    width: 37,
                    height: 37,
                  }}
                  onError={err => console.log('Error Cuy : ', err)}
                />
              </Text>
              <Text
                key={jamal}
                style={{
                  fontSize: 11,
                  fontFamily: 'Poppins-Medium',
                  color: '#343a59',
                }}>
                {jamal}m
              </Text>
            </View>
            {/* {console.log('Range Update : ' + localClickedRange)} */}
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
                  color: '#343a59',
                }}>
                {lang && lang.screen_map && lang.screen_map.section_marker
                  ? lang.screen_map.section_marker.desc1 + ' '
                  : ''}
                {item.brand}
                {'\n'}
                {lang && lang.screen_map && lang.screen_map.section_marker
                  ? lang.screen_map.section_marker.desc2 + ' '
                  : ''}
                {item.brand + '.'}
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
    ));
  }, [
    markersData,
    brandLogo,
    adThumbnail,
    setLocalClickedRange,
    jamal,
    clickedMarker,
  ]);

  // Main Return
  return (
    <View style={styles.container}>
      {/* <TouchableOpacity
        style={{
          backgroundColor: 'pink',
          zIndex: 10,
          position: 'absolute',
          top: '60%',
        }}
        onPress={() => jamsSkuy()}>
        <Text>Jamalllll : {jamal}</Text>
      </TouchableOpacity> */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#343a59" />
          <Text
            style={{
              color: 'white',
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
            }}>
            {lang && lang.screen_map && lang.screen_map.section_marker
              ? lang.screen_map.section_marker.loader
              : ''}
          </Text>
          {/* Show Loading While Data is Load */}
        </View>
      ) : (
        // Show Loading While Data is Load
        <MapView
          ref={mapRef}
          style={styles.mapStyle}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: pin.latitude,
            longitude: pin.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }}
          customMapStyle={customMapStyle}
          showsUserLocation={true}
          showsMyLocationButton={false}>
          {imagesLoaded ? (
            markers
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#343a59" />
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 13,
                }}>
                {lang && lang.screen_map && lang.screen_map.section_marker
                  ? lang.screen_map.section_marker.loader
                  : ''}
              </Text>
            </View>
          )}
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
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
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
