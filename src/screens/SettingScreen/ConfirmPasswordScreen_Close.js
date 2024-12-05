import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  gatewayNodeJS,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';
import IOSButtonFixer from '../../components/IOSButtonFixer';

const CloseConfirmPassword = () => {
  const route = useRoute();
  const {reasonNum, reason} = route.params;
  const [lang, setLang] = useState({});
  const [userData, setUserData] = useState('');
  const [password, setPassword] = useState('');
  const [isDisable, setIsDisable] = useState(true);

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (password.length > 0) {
      setIsDisable(false);
    } else {
      setIsDisable(true);
    }
  }, [password]);

  const onSignIn = async () => {
    if (password.trim() === '') {
      Alert.alert(
        'Error',
        lang && lang.screen_setting ? lang.screen_setting.close.del_empty : '',
      );
    } else {
      try {
        setIsDisable(true);

        const body = {
          pin: password,
          reason,
          reasonNum,
          member: userData.member,
        };

        const result = await gatewayNodeJS('app8080-01', 'POST', body);
        console.log(result);

        if (result.message.includes('Duplicate')) {
          console.error('Error:', result);
          Alert.alert(
            lang.screen_setting.alert.fail,
            lang.screen_signup.validator.duplicatedEmail,
          );
          return;
        }

        const count = result.data[0].count;

        console.log('Response Apu -> ' + JSON.stringify(result));
        if (count == 1) {
          navigation.replace('SuccessCloseMembership');
        } else {
          Alert.alert(
            'Failed',
            lang && lang.screen_setting
              ? lang.screen_setting.close.desc.fail
              : '',
          );
          setPassword('');
          navigation.replace('SuccessCloseMembership');
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while logging in');
      } finally {
        setIsDisable(false);

        console.log(`
          app8080-01 Data => 
            pin       : ${password}
            reasonNum : ${reasonNum} -> ${typeof userData.member}
            reason    : ${reason}
            member    : ${userData.member} -> ${typeof userData.member}
        `);
      }
    }
  };

  const onBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    // Get Language
    const fetchDataLang = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const getUserData = await AsyncStorage.getItem('userData');
        const resUserData = JSON.parse(getUserData);

        console.log('API Res -> ' + JSON.stringify(resUserData));

        setUserData(resUserData);

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

    fetchDataLang();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        <View>
          {/* Title */}
          <View style={{flexDirection: 'row'}}>
            <View style={{position: 'absolute', zIndex: 1}}>
              <ButtonBack onClick={onBack} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>
                {lang && lang.screen_setting && lang.screen_setting.close
                  ? lang.screen_setting.close.del_title
                  : ''}
              </Text>
            </View>
          </View>
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
          <View
            style={{
              width: '100%',
              paddingHorizontal: 25,
              marginTop: 5,
            }}>
            <Text style={styles.subTitle}>
              *
              {lang && lang.screen_setting && lang.screen_setting.close
                ? lang.screen_setting.close.del_d1
                : ''}
            </Text>
            <Text style={styles.subTitle}>
              {lang && lang.screen_setting && lang.screen_setting.close
                ? '  ' + lang.screen_setting.close.del_d2
                : ''}
            </Text>
          </View>
        </View>

        <IOSButtonFixer count={5} />
        <ButtonNext onClick={onSignIn} isDisabled={isDisable} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
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
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
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

export default CloseConfirmPassword;
