import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../../components/CustomInput';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  URL_API_NODEJS,
  authcode,
  validatePassword,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';
import IOSButtonFixer from '../../components/IOSButtonFixer';

const EditPassword = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});
  const [isDisable, setIsDisable] = useState(false);

  const onSaveChange = () => {
    try {
      setIsDisable(true);
      if (password == '') {
        alert(lang ? lang.screen_modify_password.condition.empty : '');
      } else if (passwordError !== '') {
        alert(lang ? lang.screen_modify_password.condition.wrong : '');
      } else {
        const savePassword = async () => {
          const apiUrl = `${URL_API_NODEJS}/app7163-01`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authcode}`,
            },
            body: JSON.stringify({
              member: userData.member,
              pin: password,
            }),
          });

          console.log(response);

          if (!response.ok) {
            throw new Error('Gagal menyimpan perubahan.');
          }

          console.log(`Password Baru : ${password}`);
          navigation.replace('ModifInfo');
        };

        savePassword();
      }
    } catch (error) {
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      console.error('Terjadi kesalahan:', error.message);
    } finally {
      setIsDisable(false);
      setPassword('');
    }
  };

  const handleBack = () => {
    navigation.replace('ModifInfo');
  };

  useEffect(() => {
    // Get Language
    const fetchLangData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        // Get User Data from Asyncstorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);
        console.log({astorJsonData});
        setUserData(astorJsonData);
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        {/* Title */}
        <View style={{flexDirection: 'row'}}>
          <View style={{position: 'absolute', zIndex: 1}}>
            <ButtonBack onClick={handleBack} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              {lang && lang.screen_modify_password
                ? lang.screen_modify_password.title
                : ''}
            </Text>
          </View>
        </View>

        <CustomInput
          label={
            lang && lang.screen_modify_password
              ? lang.screen_modify_password.label
              : ''
          }
          placeholder={
            lang && lang.screen_modify_password
              ? lang.screen_modify_password.placeholder
              : ''
          }
          value={password}
          // setValue={setPassword}
          setValue={value => {
            setPassword(value);
            const validationMessage = validatePassword(userData?.email, value);
            setPasswordError(validationMessage);
          }}
          secureTextEntry
          isPassword={true}
        />
        {passwordError != '' && (
          <Text
            style={{
              alignSelf: 'flex-start',
              marginLeft: 25,
              color: 'red',
              fontFamily: getFontFam() + 'Medium',
              fontSize: fontSize('body'),
            }}>
            *{passwordError}
          </Text>
        )}

        <IOSButtonFixer count={5} />

        <ButtonNext
          onClick={onSaveChange}
          isDisabled={!isDisable && password == ''}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
  },
  titleWrapper: {
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: 'white',
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

export default EditPassword;
