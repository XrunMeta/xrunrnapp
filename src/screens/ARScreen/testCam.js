import React, {useRef, useState, useEffect} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {CameraRuntimeError, useCameraDevice} from 'react-native-vision-camera';
import {Camera} from 'react-native-vision-camera';

function TestCam() {
  const cameraRef = useRef(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [flash, setFlash] = useState('on');

  const device = useCameraDevice('back'); // 'back' or 'front' for camera position

  const onInitialized = () => {
    setIsCameraInitialized(true);
  };

  const onError = error => {
    console.error(error);
  };

  useEffect(() => {
    return () => {
      // Cleanup code if needed
    };
  }, []);

  return (
    <View style={styles.container}>
      {device != null && (
        <SafeAreaView>
          {/* <Camera
            ref={cameraRef}
            style={styles.cameraPreview}
            device={device}
            onInitialized={onInitialized}
            onError={onError}
            orientation="portrait"
            photo={true}
            fps={30}
            isActive={true}
            flash={true}
          /> */}
          {/* <Camera
            fps={25}
            torch={flash === 'on' ? 'on' : 'off'}
            onInitialized={() => setTimeout(() => setFlash('off'), 1000)}
            style={styles.cameraPreview}
            device={device}
            isActive={true}
            lowLightBoost={false}
          /> */}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPreview: {
    flex: 1,
    width: '100%',
    aspectRatio: 3 / 4, // You can adjust the aspect ratio based on your needs
  },
});

export default TestCam;
