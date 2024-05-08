import {Image, View} from 'react-native';
import GifImage from '@lowkey/react-native-gif';

const SplashScreen = ({navigation}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FastImage
        style={{width: 200, height: 200}}
        source={{
          uri: 'https://media.tenor.com/images/1c39f2d94b02d8c9366de265d0fba8a0/tenor.gif',
          headers: {Authorization: 'someAuthToken'},
          priority: FastImage.priority.normal,
        }}
      />
    </View>
  );
};

export default SplashScreen;
