import AppInformation from '../screens/AppInformation/AppInformation';
import {createStackNavigator} from '@react-navigation/stack';

const InfoNavigator = createStackNavigator({
  AppInformation: {
    screen: AppInformation,
    navigationOptions: {
      headerShown: false,
    },
  },
});

export default createAppContainer(InfoNavigator);
