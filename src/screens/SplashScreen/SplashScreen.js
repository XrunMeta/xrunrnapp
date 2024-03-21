import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Image, View } from "react-native";
import Logo from '../../../assets/images/xrun_round.png'

const SplashScreen = ({navigation}) => {
 useEffect(() => {
	setTimeout(async () => {
		try {
			const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

			if(isLoggedIn) {
				navigation.reset({index: 0, routes: [{name: 'Home'}]});
				return;
			}else {
				navigation.reset({index: 0, routes: [{name: 'First'}]})
			}
		}catch(e) {
			console.log(`Failed get isLoggedIn from AsyncStorage: ${e}`)
		}
	}, 100);
 }, []);
 
 return (
	<View style={{flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}>
	 <Image source={Logo} />
 	</View>
 )
}

export default SplashScreen;