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
import {
  URL_API_NODEJS,
  getLanguage2,
  authcode,
  getFontFam,
  fontSize,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const EmailVerifForModifScreen = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const route = useRoute();
  const {existEmail} = route.params;
  const [isSubmitDisable, setIsSubmitDisable] = useState(false);

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    setIsSubmitDisable(true);
    if (email.trim() === '') {
      Alert.alert('Error', lang.screen_notExist.field_email.emptyEmail);
      setIsSubmitDisable(false);
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', lang.screen_notExist.field_email.invalidEmail);
      setIsSubmitDisable(false);
    } else if (email !== existEmail) {
      Alert.alert('Error', lang.screen_notExist.field_email.invalidEmail);
      setIsSubmitDisable(false);
    } else {
      const waitForResponse = async () => {
        try {
          const response = await fetch(`${URL_API_NODEJS}/check-02-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authcode}`,
            },
            body: JSON.stringify({
              email,
            }),
          });
          const responseData = await response.json();
          console.log(
            'RespAPI check-02-email -> ' + JSON.stringify(responseData),
          );

          return responseData;
        } catch (error) {
          setIsSubmitDisable(true);
          crashlytics().recordError(new Error(error));
          crashlytics().log(error);

          return {
            data: 'error',
            value: lang.screen_emailAuth.alert.errorServer,
          };
        }
      };

      const result = await Promise.race([
        waitForResponse(),
        new Promise(resolve => setTimeout(() => resolve(null), 5000)),
      ]);

      if (result !== null) {
        if (result?.data[0]?.status == true) {
          setIsSubmitDisable(false);
          setEmail('');

          console.log(result?.data[0]?.status);

          navigation.navigate('EmailCodeForModif', {
            dataEmail: email,
          });
        } else if (result?.data[0]?.status == false) {
          Alert.alert('Error', lang.screen_emailAuth.alert.errorServer, [
            {
              text: 'OK',
              onPress: () => {
                navigation.replace('First');
              },
            },
          ]);
          setEmail('');
        } else {
          Alert.alert('Error', lang.screen_emailAuth.alert.invalidEmail);
          setEmail('');
        }
      } else {
        Alert.alert('Error', lang.screen_emailAuth.alert.errorServer, [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('First'); // Ganti 'First' dengan nama layar pertama yang sesuai
            },
          },
        ]);
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
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchLangData();
  }, []);

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      <View style={{flexDirection: 'row', position: 'relative'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_appInfo ? lang.screen_emailAuth?.label : ''}
          </Text>
        </View>
      </View>

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
        <Pressable
          onPress={onSignIn}
          style={styles.buttonSignIn}
          disabled={isSubmitDisable}>
          <Image
            source={
              isSubmitDisable
                ? require('../../../assets/images/icon_nextDisable.png')
                : require('../../../assets/images/icon_next.png')
            }
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
  titleWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    paddingVertical: 18,
  },
  title: {
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('title'),
    color: '#343a59',
  },
});

export default EmailVerifForModifScreen;