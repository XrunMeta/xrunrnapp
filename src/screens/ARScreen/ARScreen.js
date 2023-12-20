import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import RNFS from 'react-native-fs';
import {ArViewerView} from 'react-native-ar-viewer';

const ARScreen = () => {
  const [localModelPath, setLocalModelPath] = useState([]);

  const modelLinks = [
    'https://ar-code.com/files/AR-Code-1679295711723.glb',
    'https://ar-code.com/files/AR-Code-1679296940880.glb',
    'https://ar-code.com/files/AR-Code-1683007809279.glb',
    'http://3.1.27.93/clubx/COIN.glb',
  ];

  const getFileName = url => {
    const arr = url.split('/');
    const fileName = arr[arr.length - 1];

    return fileName;
  };

  const checkModelExisted = url => {
    const fileName = getFileName(url);
    const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    RNFS.exists(localPath).then(res => {
      if (!res) {
        downloadModels(url, localPath);
      } else {
        const arr = [...localModelPath, localPath];
        const uniqueArray = [...new Set(arr)];
        setLocalModelPath([...uniqueArray]);
      }
    });
  };

  const downloadModels = async (url, localPath) => {
    await RNFS.downloadFile({
      fromUrl: url,
      toFile: localPath,
    }).promise;

    const arr = [...localModelPath, localPath];
    const uniqueArray = [...new Set(arr)];
    setLocalModelPath([...uniqueArray]);
  };

  console.log(localModelPath.length);

  useEffect(() => {
    modelLinks.forEach(link => {
      checkModelExisted(link);
    });
  }, [modelLinks.length]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}>
      {console.log('Bgst : ' + localModelPath[0])}
      <ArViewerView
        style={{flex: 1}}
        model={localModelPath[0]}
        lightEstimation
        manageDepth
        allowRotate
        allowScale
        allowTranslate
        disableInstantPlacement
        onStarted={() => console.log('started')}
        onEnded={() => console.log('ended')}
        onModelPlaced={() => console.log('model displayed')}
        onModelRemoved={() => console.log('model not visible anymore')}
        planeOrientation="both"
      />
    </View>
  );
};

export default ARScreen;

const styles = StyleSheet.create({});
