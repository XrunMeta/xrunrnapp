import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';

// Shake Range Effect
const getRandomOffset = (value, range = 10) => {
  return value + (Math.random() * (range * 2) - range); // ±20 from start position
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
  {id: 6, x: 0, y: -100},
  {id: 7, x: 100, y: -50},
  {id: 8, x: -100, y: -50},
  {id: 9, x: 0, y: 200},
];

const AnimatedSpot = ({id, clickable}) => {
  const position = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const scaleAnim = useRef(new Animated.Value(0)).current; // Default scale 0
  const fadeAnim = useRef(new Animated.Value(0)).current; // Default opacity 0
  const shakeAnimation = useRef(null);

  const startShakeAnimation = () => {
    shakeAnimation.current = Animated.sequence([
      Animated.timing(position, {
        toValue: {
          x: getRandomOffset(spots[id - 1].x), // Add radom offset
          y: getRandomOffset(spots[id - 1].y),
        },
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(position, {
        toValue: {
          x: spots[id - 1].x,
          y: spots[id - 1].y,
        },
        duration: 150,
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
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // ]).start(() => startShakeAnimation()); // Start shake when Object in

      // // Remove object after 5s
      // setTimeout(() => {
      //   // Animated.timing(position, {
      //   //   toValue: {
      //   //     x: position.x,
      //   //     y: position.y,
      //   //   },
      //   //   duration: 500,
      //   //   useNativeDriver: true,
      //   // }).start();
      //   startExitAnimation();
      // }, 5000);
    ]).start(() => {
      startShakeAnimation(); // Mulai shake setelah masuk

      // Mulai animasi keluar setelah delay
      setTimeout(() => {
        stopShakeAndStartExit(); // Fungsi baru untuk stop shake dan exit
      }, 4000);
    });
  }, []);

  const stopShakeAndStartExit = () => {
    // Stop shake animation
    shakeAnimation.current && shakeAnimation.current.stop();

    // Exit animation
    Animated.parallel([
      Animated.timing(position, {
        toValue: {
          x: Math.random() * 300 - 150, // Kembali ke posisi acak di luar layar
          y: Math.random() * 300 - 150,
        },
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0, // Skala mengecil ke 0
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0, // Opacity menjadi 0
        duration: 1000,
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
                  -200 + getRandomObjectOffset(0, 30),
                  200 + getRandomObjectOffset(0, 30),
                ],
              }),
            },
            {
              translateY: position.y.interpolate({
                inputRange: [-200, 200],
                outputRange: [
                  -200 + getRandomObjectOffset(0, 30),
                  200 + getRandomObjectOffset(0, 30),
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
