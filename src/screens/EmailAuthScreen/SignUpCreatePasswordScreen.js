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
import {getLanguage2} from '../../../utils';

const SignUpCreatePassword = () => {
  const [lang, setLang] = useState({});
  const [password, setPassword] = useState('');
  const [isPasswordValid, setPasswordValid] = useState(true);
  const route = useRoute();
  const {mobile, mobilecode, countrycode, email} = route.params;

  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (password.trim() === '') {
      Alert.alert('Error', lang.screen_notExist.field_password.emptyPassword);
    } else if (!isValidPassword(password)) {
      Alert.alert('Error', lang.screen_notExist.field_password.invalidPassword);
    } else {
      navigation.navigate('SignupCreateName', {
        mobile: mobile,
        mobilecode: mobilecode,
        countrycode: countrycode,
        email: email,
        pin: password,
      });

      console.log(`
        Data dikirim (Create Password) : 
          Mobile  => ${mobile}
          MobCode => ${mobilecode}
          CouCode => ${countrycode}
          Email   => ${email}
          Pin     => ${password}
      `);
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

        {/*  Field - Password */}
        <CustomInput
          label={
            lang && lang.screen_notExist.field_password
              ? lang.screen_notExist.field_password.label
              : ''
          }
          placeholder={
            lang && lang.screen_notExist.field_password
              ? lang.screen_notExist.field_password.placeholder
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
            marginRight: 1,
          }}>
          {lang && lang.screen_notExist.field_password
            ? lang.screen_notExist.field_password.validator
            : ''}
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

export default SignUpCreatePassword;
