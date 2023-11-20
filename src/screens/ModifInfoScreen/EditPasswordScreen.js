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

const langData = require('../../../lang.json');

const EditPassword = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  let ScreenHeight = Dimensions.get('window').height;

  const onSaveChange = () => {
    if (password == '') {
      alert('Please enter your password');
    } else {
      const savePassword = async () => {
        try {
          const apiUrl = `https://app.xrun.run/gateway.php?act=app7163-01&member=1102&pin=${password}`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              member: 1102,
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
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

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

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={handleBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Password Modify</Text>
        </View>
      </View>

      <CustomInput
        label="New Password"
        placeholder="Please enter your new password"
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
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
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
