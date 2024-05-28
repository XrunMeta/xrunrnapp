import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  TextInput,
  Platform,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const PhoneLoginScreen = ({route}) => {
  const [lang, setLang] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const {
    code = 'KR',
    flag,
    countryCode = 82,
    country,
    mobile,
  } = route.params || {};

  const navigation = useNavigation();

  useEffect(() => {
    // Get Language
    const fetchLangData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        setLang(screenLang);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    fetchLangData();
  }, []);

  const onJoin = async () => {
    if (phoneNumber.trim() === '') {
      Alert.alert('Error', lang.screen_notExist.field_phoneNumber.empty);
    } else {
      navigation.navigate('PhoneVerif', {
        mobilecode: countryCode,
        mobile: phoneNumber,
        countrycode: code,
      });

      console.log(`
      Data dikirim (Phone Login)
        MobileCode  => ${countryCode}
        Mobile      => ${phoneNumber}
        CountryCode => ${code}
      `);
    }
  };

  const onBack = () => {
    // navigation.navigate('SignPassword', {
    //   mobile: mobile,
    // });
    navigation.goBack();
  };

  const chooseRegion = (flag, countryCode, country) => {
    navigation.navigate('ChooseRegion', {
      flag: flag,
      countryCode: countryCode,
      country: country,
      mobile: mobile,
      screenName: true,
      code: code,
    });

    console.log(`
      flag: ${flag}
      countryCode: ${countryCode}
      country: ${country}
      mobile: ${mobile}
      screenName: ${true}
      code: ${code}
    `);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={[styles.root]}>
        <ButtonBack onClick={onBack} />

        {/*  Field - Phone Number */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {lang &&
            lang.screen_notExist &&
            lang.screen_notExist.field_phoneNumber
              ? lang.screen_notExist.field_phoneNumber.label
              : ''}
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              marginTop: Platform.OS === 'ios' ? 10 : 0,
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
                  fontFamily: getFontFam() + 'Medium',
                  fontSize: fontSize('body'),
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
          <Pressable onPress={onJoin} style={styles.buttonSignUp}>
            <Image
              source={require('../../../assets/images/icon_next.png')}
              resizeMode="contain"
              style={styles.buttonSignUpImage}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: Dimensions.get('window').height - 240,
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
  label: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
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
  },
  input: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    paddingHorizontal: 5,
    paddingBottom: -10,
    paddingTop: 10,
    flex: 1,
  },
});

export default PhoneLoginScreen;
