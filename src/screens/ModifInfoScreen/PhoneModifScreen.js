import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  TextInput,
  Platform,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  URL_API_NODEJS,
  authcode,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';
import IOSButtonFixer from '../../components/IOSButtonFixer';

const PhoneModifScreen = ({route}) => {
  const [lang, setLang] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const {member, countryCode = 82} = route.params || {};
  const [isDisable, setIsDisable] = useState(true);

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

  const handlePhoneNumberChange = text => {
    const filteredText = text.replace(/[^0-9]/g, '').slice(0, 15);
    setPhoneNumber(filteredText);

    // Validasi minimal digit
    if (filteredText.length > 0) {
      setIsDisable(false); // Tombol aktif jika panjang mencukupi
    } else {
      setIsDisable(true); // Tombol nonaktif jika panjang tidak mencukupi
    }
  };

  const onJoin = async () => {
    setIsDisable(true);
    if (phoneNumber.trim() === '') {
      Alert.alert('Error', lang?.screen_modify_phone?.condition?.empty);
    } else if (phoneNumber.length < 8) {
      Alert.alert(
        'Failed',
        lang?.screen_notExist?.field_phoneVerif?.lengthPhoneNumber,
      );
    } else {
      console.log(`
      Data dikirim (Phone Login)
        MobileCode  => ${countryCode}
        Mobile      => ${phoneNumber}
        Member      => ${member}
      `);

      try {
        const body = {
          member: member,
          mobile: phoneNumber,
          mobilecode: countryCode,
        };
        const request = await fetch(`${URL_API_NODEJS}/app7153-03`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authcode}`,
          },
          body: JSON.stringify(body),
        });

        if (!request.ok) {
          throw new Error('Gagal menyimpan perubahan.');
        }

        const response = await request.json();

        console.log(
          'Perubahan berhasil disimpan ke API -> ' + response?.data[0]?.count,
        );

        if (response?.data[0]?.count == 1) {
          navigation.replace('ModifInfo');
        } else {
          Alert.alert('Error', lang?.screen_modify_phone?.condition?.failed);
        }
      } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      } finally {
        setPhoneNumber('');
        setIsDisable(false);
      }
    }
  };

  const onBack = () => {
    navigation.replace('ModifInfo');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.root]}>
        <View style={{flexDirection: 'row', position: 'relative'}}>
          <View style={{position: 'absolute', zIndex: 1}}>
            <ButtonBack onClick={onBack} />
          </View>
          <View
            style={{
              width: '100%',
              paddingHorizontal: 20,
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
              paddingVertical: 18,
            }}>
            <Text
              style={{
                fontFamily: getFontFam() + 'Bold',
                fontSize: fontSize('title'),
                color: '#343a59',
              }}>
              {lang?.screen_modify_phone?.title}
            </Text>
          </View>
        </View>

        {/*  Field - Phone Number */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{lang?.screen_modify_phone?.label}</Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              marginTop: Platform.OS === 'ios' ? 10 : 0,
            }}>
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              maxLength={15}
            />
          </View>
        </View>

        <IOSButtonFixer count={5} />

        {/* Bottom Section*/}
          <ButtonNext onClick={onJoin} isDisabled={isDisable} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: Dimensions.get('window').height - 250,
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
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

export default PhoneModifScreen;
