import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';

const spots = [
  {id: 1, x: 0, y: 0}, // Tengah
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
  const scaleAnim = useRef(new Animated.Value(0)).current; // Skala awal 0
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity awal 0

  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(position, {
        toValue: {
          x: spots[id - 1].x + (Math.random() * 10 - 5),
          y: spots[id - 1].y + (Math.random() * 10 - 5),
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
    ]).start(() => startShakeAnimation()); // Rekursif memulai lagi shake
  };

  useEffect(() => {
    // Posisi awal secara acak di luar layar
    position.setValue({
      x: Math.random() * 300 - 150,
      y: Math.random() * 300 - 150,
    });

    // Animasi masuk ke posisi
    Animated.parallel([
      Animated.timing(position, {
        toValue: {x: spots[id - 1].x, y: spots[id - 1].y},
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
    ]).start(() => startShakeAnimation()); // Mulai shake setelah masuk

    // Menghilangkan objek setelah 5 detik dengan fade out
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 5000);
  }, []);

  return (
    <Animated.View
      style={[
        styles.spot,
        {
          backgroundColor: clickable ? 'yellow' : 'white',
          opacity: fadeAnim,
          transform: [
            {translateX: position.x},
            {translateY: position.y},
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1], // Skala masuk dari kecil ke besar
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
    }, 6000); // Ulangi setiap 7 detik
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
