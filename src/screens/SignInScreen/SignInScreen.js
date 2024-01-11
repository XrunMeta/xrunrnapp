import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput/';
import ButtonBack from '../../components/ButtonBack/';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';
import {screensEnabled} from 'react-native-screens';

const langData = require('../../../lang.json');

const SignInScreen = () => {
  const [lang, setLang] = useState({});
  const {isLoggedIn, login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (email.trim() === '') {
      Alert.alert(
        'Error',
        lang && lang.screen_signin && lang.screen_signin.alert
          ? lang.screen_signin.alert.emptyEmail
          : '',
      );
    } else if (!isValidEmail(email)) {
      Alert.alert(
        'Error',
        lang && lang.screen_signin && lang.screen_signin.alert
          ? lang.screen_signin.alert.invalidEmail
          : '',
      );
    } else if (password.trim() === '') {
      Alert.alert(
        'Error',
        lang && lang.screen_signin && lang.screen_signin.alert
          ? lang.screen_signin.alert.emptyPassword
          : '',
      );
    } else {
      try {
        const response = await fetch(
          `${URL_API}&act=login-checker&email=${email}&pin=${password}`,
        );
        const data = await response.text();

        if (data === 'OK') {
          await AsyncStorage.setItem('userEmail', email);
          login();

          navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          });

          // Simpan session dan navigasi ke halaman selanjutnya
        } else {
          Alert.alert(
            'Error',
            lang && lang.screen_signin ? lang.screen_signin.failedLogin : '',
          );
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while logging in');
      }
    }
  };

  const isValidEmail = email => {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
  };

  onEmailChange = text => {
    setEmail(text);
    setIsEmailValid(isValidEmail(text));
  };

  const onEmailAuth = () => {
    navigation.navigate('EmailAuth', {screenBack: 'SignIn'});
  };

  const onBack = () => {
    navigation.navigate('First');
  };

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage();
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        <View style={styles.titleWrapper}>
          {/* <Text style={styles.title}>Login Via E-mail</Text> */}
          <Text style={styles.title}>
            {lang && lang.screen_signin && lang.screen_signin.title
              ? lang.screen_signin.title
              : ''}
          </Text>
          <Text style={styles.subTitle}>
            {lang && lang.screen_signin && lang.screen_signin.subTitle
              ? lang.screen_signin.subTitle
              : ''}
          </Text>
        </View>

        <CustomInput
          label={
            lang && lang.screen_signin && lang.screen_signin.email
              ? lang.screen_signin.email.label
              : ''
          }
          placeholder={
            lang && lang.screen_signin && lang.screen_signin.email
              ? lang.screen_signin.email.placeholder
              : ''
          }
          value={email}
          // setValue={setEmail}
          setValue={onEmailChange}
          isPassword={false}
        />
        {isEmailValid ? null : (
          <Text
            style={{
              alignSelf: 'flex-start',
              marginLeft: 25,
              color: 'red',
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
            }}>
            {lang && lang.screen_signin && lang.screen_signin.validator
              ? lang.screen_signin.validator
              : ''}
          </Text>
        )}

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

        <View style={[styles.bottomSection]}>
          <View style={styles.additionalLogin}>
            <Text style={styles.normalText}>
              {lang && lang.screen_signin && lang.screen_signin.authcode
                ? lang.screen_signin.authcode.label + ' '
                : ''}
            </Text>
            <Pressable onPress={onEmailAuth} style={styles.resetPassword}>
              <Text style={styles.emailAuth}>
                {lang && lang.screen_signin && lang.screen_signin.authcode
                  ? lang.screen_signin.authcode.link
                  : ''}
              </Text>
            </Pressable>
          </View>
          <Pressable onPress={onSignIn} style={styles.buttonSignIn}>
            <Image
              source={require('../../../assets/images/icon_next.png')}
              resizeMode="contain"
              style={styles.buttonSignInImage}
            />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
  },
  titleWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#343a59',
  },
  subTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#343a59',
    marginTop: -5,
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
  normalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#343a59',
  },
  emailAuth: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#343a59',
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

export default SignInScreen;
