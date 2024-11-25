import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  URL_API_NODEJS,
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const SignPasswordScreen = () => {
  const [lang, setLang] = useState({});
  const {login} = useAuth();
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState([]);
  const [isDisable, setIsDisable] = useState(false);

  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        const getUserData = await AsyncStorage.getItem('userData');

        // Set your language state
        setLang(screenLang);

        if (getUserData) {
          const userDataObject = JSON.parse(getUserData);

          // Get User Detail Information
          const userResponse = await fetch(`${URL_API_NODEJS}/app7000-01`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authcode}`,
            },
            body: JSON.stringify({
              member: userDataObject?.member,
            }),
          });
          const userJsonData = await userResponse.json();
          const completeUserData = userJsonData.data[0];

          setUserData(completeUserData);
        } else {
          console.log('Data user tidak ditemukan');
        }
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    fetchData();
  }, []);

  const onSignIn = async () => {
    if (password.trim() === '') {
      Alert.alert('Warning', lang.screen_loginWithPassword.notif.emptyPassword);
    } else {
      try {
        setIsDisable(true);

        const response = await fetch(`${URL_API_NODEJS}/login-01`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authcode}`,
          },
          body: JSON.stringify({
            type: 3,
            pin: password,
            mobile: userData?.mobile,
          }),
        });
        const data = await response.json();

        console.log('Response Login API -> ' + JSON.stringify(data));

        if (data.status !== 'success') {
          Alert.alert('Failed', lang.screen_loginWithPassword.notif.wrong);
          setPassword('');
        } else {
          await AsyncStorage.setItem('userEmail', userData.email);
          login();
          navigation.reset({
            index: 0,
            routes: [{name: 'Home'}],
          });
          // Simpan session dan navigasi ke halaman selanjutnya
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', lang.screen_loginWithPassword.notif.errorServer);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      } finally {
        setIsDisable(false);
      }
    }
  };

  const onPassMiss = () => {
    navigation.navigate('PasswordMissed');
  };

  const onNotExist = () => {
    // navigation.navigate('PhoneLogin', {
    //   mobile: userData.mobile,
    // });
    navigation.navigate('SignUp');
  };

  const onBack = () => {
    navigation.navigate('First');
  };

  return (
    <SafeAreaView>
      <ScrollView scrollEnabled={false}>
        <View style={[styles.root, {height: ScreenHeight}]}>
          <View style={styles.titleWrapper}>
            <ButtonBack onClick={onBack} />

            <View style={{alignItems: 'center', marginBottom: -5}}>
              <Text style={styles.title}>
                {lang &&
                lang.screen_loginWithPassword &&
                lang.screen_loginWithPassword.title
                  ? lang.screen_loginWithPassword.title
                  : ''}
              </Text>
              <Text style={styles.subTitle}>
                {lang &&
                lang.screen_loginWithPassword &&
                lang.screen_loginWithPassword.title
                  ? lang.screen_loginWithPassword.subtitle
                  : ''}
              </Text>
            </View>
          </View>

          <CustomInput
            label={
              lang &&
              lang.screen_loginWithPassword &&
              lang.screen_loginWithPassword.input
                ? lang.screen_loginWithPassword.input.password.label
                : ''
            }
            placeholder={
              lang &&
              lang.screen_loginWithPassword &&
              lang.screen_loginWithPassword.input
                ? lang.screen_loginWithPassword.input.password.placeholder
                : ''
            }
            value={password}
            setValue={setPassword}
            secureTextEntry
            isPassword={true}
          />

          <View style={[styles.bottomSection]}>
            <View
              style={{
                flexDirection: 'column',
                alignSelf: 'flex-end',
                marginBottom: 10,
                gap: 5,
              }}>
              <View style={styles.additionalLogin}>
                <Pressable onPress={onPassMiss} style={styles.resetPassword}>
                  <Text style={styles.emailAuth}>
                    {lang &&
                    lang.screen_loginWithPassword &&
                    lang.screen_loginWithPassword.input &&
                    lang.screen_loginWithPassword.input.missing
                      ? lang.screen_loginWithPassword.input.missing.btn + ' '
                      : ''}
                  </Text>
                </Pressable>
                <Text style={styles.normalText}>
                  {lang &&
                  lang.screen_loginWithPassword &&
                  lang.screen_loginWithPassword.input &&
                  lang.screen_loginWithPassword.input.missing
                    ? lang.screen_loginWithPassword.input.missing.text
                    : ''}
                </Text>
              </View>
              <View style={styles.additionalLogin}>
                <Pressable onPress={onNotExist} style={styles.resetPassword}>
                  <Text style={styles.emailAuth}>
                    {lang &&
                    lang.screen_loginWithPassword &&
                    lang.screen_loginWithPassword.input &&
                    lang.screen_loginWithPassword.input.notExist
                      ? lang.screen_loginWithPassword.input.notExist.btn + ' '
                      : ''}
                  </Text>
                </Pressable>
                <Text style={styles.normalText}>
                  {lang &&
                  lang.screen_loginWithPassword &&
                  lang.screen_loginWithPassword.input &&
                  lang.screen_loginWithPassword.input.notExist
                    ? lang.screen_loginWithPassword.input.notExist.text
                    : ''}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onSignIn}
              style={styles.buttonSignIn}
              disabled={!isDisable && password == ''}>
              <Image
                source={
                  !isDisable && password == ''
                    ? require('../../../assets/images/icon_nextDisable.png')
                    : require('../../../assets/images/icon_next.png')
                }
                resizeMode="contain"
                style={styles.buttonSignInImage}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    paddingBottom: 15,
  },
  titleWrapper: {
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
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
    textAlign: 'center',
  },
  bottomSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  normalText: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
  emailAuth: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
});

export default SignPasswordScreen;
