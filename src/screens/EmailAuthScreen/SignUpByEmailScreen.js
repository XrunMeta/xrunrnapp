import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2} from '../../../utils';

const SignUpByEmailScreen = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const route = useRoute();
  const {mobile, mobilecode, countrycode} = route.params;

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', lang.screen_notExist.field_email.emptyEmail);
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', lang.screen_notExist.field_email.invalidEmail);
    } else {
      try {
        const apiUrl = `${URL_API}&act=login-checker-email&email=${email}`;
        const response = await fetch(apiUrl);
        const responseData = await response.text();

        console.log('RespAPI login-checker-email -> ' + responseData);

        if (responseData === 'OK') {
          navigation.navigate('SignupCreatePassword', {
            mobile: mobile,
            mobilecode: mobilecode,
            countrycode: countrycode,
            email: email,
          });

          console.log(`
            Data dikirim (EmailScreen) :
              Mobile  => ${mobile}
              MobCode => ${mobilecode}
              CouCode => ${countrycode}
              Email   => ${email}
          `);
        } else {
          // Jika gagal, tampilkan pesan kesalahan
          Alert.alert('Failed', lang.screen_notExist.field_email.occupiedEmail);
          setEmail('');
        }
      } catch (error) {
        // Handle network errors or other exceptions
        console.error('Error during API request:', error);
        Alert.alert('Error', lang.screen_notExist.field_email.errorServer);
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

  const onBack = () => {
    navigation.replace('PhoneVerif', {
      mobile: mobile,
    });
  };

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
      }
    };

    fetchLangData();
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        <CustomInput
          label={
            lang && lang.screen_notExist && lang.screen_notExist.field_email
              ? lang.screen_notExist.field_email.label
              : ''
          }
          placeholder={
            lang && lang.screen_notExist && lang.screen_notExist.field_email
              ? lang.screen_notExist.field_email.placeholder
              : ''
          }
          value={email}
          setValue={onEmailChange}
          isPassword={false}
        />
        {isEmailValid ? null : (
          <Text
            style={{
              alignSelf: 'flex-start',
              marginLeft: 25,
              color: 'red',
            }}>
            {lang &&
            lang.screen_notExist &&
            lang.screen_notExist.screen_emailAuth &&
            lang.screen_notExist.screen_emailAuth.alert
              ? lang.screen_notExist.screen_emailAuth.alert.invalidEmail
              : ''}
          </Text>
        )}

        <View style={[styles.bottomSection]}>
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
  bottomSection: {
    padding: 20,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    width: '100%',
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

export default SignUpByEmailScreen;
