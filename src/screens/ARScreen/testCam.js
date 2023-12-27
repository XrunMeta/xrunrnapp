import React, {useRef, useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {CameraRuntimeError, useCameraDevice} from 'react-native-vision-camera';
import {Camera} from 'react-native-vision-camera';

function TestCam() {
  const cameraRef = useRef(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);

  const device = useCameraDevice('back'); // 'back' or 'front' for camera position

  const onInitialized = () => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  };

  const onError = error => {
    console.error(error);
    console.log('Error ni boy');
  };

  useEffect(() => {
    return () => {
      // Cleanup code if needed
    };
  }, []);

  return (
    <View style={styles.container}>
      {device != null && (
        <Camera
          ref={cameraRef}
          style={styles.cameraPreview}
          device={device}
          onInitialized={onInitialized}
          onError={onError}
          orientation="portrait"
          photo={true}
          video={false}
          audio={false}
          fps={30}
          isActive={true}
        />
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
