import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const ConfirmPassword = () => {
  const [lang, setLang] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (password.trim() === '') {
      Alert.alert(
        'Error',
        lang &&
          lang.screen_confirm_password &&
          lang.screen_confirm_password.condition
          ? lang.screen_confirm_password.condition.empty
          : '-',
      );
    } else {
      try {
        const response = await fetch(
          // `${URL_API}&act=login-checker&email=${email}&pin=${password}`,
          `${URL_API}&act=app7100-01&email=${email}&pin=${password}`,
        );
        const data = await response.json();

        if (data.data[0].count == 1) {
          navigation.replace('ModifInfo');
        } else {
          Alert.alert(
            'Error',
            lang &&
              lang.screen_confirm_password &&
              lang.screen_confirm_password.condition
              ? lang.screen_confirm_password.condition.wrong
              : '-',
          );
        }
      } catch (error) {
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
        console.error('Error:', error);
        Alert.alert(
          'Error',
          lang &&
            lang.screen_confirm_password &&
            lang.screen_confirm_password.condition
            ? lang.screen_confirm_password.condition.errorServer
            : '-',
        );
      }
    }
  };

  const onBack = () => {
    // navigation.navigate('First');
    navigation.goBack();
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

      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSignIn} style={styles.buttonSignIn}>
          <Image
            source={require('../../../assets/images/icon_next.png')}
            resizeMode="contain"
            style={styles.buttonSignInImage}
          />
        </Pressable>
      </View>
    </SafeAreaView>
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
  bottomSection: {
    padding: 20,
    paddingBottom: 5,
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
    height: 100,
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
});

export default ConfirmPassword;
