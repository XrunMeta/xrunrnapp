import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import {useAuth} from '../../context/AuthContext/AuthContext';
import CustomMultipleChecbox from '../../components/CustomCheckbox/CustomMultipleCheckbox';
import crashlytics from '@react-native-firebase/crashlytics';

const SignUpCreateGender = () => {
  const route = useRoute();
  const [lang, setLang] = useState({});
  const [gender, setGender] = useState(0);
  const {mobile, mobilecode, countrycode, email, pin, firstname, lastname} =
    route.params;
  const {login} = useAuth();

  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;

  const onBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    // Get Language
    const fetchLangData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
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

    fetchLangData();
  }, []);

  const onSignUp = async () => {
    const genderCode = gender == 0 ? 2110 : 2111;

    const joinAPI =
      `${URL_API}&act=login-06-joinAndAccount` +
      `&email=${email}` +
      `&pin=${pin}` +
      `&firstname=${firstname}` +
      `&lastname=${lastname}` +
      `&gender=${genderCode}` +
      `&mobile=${mobile}` +
      `&mobilecode=${mobilecode}` +
      `&countrycode=${countrycode}` +
      `&country=${mobilecode}` +
      `&region=${2}` +
      `&age=${2210}` +
      `&recommand=${0}`;

    console.log('API Join -> ' + joinAPI);

    try {
      const response = await fetch(joinAPI);
      const responseData = await response.json();

      console.log('Join SignUp Response -> ', responseData);

      if (responseData.data === 'ok') {
        await AsyncStorage.setItem('userEmail', email);
        login();
        navigation.replace('SuccessJoin', {
          email: email,
          pin: pin,
        });
      } else {
        Alert.alert('Error', lang.screen_notExist.field_gender.errorServer, [
          {
            text: 'OK',
            onPress: () => {
              userPressedOK = true;
              navigation.replace('First');
            },
          },
        ]);

        // Idle conditioning
        setTimeout(() => {
          if (!userPressedOK) {
            navigation.replace('First');
          }
        }, 10000); // 10 second
      }
    } catch (error) {
      console.error('Error during API request:', error);
      Alert.alert('Error', lang.screen_notExist.field_gender.errorServer);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  };

  const genderSelector = getGender => {
    setGender(getGender);
    console.log('Gender yg dipilih -> ' + getGender);
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      <ButtonBack onClick={onBack} />

      <View
        style={{
          width: '100%',
          paddingHorizontal: 25,
          marginTop: 30,
          zIndex: -1,
        }}>
        {/*  Field - Gender */}
        <Text
          style={{
            fontFamily: getFontFam() + 'Medium',
            fontSize: fontSize('body'),
            color: '#343a59',
            marginBottom: -5,
          }}>
          {lang && lang.screen_notExist && lang.screen_notExist.field_gender
            ? lang.screen_notExist.field_gender.label
            : ''}
        </Text>
        <CustomMultipleChecbox
          texts={[
            lang && lang.screen_notExist && lang.screen_notExist.field_gender
              ? lang.screen_notExist.field_gender.male
              : '',
            lang && lang.screen_notExist && lang.screen_notExist.field_gender
              ? lang.screen_notExist.field_gender.female
              : '',
          ]}
          count={2}
          singleCheck={true}
          wrapperStyle={{
            flexDirection: 'row',
            paddingTop: 5,
            alignSelf: 'flex-start',
          }}
          defaultCheckedIndices={[gender]}
          onCheckChange={genderSelector}
        />
      </View>

      <View style={[styles.bottomSection]}>
        <Pressable onPress={onSignUp} style={styles.buttonSignIn}>
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
  bottomSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    width: '100%',
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

export default SignUpCreateGender;
