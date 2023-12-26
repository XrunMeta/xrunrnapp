import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Linking,
  TouchableOpacity,
  Image,
  ImageBackground,
  Text,
  Dimensions,
} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

function ARScreen() {
  const [isCameraReady, setCameraReady] = useState(false);
  const device = useCameraDevice('back');
  const [coins, setCoins] = useState([]);
  const bouncingCoinTranslateY = useSharedValue(-250);
  const blinkOpacity = useSharedValue(1);
  const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');
  const COIN_WIDTH = 150; // Ganti dengan lebar gambar koin Anda
  const COIN_HEIGHT = 275; // Ganti dengan tinggi gambar koin Anda

  const jsonData = [
    {id: 1, data: 'Data 1'},
    {id: 2, data: 'Data 2'},
    {id: 3, data: 'Data 3'},
    {id: 4, data: 'Data 4'},
    {id: 5, data: 'Data 5'},
    {id: 6, data: 'Data 6'},
    {id: 7, data: 'Data 7'},
    {id: 8, data: 'Data 8'},
    {id: 9, data: 'Data 9'},
    {id: 10, data: 'Data 10'},
    {id: 11, data: 'Data 11'},
    {id: 12, data: 'Data 12'},
  ];

  useEffect(() => {
    // Writing the getPermissions function to get the permissions
    async function getPermissions() {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      console.log('cameraPermission permission status: ', cameraPermission);
      if (cameraPermission !== 'granted') await Linking.openSettings();
      else setCameraReady(true);
    }

    getPermissions();
  }, []);

  const clickedCoin = item => {
    console.log('Coin Clicked -> ', item);
  };

  const animateBouncingCoin = () => {
    bouncingCoinTranslateY.value = withRepeat(
      withSpring(200, {
        mass: 2.1,
        damping: 10,
        stiffness: 192,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        reduceMotion: Easing.bounce,
      }),
      -1,
      true,
    );
  };

  const animateBlink = () => {
    blinkOpacity.value = withRepeat(withSpring(0, {duration: 500}), -1, true);
  };

  useEffect(() => {
    let currentIndex = 0;

    const displayItems = () => {
      const shuffledData = [...jsonData].sort(() => Math.random() - 0.5);

      const displayCount = Math.min(
        shuffledData.length - currentIndex,
        Math.floor(Math.random() * 5) + 1,
      );

      const itemsToDisplay = shuffledData
        .slice(currentIndex, currentIndex + displayCount)
        .map(item => ({
          ...item,
          position: {
            x: Math.random() * (WINDOW_WIDTH - COIN_WIDTH),
            y: Math.random() * (WINDOW_HEIGHT - COIN_HEIGHT),
          },
        }));

      setCoins(itemsToDisplay);

      // Animasikan setiap koin
      animateBouncingCoin();

      // Mulai animasi blink setiap kali koin berubah
      animateBlink();

      setTimeout(() => {
        setCoins([]);
      }, 3000);

      currentIndex = (currentIndex + displayCount) % shuffledData.length;
    };

    const intervalId = setInterval(displayItems, 4000);

    // Hentikan interval ketika komponen di-unmount
    return () => clearInterval(intervalId);
  }, [jsonData, coins]); // Perubahan coins ditambahkan di sini

  const bouncingCoinAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: bouncingCoinTranslateY.value}],
    };
  });

  const blinkAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: blinkOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {isCameraReady && device && (
          <>
            <Camera
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
              device={device}
              isActive={true}
              photo={false}></Camera>
            <View
              style={{
                position: 'absolute',
                backgroundColor: '#001a477a',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}>
              {coins.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={[
                    {
                      position: 'absolute',
                      left: item.position.x,
                      top: item.position.y,
                      width: 150,
                      height: 275,
                    },
                    bouncingCoinAnimatedStyle,
                  ]}>
                  <TouchableOpacity onPress={() => clickedCoin('Jamal')}>
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Animated.Image
                        source={require('../../../assets/images/icon_catch.png')}
                        style={[
                          {
                            resizeMode: 'contain',
                            height: 140,
                            width: 140,
                          },
                          blinkAnimatedStyle,
                        ]}
                      />
                      <ImageBackground
                        source={require('../../../assets/images/image_arcoin_wrapper.png')}
                        style={{
                          resizeMode: 'contain',
                          height: 155,
                          width: 114,
                          marginTop: -30,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Image
                          source={require('../../../assets/images/logo_xrun.png')}
                          style={{
                            height: 50,
                            width: 50,
                            marginTop: -35,
                          }}
                        />
                        <Text
                          style={{
                            fontFamily: 'Poppins-SemiBold',
                            fontSize: 16,
                            color: 'white',
                          }}>
                          0.05XRUN
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Poppins-Regular',
                            fontSize: 13,
                            color: 'grey',
                            marginTop: -7,
                          }}>
                          2M
                        </Text>
                      </ImageBackground>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ARScreen;
