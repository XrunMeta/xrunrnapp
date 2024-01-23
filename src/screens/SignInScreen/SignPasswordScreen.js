import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const SignPasswordScreen = () => {
  const [lang, setLang] = useState({});
  const {login} = useAuth();
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState([]);

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
          const userResponse = await fetch(
            `${URL_API}&act=app7000-01&member=${userDataObject.member}`,
          );
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
        const response = await fetch(
          `${URL_API}&act=login-01&mobile=${userData.mobile}&tp=3&pin=${password}`,
        );
        const data = await response.json();

        console.log('Response Login API -> ' + JSON.stringify(data));

        if (data.data === 'false') {
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
      }
    }
  };

  const onPassMiss = () => {
    navigation.navigate('PasswordMissed');
  };

  const onNotExist = () => {
    navigation.navigate('PhoneLogin', {
      mobile: userData.mobile,
    });
  };

  const onBack = () => {
    navigation.navigate('First');
  };

  return (
    <ScrollView scrollEnabled={false}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        <View style={styles.titleWrapper}>
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
  titleWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#343a59',
  },
  subTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#343a59',
    marginTop: -5,
    textAlign: 'center',
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 15,
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
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#343a59',
  },
  emailAuth: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
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
