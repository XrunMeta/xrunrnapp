import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2} from '../../../utils';

const CloseConfirmPassword = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (password.trim() === '') {
      Alert.alert(
        'Error',
        lang && lang.screen_setting ? lang.screen_setting.close.del_empty : '',
      );
    } else {
      // try {
      //   const response = await fetch(
      //     `${URL_API}&act=login-checker&email=${email}&pin=${password}`,
      //   );
      //   const data = await response.text();
      //   if (data === 'OK') {
      //     navigation.replace('EditPassword');
      //   } else {
      //     Alert.alert('Error', 'password salah');
      //   }
      // } catch (error) {
      //   console.error('Error:', error);
      //   Alert.alert('Error', 'An error occurred while logging in');
      // }
    }
  };

  const onBack = () => {
    // navigation.navigate('First');
    navigation.goBack();
  };

  useEffect(() => {
    // Get Language
    const fetchDataLang = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const userEmail = await AsyncStorage.getItem('userEmail');

        setEmail(userEmail);

        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchDataLang();
  }, []);

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_setting && lang.screen_setting.close
              ? lang.screen_setting.close.del_title
              : ''}
          </Text>
        </View>
      </View>

      <CustomInput
        label={
          lang && lang.screen_signin && lang.screen_signin.password
            ? lang.screen_signin.password.label
            : ''
        }
        placeholder={
          lang && lang.screen_signin && lang.screen_signin.password
            ? lang.screen_signin.password.placeholder
            : ''
        }
        value={password}
        setValue={setPassword}
        secureTextEntry
        isPassword={true}
      />
      <View
        style={{
          width: '100%',
          paddingHorizontal: 25,
          marginTop: 5,
        }}>
        <Text style={styles.subTitle}>
          *
          {lang && lang.screen_setting && lang.screen_setting.close
            ? lang.screen_setting.close.del_d1
            : ''}
        </Text>
        <Text style={styles.subTitle}>
          {lang && lang.screen_setting && lang.screen_setting.close
            ? '  ' + lang.screen_setting.close.del_d2
            : ''}
        </Text>
      </View>

      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSignIn} style={styles.buttonSignIn}>
          <Image
            source={require('../../../assets/images/icon_next.png')}
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
    backgroundColor: 'white',
  },
  titleWrapper: {
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#051C60',
    margin: 10,
  },
  subTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#343a59',
    marginTop: -3,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    height: 100,
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
});

export default CloseConfirmPassword;
