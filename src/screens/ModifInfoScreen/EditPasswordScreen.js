import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../../components/CustomInput';
import {URL_API, getLanguage2} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const EditPassword = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});

  const onSaveChange = () => {
    if (password == '') {
      alert(lang ? lang.screen_modify_password.condition.empty : '');
    } else {
      const savePassword = async () => {
        try {
          const apiUrl = `${URL_API}&act=app7163-01&member=${userData.member}&pin=${password}`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
          navigation.goBack();
        } catch (error) {
          crashlytics().recordError(new Error(error));
          crashlytics().log(error);
          console.error('Terjadi kesalahan:', error.message);
        }
      };

      savePassword();
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
    <View style={[styles.root, {height: ScreenHeight}]}>
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
        setValue={setPassword}
        secureTextEntry
        isPassword={true}
      />

      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSaveChange} style={styles.buttonSignIn}>
          <Image
            source={require('../../../assets/images/icon_check.png')}
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
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#051C60',
    margin: 10,
  },
  bottomSection: {
    padding: 5,
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
    flex: 1,
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    height: 100,
    justifyContent: 'center',
    marginRight: 10,
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
});

export default EditPassword;
