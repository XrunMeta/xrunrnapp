import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput/';
import ButtonBack from '../../components/ButtonBack/';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  URL_API_NODEJS,
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
  sha256Encrypt,
  saveLogsDB,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';

const SignInScreen = () => {
  const [lang, setLang] = useState({});
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isDisable, setIsDisable] = useState(false);

  const navigation = useNavigation();

  const onSignIn = async () => {
    setIsDisable(true);
    if (email.trim() === '') {
      Alert.alert(
        'Error',
        lang.screen_signin.alert ? lang.screen_signin.alert.emptyEmail : '',
      );

      setIsDisable(false);
    } else if (!isValidEmail(email)) {
      Alert.alert(
        'Error',
        lang.screen_signin.alert ? lang.screen_signin.alert.invalidEmail : '',
      );

      setIsDisable(false);
    } else if (password.trim() === '') {
      Alert.alert(
        'Error',
        lang.screen_signin.alert ? lang.screen_signin.alert.emptyPassword : '',
      );

      setIsDisable(false);
    } else {
      try {
        saveLogsDB(
          '5000012',
          0,
          `${email} - Clicked Sign-in Button`,
          'Clicked Sign-in Button (user typed email and password)',
        );

        const response = await fetch(`${URL_API_NODEJS}/login-01`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authcode}`,
          },
          body: JSON.stringify({
            type: 4,
            email,
            pin: password,
          }),
        });

        const data = await response.json();

        if (data.status !== 'success') {
          Alert.alert(
            lang ? lang.screen_signin.alert.fail : '',
            lang ? lang.screen_signin.failedLogin : '',
          );

          setEmail('');
          setPassword('');

          saveLogsDB(
            '5000013',
            0,
            `${email} - User Failed Sign-In`,
            'User Failed Sign-In',
          );
        } else {
          console.log('data login -> ', data?.data[0]);
          const encryptedSession = await sha256Encrypt(data?.data[0].extrastr);

          console.log({asli: data?.data[0]?.extrastr, ubah: encryptedSession});

          try {
            const ssidwReq = await fetch(`${URL_API_NODEJS}/saveSsidw`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authcode}`,
              },
              body: JSON.stringify({
                member: data?.data[0]?.member,
                ssidw: encryptedSession,
              }),
            });

            const ssidwRes = await ssidwReq.json();

            if (ssidwRes?.data[0]?.affectedRows == 1) {
              await AsyncStorage.setItem('userEmail', email);
              await AsyncStorage.setItem(
                'userData',
                JSON.stringify(data.data[0]),
              );
              login();

              navigation.reset({
                index: 0,
                routes: [{name: 'Home'}],
              });
            } else {
              Alert.alert(
                lang ? lang.screen_signin.alert.fail : '',
                lang ? lang.screen_signin.failedLogin : '',
              );

              setEmail('');
              setPassword('');
            }
          } catch (error) {
            console.error('Error:', error);
            Alert.alert(
              lang ? lang.screen_signin.alert.error : '',
              lang ? lang.screen_signin.errorLogin : '',
            );
            setEmail('');
            setPassword('');
            crashlytics().recordError(new Error(error));
            crashlytics().log(error);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert(
          lang ? lang.screen_signin.alert.error : '',
          lang ? lang.screen_signin.errorLogin : '',
        );
        setEmail('');
        setPassword('');
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      } finally {
        setIsDisable(false);
        setEmail('');
        setPassword('');
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

  const onSMSAuth = () => {
    // navigation.navigate('PhoneLogin', {screenBack: 'SignIn'});
    navigation.navigate('EmailAuth', {screenBack: 'SignIn'});
  };

  const onBack = () => {
    navigation.navigate('First');
  };

  useEffect(() => {
    // Get Language Data
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        // Set your language state
        setLang(screenLang);
      } catch (err) {
        console.error('Error in fetchData:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    fetchData();
    saveLogsDB(
      '5000011',
      0,
      'User open signin screen',
      'User open signin screen',
    );
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.root}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}>
          <View style={{flexDirection: 'row', position: 'relative'}}>
            <View style={{position: 'absolute', zIndex: 1}}>
              <ButtonBack onClick={onBack} />
            </View>

            <View style={styles.titleWrapper}>
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
            setValue={onEmailChange}
            isPassword={false}
          />
          {isEmailValid ? null : (
            <Text
              style={{
                alignSelf: 'flex-start',
                marginLeft: 25,
                color: 'red',
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('body'),
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

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1}}>
            <ButtonNext
              onClick={onSignIn}
              isDisabled={!isDisable && email == '' && password == ''}>
              <View>
                <Text style={styles.normalText}>
                  {lang && lang.screen_signin && lang.screen_signin.authcode
                    ? lang.screen_signin.authcode.label + ' '
                    : ''}
                </Text>
                <Pressable onPress={onSMSAuth} style={styles.resetPassword}>
                  <Text style={styles.emailAuth}>
                    {lang && lang.screen_signin && lang.screen_signin.authcode
                      ? lang.screen_signin.authcode.link
                      : ''}
                  </Text>
                </Pressable>
              </View>
            </ButtonNext>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  titleWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('title'),
    color: '#343a59',
  },
  subTitle: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('subtitle'),
    color: '#343a59',
    marginTop: -5,
  },
  normalText: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: '#343a59',
    maxWidth: 240,
    marginBottom: 8,
  },
  emailAuth: {
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
});

export default SignInScreen;
