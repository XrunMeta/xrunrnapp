import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getLanguage2, URL_API, getFontFam, fontSize} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../../context/AuthContext/AuthContext';
import crashlytics from '@react-native-firebase/crashlytics';

// ########## Main Function ##########
const SuccessJoinScreen = () => {
  const route = useRoute();
  const {email, pin} = route.params;
  const {login} = useAuth();
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [lang, setLang] = useState({});

  useEffect(() => {
    // Get Language
    const fetchLangData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        setLang(screenLang);

        const response = await fetch(
          `${URL_API}&act=login-01&tp=4&email=${email}&pin=${pin}`,
        );
        const data = await response.json();

        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        login();
        console.log('Signin abis signup bisa boy -> ' + JSON.stringify(data));
      } catch (err) {
        console.error('Error retrieving Signin:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    fetchLangData();
  }, []);

  const onSignIn = async () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
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
          gap: 50,
        }}>
        <Image
          source={require('../../../assets/images/icon_successjoin.png')}
          resizeMode="contain"
          style={{
            height: 200,
            width: 200,
          }}
        />
        <View style={{alignItems: 'center'}}>
          <Text style={styles.normalText}>
            {lang && lang.screen_notExist && lang.screen_notExist.field_join
              ? lang.screen_notExist.field_join.str1
              : ''}
          </Text>
          <Text style={styles.normalText}>
            {lang && lang.screen_notExist && lang.screen_notExist.field_join
              ? lang.screen_notExist.field_join.str2
              : ''}
            <Text
              style={{color: '#da7750', fontFamily: getFontFam() + 'Medium'}}>
              {lang && lang.screen_notExist && lang.screen_notExist.field_join
                ? lang.screen_notExist.field_join.str3
                : ''}
            </Text>
          </Text>
        </View>
      </View>

      {/* Bottom Section*/}
      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSignIn} style={styles.buttonSignIn}>
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
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

export default SuccessJoinScreen;
