// import {StyleSheet, Text, View} from 'react-native';
// import React, {useState} from 'react';
// import {
//   ViroARScene,
//   ViroText,
//   ViroConstants,
//   ViroARSceneNavigator,
// } from '@viro-community/react-viro';

// const SceneAR = () => {
//   const [text, setText] = useState('Initializing AR...');

//   function onInitialized(state, reason) {
//     console.log('guncelleme', state, reason);
//     if (state === ViroConstants.TRACKING_NORMAL) {
//       setText('Hello World');
//     } else if (state === ViroConstants.TRACKING_NONE) {
//       console.log('Loss Tracking');
//     }
//   }

//   return (
//     <ViroARScene onTrackingUpdated={onInitialized}>
//       <ViroText
//         text={text}
//         scale={[0.5, 0.5, 0.5]}
//         position={[0, 0, -1]}
//         style={{textAlignVertical: 'center', textAlign: 'center'}}
//       />
//     </ViroARScene>
//   );
// };

// const ARScreen = () => {
//   return (
//     <ViroARSceneNavigator
//       autofocus={true}
//       initialScene={{
//         scene: SceneAR,
//       }}
//       style={{flex: 1}}
//     />
//   );
// };

// export default ARScreen;

// const styles = StyleSheet.create({});

import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const ARScreen = () => {
  return (
    <View>
      <Text>ARScreen</Text>
    </View>
  );
};

export default ARScreen;

const styles = StyleSheet.create({});
