import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  gatewayNodeJS,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';

const ConfirmPasswordEdit = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDisable, setIsDisable] = useState(false);

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (password.trim() === '') {
      Alert.alert('Error', lang.screen_confirm_password.condition.empty);
    } else {
      try {
        setIsDisable(true);

        const body = {
          email,
          pin: password,
        };

        const result = await gatewayNodeJS('login-checker', 'POST', body);
        const value = result.data[0].value;

        if (value == 'OK') {
          navigation.replace('EditPassword');
        } else {
          Alert.alert('Error', lang.screen_confirm_password.condition.wrong);
        }
      } catch (error) {
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while logging in');
      } finally {
        setIsDisable(false);
      }
    }
  };

  const onBack = () => {
    navigation.replace('ModifInfo');
  };

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const userEmail = await AsyncStorage.getItem('userEmail');

        setEmail(userEmail);

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

    fetchData();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        {/* Title */}
        <View style={{flexDirection: 'row'}}>
          <View style={{position: 'absolute', zIndex: 1}}>
            <ButtonBack onClick={onBack} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              {lang && lang.screen_confirm_password
                ? lang.screen_confirm_password.title
                : ''}
            </Text>
          </View>
        </View>

        <CustomInput
          label={
            lang && lang.screen_confirm_password
              ? lang.screen_confirm_password.label
              : ''
          }
          placeholder={
            lang && lang.screen_confirm_password
              ? lang.screen_confirm_password.placeholder
              : ''
          }
          value={password}
          setValue={setPassword}
          secureTextEntry
          isPassword={true}
        />
        <View
          style={{
            width: '100%',
            paddingHorizontal: 25,
            marginTop: 5,
          }}>
          <Text style={styles.subTitle}>
            *
            {lang &&
            lang.screen_confirm_password &&
            lang.screen_confirm_password.note
              ? lang.screen_confirm_password.note.alt1
              : ''}
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex: 1}}>
          <ButtonNext
            onClick={onSignIn}
            isDisabled={!isDisable && password == ''}
          />
        </KeyboardAvoidingView>
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
  subTitle: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('note'),
    color: '#343a59',
    marginTop: -3,
  },
});

export default ConfirmPasswordEdit;
