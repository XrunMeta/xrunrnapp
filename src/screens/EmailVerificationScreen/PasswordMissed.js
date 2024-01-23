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
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLanguage2} from '../../../utils';

const PasswordMissedScreen = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', lang.screen_passwordMissed.notif.emptyEmail);
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', lang.screen_passwordMissed.notif.invalidEmail);
    } else {
      try {
        const apiUrl = 'https://app.xrun.run/phpmail/sendmail.php';
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `email=${email}`,
        };

        const response = await fetch(apiUrl, requestOptions);
        const responseData = await response.text();

        console.log('Abis kirim email -> ' + responseData);

        // Menampilkan alert
        Alert.alert(
          'Success',
          lang.screen_passwordMissed.notif.sended,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigasi ke halaman FirstScreen
                navigation.navigate('First');
              },
            },
          ],
          {cancelable: false},
        );

        // Navigasi ke halaman FirstScreen otomatis setelah 5 detik
        setTimeout(() => {
          navigation.navigate('First');
        }, 5000);
      } catch (error) {
        // Handle network errors or other exceptions
        console.error('Error during API request:', error);
        Alert.alert('Error', lang.screen_passwordMissed.notif.errorServer);
      }
    }
  };

  const isValidEmail = email => {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
  };

  const onEmailChange = text => {
    setEmail(text);
    setIsEmailValid(isValidEmail(text));
  };

  const onBack = () => {
    navigation.navigate('SignIn');
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
            lang &&
            lang.screen_passwordMissed &&
            lang.screen_passwordMissed.email
              ? lang.screen_passwordMissed.email.label
              : ''
          }
          placeholder={
            lang &&
            lang.screen_passwordMissed &&
            lang.screen_passwordMissed.email
              ? lang.screen_passwordMissed.email.placeholder
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
            lang.screen_passwordMissed &&
            lang.screen_passwordMissed.notif
              ? lang.screen_passwordMissed.notif.invalidEmail
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

export default PasswordMissedScreen;
