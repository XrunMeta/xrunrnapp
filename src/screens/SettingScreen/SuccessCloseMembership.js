import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {getLanguage2} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import {useAuth} from '../../context/AuthContext/AuthContext';

// ########## Main Function ##########
const SuccessCloseMembership = () => {
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [lang, setLang] = useState({});
  const {logout} = useAuth();

  useEffect(() => {
    // Get Language
    const fetchLangData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        setLang(screenLang);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    fetchLangData();
  }, []);

  const onSubmit = async () => {
    logout();

    // Go to SignIn Screen
    navigation.reset({
      index: 0,
      routes: [{name: 'SignIn'}],
    });
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Content Section */}
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
        <Text
          style={[
            styles.normalText,
            {textAlign: 'center', fontFamily: 'Poppins-Bold', fontSize: 16},
          ]}>
          {lang &&
          lang.screen_setting &&
          lang.screen_setting.close &&
          lang.screen_setting.close.desc
            ? lang.screen_setting.close.desc.success_title
            : ''}
        </Text>
        <Text style={[styles.normalText, {textAlign: 'center'}]}>
          {lang &&
          lang.screen_setting &&
          lang.screen_setting.close &&
          lang.screen_setting.close.desc
            ? lang.screen_setting.close.desc.success_desc
            : ''}
        </Text>
      </View>

      {/* Bottom Section*/}
      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSubmit} style={styles.buttonSignIn}>
          <Image
            source={require('../../../assets/images/icon_check.png')}
            resizeMode="contain"
            style={styles.buttonSignInImage}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
  normalText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
  },
  bottomSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
  },
});

export default SuccessCloseMembership;
