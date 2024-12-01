import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import {fontSize, getFontFam} from '../../../utils';

// Fungsi khusus untuk objek 1 dengan range kecil
const getShakeRange = id => {
  return id === 1 ? 5 : 10; // Range 5 untuk objek 1, 10 untuk lainnya
};

// Shake Range Effect
const getRandomOffset = (value, range) => {
  return value + (Math.random() * (range * 2) - range);
};

// Object Position Randomize
const getRandomObjectOffset = (value, range = 100) => {
  const offset = Math.random() * (range * 2) - range; // Range between -20 until 20
  return value + offset;
};

const spots = [
  {id: 1, x: 0, y: 0}, // Clickable is center
  {id: 2, x: -100, y: 50},
  {id: 3, x: 100, y: 50},
  {id: 4, x: -50, y: 150},
  {id: 5, x: 50, y: 150},
  {id: 6, x: 0, y: -140},
  {id: 7, x: 100, y: -50},
  {id: 8, x: -100, y: -50},
  {id: 9, x: -100, y: 240},
];

const AnimatedSpot = ({id, clickable}) => {
  const position = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const scaleAnim = useRef(new Animated.Value(0)).current; // Default scale 0
  const fadeAnim = useRef(new Animated.Value(0)).current; // Default opacity 0
  const shakeAnimation = useRef(null);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  const startShakeAnimation = () => {
    const shakeRange = getShakeRange(id);
    shakeAnimation.current = Animated.sequence([
      Animated.timing(position, {
        toValue: {
          x: getRandomOffset(spots[id - 1].x, shakeRange), // Add radom offset
          y: getRandomOffset(spots[id - 1].y, shakeRange),
        },
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(position, {
        toValue: {
          x: spots[id - 1].x,
          y: spots[id - 1].y,
        },
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    shakeAnimation.current.start(() => startShakeAnimation()); // Recursive to start shake
  };

  useEffect(() => {
    // Default position since out of screen
    position.setValue({
      x: Math.random() * 300 - 150,
      y: Math.random() * 300 - 150,
    });

    // Catch Blink Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.3, // Opacity turun ke 0.3
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1, // Opacity naik kembali ke 1
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // In Animation to position
    Animated.parallel([
      Animated.timing(position, {
        toValue: {
          x: getRandomObjectOffset(spots[id - 1].x),
          y: getRandomObjectOffset(spots[id - 1].y),
        },
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => startShakeAnimation()); // Start shake when Object in

    // Remove object after 5s
    setTimeout(() => {
      stopShakeAndStartExit();
    }, 5000);
  }, []);

  const stopShakeAndStartExit = () => {
    // Stop shake animation
    shakeAnimation.current && shakeAnimation.current.stop();

    // Tentukan arah lempar secara acak: kiri (-) atau kanan (+)
    const direction = Math.random() < 0.5 ? -1 : 1;

    // Tentukan posisi akhir lempar, jauh di luar layar
    const throwDistance = 700 * direction; // 300 unit ke kiri atau kanan

    // Exit animation (lempar keluar)
    Animated.parallel([
      Animated.timing(position, {
        toValue: {
          x: spots[id - 1].x + throwDistance, // Tambahkan jarak lempar
          y: spots[id - 1].y,
        },
        duration: 600,
        easing: Easing.out(Easing.quad), // Easing lebih halus keluar layar
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0, // Skala mengecil ke 0
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0, // Opacity menjadi 0
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(); // Animasi selesai tanpa loop
  };

  return (
    <Animated.View
      style={[
        styles.spot,
        {
          backgroundColor: clickable ? 'yellow' : 'white',
          opacity: fadeAnim,
          transform: [
            // Coin Positioning at Screen (Adjust range at parameter || normal 0-30)
            {
              translateX: position.x.interpolate({
                inputRange: [-200, 200],
                outputRange: [
                  -200 + getRandomObjectOffset(0, 5),
                  200 + getRandomObjectOffset(0, 5),
                ],
              }),
            },
            {
              translateY: position.y.interpolate({
                inputRange: [-200, 200],
                outputRange: [
                  -200 + getRandomObjectOffset(0, 5),
                  200 + getRandomObjectOffset(0, 5),
                ],
              }),
            },
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1], // Scale in from small to big
              }),
            },
          ],
        },
      ]}>
      <Text style={{fontWeight: 'bold'}}>{id}</Text>
      <ImageBackground
        source={require('../../../assets/images/image_arcoin_wrapper2.png')}
        style={{
          resizeMode: 'contain',
          height: 165,
          width: 120,
          alignItems: 'center',
          borderRadius: 55,
        }}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
          {/* {parseFloat(item.distance) < 30 && ( */}
          {parseFloat(10) < 30 && (
            <>
              <Animated.Image
                source={require('../../../assets/images/icon_catch.png')}
                style={[
                  {
                    resizeMode: 'contain',
                    height: 140,
                    width: 140,
                    position: 'absolute',
                    top: -105,
                    opacity: blinkAnim,
                  },
                ]}
              />
            </>
          )}
          <TouchableOpacity
            // onPress={() =>
            //   clickedCoin(userData.member, item.advertisement, item.coin)
            // }
            // disabled={parseFloat(item.distance) < 30 ? false : true}
            style={{
              height: 125,
              width: 125,
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={require('./../../../assets/images/icon_xrun_white.png')}
              style={{
                height: 45,
                width: 45,
              }}
            />
            <Text
              style={{
                fontFamily: getFontFam() + 'Medium',
                fontSize: fontSize('subtitle'),
                color: 'white',
                marginTop: 5,
              }}>
              {/* {item.coins}
              {item.title} */}
              10XRUN
            </Text>
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('body'),
                color: 'grey',
                marginTop: -5,
              }}>
              {/* {item.distance}M */}
              5M
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const ARScreen = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 6000); // Repeat animation
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {visible &&
        spots.map(spot => (
          <AnimatedSpot key={spot.id} id={spot.id} clickable={spot.id === 1} />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 150,
    left: 0,
  },
  spot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#000',
  },
});

export default ARScreen;
