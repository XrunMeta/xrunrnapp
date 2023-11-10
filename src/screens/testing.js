import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Image, Text, TouchableOpacity} from 'react-native';
import CompassHeading from 'react-native-compass-heading';

export default function Testing() {
  const [compassHeading, setCompassHeading] = useState(0);
  const [targetLatitude, setTargetLatitude] = useState(-6.084946106296765);
  const [targetLongitude, setTargetLongitude] = useState(106.74708994805653);

  // Gyroscope Listener
  useEffect(() => {
    const degree_update_rate = 3;

    CompassHeading.start(degree_update_rate, ({heading}) => {
      setCompassHeading(heading);
    });

    return () => {
      CompassHeading.stop();
    };
  }, []);

  const calculateDirectionToTarget = () => {
    const deltaLongitude = targetLongitude;
    const deltaLatitude = targetLatitude;
    return (Math.atan2(deltaLongitude, deltaLatitude) * 180) / Math.PI;
  };

  const rotateCompassToTarget = (latitude, longitude) => {
    setTargetLatitude(latitude);
    setTargetLongitude(longitude);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            rotateCompassToTarget(-6.084946106296765, 106.74708994805653)
          }>
          <Text>-6.084946, 106.747090</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => rotateCompassToTarget(0, 0)}>
          <Text>Reset</Text>
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/images/compass.png')}
        style={{
          width: '50%',
          flex: 1,
          resizeMode: 'contain',
          transform: [
            {
              rotate: `${
                360 - (compassHeading + calculateDirectionToTarget())
              }deg`,
            },
          ],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#b58df1',
    padding: 10,
    borderRadius: 5,
  },
});
