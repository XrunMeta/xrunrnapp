import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fontSize, getFontFam, getLanguage2} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';

const PasswordMissedScreen = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const navigation = useNavigation();
  const [isDisable, setIsDisable] = useState(false);

  const onSignIn = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', lang.screen_passwordMissed.notif.emptyEmail);
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', lang.screen_passwordMissed.notif.invalidEmail);
    } else {
      try {
        setIsDisable(true);

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
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      } finally {
        setIsDisable(false);
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
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.root}>
        <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.root}>
        <View>
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
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('note'),
              }}>
              *
              {lang &&
              lang.screen_passwordMissed &&
              lang.screen_passwordMissed.notif
                ? lang.screen_passwordMissed.notif.invalidEmail
                : ''}
            </Text>
          )}
        </View>

    
          <ButtonNext
            isDisabled={!isDisable && email == ''}
            onClick={onSignIn}
          />
      </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default PasswordMissedScreen;
