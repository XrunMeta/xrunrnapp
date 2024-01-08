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
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

const SignUpCreatePassword = () => {
  const [lang, setLang] = useState({});
  const [password, setPassword] = useState('');
  const [isPasswordValid, setPasswordValid] = useState(true);
  const route = useRoute();
  const {mobile, email} = route.params;

  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (password.trim() === '') {
      Alert.alert(
        'Error',
        lang && lang.screen_emailAuth && lang.screen_emailAuth.alert
          ? lang.screen_emailAuth.alert.emptyPassword
          : '',
      );
    } else if (!isValidPassword(password)) {
      Alert.alert('Error', 'Your password is not valid');
    } else {
      // navigation.navigate('NAMA SCREEN DISINI', {
      //   mobile: mobile,
      //   email: email,
      //   pin: password,
      // });
      console.log('Pergi ke ap1720');
    }
  };

  const isValidPassword = password => {
    const pattern = /^(?=.*\d)(?=.*[~`!@#$%\^&*()-])(?=.*[a-zA-Z]).{8,20}$/;
    return pattern.test(password);
  };

  onPasswordChange = text => {
    setPassword(text);
    setPasswordValid(isValidPassword(text));
  };

  const onBack = () => {
    navigation.goBack();
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
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        {/*  Field - Password */}
        <CustomInput
          label={
            lang && lang.screen_signup && lang.screen_signup.password
              ? lang.screen_signup.password.label
              : ''
          }
          placeholder={
            lang && lang.screen_signup && lang.screen_signup.password
              ? lang.screen_signup.password.placeholder
              : ''
          }
          value={password}
          setValue={onPasswordChange}
          secureTextEntry
          isPassword={true}
        />
        <Text
          style={{
            alignSelf: 'flex-start',
            marginLeft: 25,
            color: isPasswordValid ? 'black' : 'red',
            fontFamily: 'Poppins-Regular',
            fontSize: 11,
          }}>
          *Alphanumeric, numeric, special combination of symbols, more than 8
          digits
        </Text>

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
    paddingBottom: 40,
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

export default SignUpCreatePassword;
