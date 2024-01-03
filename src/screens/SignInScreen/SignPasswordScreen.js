import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

const SignPasswordScreen = () => {
  const route = useRoute();
  const [lang, setLang] = useState({});
  const {isLoggedIn, login} = useAuth();
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState([]);
  const {mobile} = route.params;

  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const getUserData = await AsyncStorage.getItem('userData');

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

  const onSignIn = async () => {
    if (password.trim() === '') {
      Alert.alert(
        'Error',
        lang && lang.screen_signin && lang.screen_signin.alert
          ? lang.screen_signin.alert.emptyPassword
          : '',
      );
    } else {
      try {
        const response = await fetch(
          `${URL_API}&act=login-01&mobile=${userData.mobile}&tp=3&pin=${password}`,
        );
        const data = await response.json();

        console.log('Response Login API -> ' + JSON.stringify(data));

        if (data.data === 'false') {
          Alert.alert('Error', 'Unable to login. Please check your password');
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
        Alert.alert('Error', 'An error occurred while logging in');
      }
    }
  };

  const onPassMiss = () => {
    navigation.navigate('EmailAuth');
  };

  const onNotExist = () => {
    navigation.navigate('PhoneVerif', {
      mobile: userData.mobile,
    });
  };

  const onBack = () => {
    navigation.navigate('First');
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      <ButtonBack onClick={onBack} />

      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Welcome back.</Text>
        <Text style={styles.subTitle}>
          Please sign in to continue. {userData.mobile}
        </Text>
      </View>

      <CustomInput
        label={
          lang && lang.screen_signin && lang.screen_signin.password
            ? lang.screen_signin.password.label
            : ''
        }
        placeholder={'Please enter your password.'}
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
              <Text style={styles.emailAuth}>PASSWORD</Text>
            </Pressable>
            <Text style={styles.normalText}> missed.</Text>
          </View>
          <View style={styles.additionalLogin}>
            <Pressable onPress={onNotExist} style={styles.resetPassword}>
              <Text style={styles.emailAuth}>ACCOUNT</Text>
            </Pressable>
            <Text style={styles.normalText}> doesn't exist.</Text>
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
