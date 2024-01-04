import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const langData = require('../../../lang.json');

const PhoneLoginScreen = ({route}) => {
  const [lang, setLang] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const {flag, countryCode = 82, country, mobile} = route.params || {};

  const navigation = useNavigation();

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

  const onSignUp = async () => {
    if (phoneNumber.trim() === '') {
      Alert.alert('Error', `Nomor Telepon harus diisi`);
    } else {
      navigation.navigate('PhoneVerif', {
        mobile: phoneNumber,
      });
    }
  };

  const onBack = () => {
    navigation.navigate('SignPassword', {
      mobile: mobile,
    });
  };

  const chooseRegion = (flag, countryCode, country) => {
    navigation.navigate('ChooseRegion', {
      flag: flag,
      countryCode: countryCode,
      country: country,
      mobile: mobile,
      screenName: true,
    });
  };

  return (
    <View style={[styles.root]}>
      <ButtonBack onClick={onBack} />

      {/*  Field - Phone Number */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Please enter a phone number.</Text>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
          }}>
          <Pressable
            style={{flexDirection: 'row', marginBottom: -10}}
            onPress={() => chooseRegion(flag, countryCode, country)}>
            <Image
              resizeMode="contain"
              style={{
                width: 35,
                marginRight: 10,
              }}
              source={
                flag == undefined
                  ? {
                      uri: 'https://app.xrun.run/flags/kr.png',
                    }
                  : {
                      uri: flag,
                    }
              }
            />
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 13,
                color: '#a8a8a7',
                alignSelf: 'center',
                paddingRight: 10,
              }}>
              +{countryCode == undefined ? '82' : countryCode}
            </Text>
          </Pressable>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            value={phoneNumber}
            setValue={setPhoneNumber}
            onChangeText={text => setPhoneNumber(text)}
          />
        </View>
      </View>

      {/* Bottom Section */}
      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSignUp} style={styles.buttonSignUp}>
          <Image
            source={require('../../../assets/images/icon_next.png')}
            resizeMode="contain"
            style={styles.buttonSignUpImage}
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
  bottomSection: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
  },
  normalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#343a59',
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
    marginBottom: -5,
  },
  buttonSignUp: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    height: 100,
    justifyContent: 'center',
  },
  buttonSignUpImage: {
    height: 80,
    width: 80,
  },
  formGroup: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
    flex: 1,
  },
  input: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    paddingHorizontal: 5,
    paddingBottom: -10,
    flex: 1,
  },
});

export default PhoneLoginScreen;
