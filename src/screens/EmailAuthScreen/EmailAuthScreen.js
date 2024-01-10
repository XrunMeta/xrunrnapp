import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

const EmailAuthScreen = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const route = useRoute();
  const {screenBack} = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (email.trim() === '') {
      Alert.alert(
        'Error',
        lang && lang.screen_emailAuth && lang.screen_emailAuth.alert
          ? lang.screen_emailAuth.alert.emptyEmail
          : '',
      );
    } else if (!isValidEmail(email)) {
      Alert.alert(
        'Error',
        lang && lang.screen_emailAuth && lang.screen_emailAuth.alert
          ? lang.screen_emailAuth.alert.invalidEmail
          : '',
      );
    } else {
      try {
        const apiUrl = `${URL_API}&act=login-02-email&email=${email}`;
        let responseReceived = false; // Flag Response Receiver

        const waitForResponse = async () => {
          try {
            const response = await fetch(apiUrl);
            const responseData = await response.json();
            console.log(
              'RespAPI login-02-email -> ' + JSON.stringify(responseData),
            );

            // Update Flag to true
            responseReceived = true;
            return responseData;
          } catch (error) {
            setIsLoading(true);

            return {
              data: 'error',
              value: "It's a server problem. Please try in a few minutes",
            };
          }
        };

        const result = await Promise.race([
          waitForResponse(),
          new Promise(resolve => setTimeout(() => resolve(null), 5000)),
        ]);

        if (result !== null) {
          console.log('Result.data -> ' + result.data);
          if (result.data === 'true') {
            setIsLoading(false);

            navigation.navigate('EmailVerifLogin', {
              dataEmail: email,
            });
          } else if (result.data === 'error') {
            Alert.alert(
              'Error',
              "It's a server problem. Please try in a few minutes",
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.replace('First');
                  },
                },
              ],
            );
            setEmail('');
          } else {
            Alert.alert('Error', 'Invalid email');
            setEmail('');
          }
        } else {
          Alert.alert(
            'Error',
            "It's a server problem. Please try in a few minutes",
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.replace('First'); // Ganti 'First' dengan nama layar pertama yang sesuai
                },
              },
            ],
          );
        }
      } catch (error) {
        // Handle network errors or other exceptions
        console.error('Error during API request:', error);
        Alert.alert('Error', 'An error occurred. Please try again.');
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

export default EmailAuthScreen;
