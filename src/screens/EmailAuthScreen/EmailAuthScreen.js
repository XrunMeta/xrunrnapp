import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
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
  fontSize,
  getFontFam,
  saveLogsDB,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';

const EmailAuthScreen = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const route = useRoute();
  const {screenBack} = route.params;
  const [isLoading, setIsLoading] = useState(false);
  let ScreenHeight = Dimensions.get('window').height;
  const navigation = useNavigation();
  const [isDisable, setIsDisable] = useState(false);

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
  }, []);

  const onSignIn = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', lang.screen_emailAuth.alert.emptyEmail);
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', lang.screen_emailAuth.alert.invalidEmail);
    } else {
      try {
        setIsDisable(true);

        saveLogsDB(
          '5000021',
          0,
          `${email} - Tried Email Sign-in and Clicked send authcode`,
          `User tried Email Sign-in and Clicked send authcode`,
        );

        const waitForResponse = async () => {
          try {
            const reqExisting = await fetch(`${URL_API_NODEJS}/ap1810-i01`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authcode}`,
              },
              body: JSON.stringify({
                email,
              }),
            });
            const resExsiting = await reqExisting.json();
            console.log('is email exist? -> ' + JSON.stringify(resExsiting));

            if (resExsiting?.data[0]?.result) {
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
            } else {
              console.log(resExsiting?.data[0]?.result);
              return {
                data: 'error',
                value: lang.screen_emailAuth.alert.notExist,
              };
            }
          } catch (error) {
            setIsLoading(true);
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
            setIsLoading(false);

            navigation.navigate('EmailVerifLogin', {
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
      } catch (error) {
        // Handle network errors or other exceptions
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
        console.error('Error during API request:', error);
        Alert.alert('Error', lang.screen_emailAuth.alert.errorServer);
      } finally {
        setIsDisable(false);
        setEmail('');
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
    navigation.navigate(screenBack);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={{flex: 1}}>
        <View style={[styles.root, {height: ScreenHeight}]}>
          <View style={{flexDirection: 'row'}}>
            <View style={{position: 'absolute', zIndex: 1}}>
              <ButtonBack onClick={onBack} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>
                {lang && lang.screen_signin && lang.screen_signin.authcode
                  ? lang.screen_signin.authcode.link
                  : ''}
              </Text>
            </View>
          </View>

          <CustomInput
            label={
              lang && lang.screen_emailAuth && lang.screen_emailAuth.email
                ? lang.screen_emailAuth.email.label
                : ''
            }
            placeholder={
              lang && lang.screen_emailAuth && lang.screen_emailAuth.email
                ? lang.screen_emailAuth.email.placeholder
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
              {lang && lang.screen_emailAuth && lang.screen_emailAuth.alert
                ? lang.screen_emailAuth.alert.invalidEmail
                : ''}
            </Text>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1}}>
            <ButtonNext
              onClick={onSignIn}
              isDisabled={!isDisable && email == ''}
            />
          </KeyboardAvoidingView>
        </View>
        {isLoading && (
          <View
            style={{
              ...StyleSheet.absoluteFill,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1,
            }}>
            <ActivityIndicator size="large" color="#343a59" />
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
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
  titleWrapper: {
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
});

export default EmailAuthScreen;
