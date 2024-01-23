import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import CustomMultipleChecbox from '../../components/CustomCheckbox/CustomMultipleCheckbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const SignUpScreen = ({route}) => {
  const [lang, setLang] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [region, setRegion] = useState('');
  const [regionID, setRegionID] = useState(0);
  const [gender, setGender] = useState('pria');
  const [age, setAge] = useState('10');
  const [refferalEmail, setRefferalEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const {flag, countryCode = 82, country, code = 'KR'} = route.params || {};
  const [areaData, setAreaData] = useState([]);
  const [isListWrapperVisible, setIsListWrapperVisible] = useState(false);

  const navigation = useNavigation();

  const onSignUp = async () => {
    if (name.trim() === '') {
      Alert.alert('Error', lang.validator.emptyName);
    } else if (email.trim() === '') {
      Alert.alert('Error', lang.validator.emptyEmail);
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', lang.validator.invalidEmail);
    } else if (password.trim() === '') {
      Alert.alert('Error', lang.validator.emptyPassword);
    } else if (phoneNumber.trim() === '') {
      Alert.alert('Error', lang.validator.emptyPhone);
    } else if (regionID == 0) {
      Alert.alert('Error', lang.validator.emptyArea);
    } else {
      // Pemanggilan API ke link yang diberikan
      const apiUrl = `${URL_API}&act=login-checker-email&email=${email}`;

      try {
        // Check is email duplicate
        const response = await fetch(apiUrl);
        const responseData = await response.text();

        if (responseData === 'OK') {
          const referURL = `${URL_API}&act=ap1810-i01&email=${refferalEmail}`;

          try {
            // Check is email referral is verified
            const referRes = await fetch(referURL);
            const referData = await referRes.json();

            // Do Signup
            if (referData.result === 'true') {
              const joinRefMem = referData.member;
              const joinName = name.toString().split(' ');
              const joinFirstName = joinName[0];
              const joinLastName = joinName.slice(1).join(' ') || '';
              const joinGender = gender === 'pria' ? 2110 : 2111;
              const joinMobile = phoneNumber.toString();
              const joinAges =
                age === '10'
                  ? 2210
                  : age === '20'
                  ? 2220
                  : age === '30'
                  ? 2230
                  : age === '40'
                  ? 2240
                  : 2250;
              const joinRegion = regionID.toString();
              const joinPin = password.toString();

              const joinAPI =
                `${URL_API}&act=login-06-joinAndAccount` +
                `&email=${email}` +
                `&pin=${joinPin}` +
                `&firstname=${joinFirstName}` +
                `&lastname=${joinLastName}` +
                `&gender=${joinGender}` +
                `&mobile=${joinMobile}` +
                `&mobilecode=${countryCode}` +
                `&countrycode=${code}` +
                `&country=${countryCode}` +
                `&region=${joinRegion}` +
                `&age=${joinAges}` +
                `&recommand=${joinRefMem}`;

              console.log(joinAPI);

              navigation.navigate('EmailVerif', {
                dataEmail: email,
                pin: joinPin,
                signupUrl: joinAPI,
                mobile: joinMobile,
              });
            } else if (referData.result === 'false') {
              setRefferalEmail('');
              Alert.alert('Failed', lang.validator.invalidRecommend);
            } else {
              Alert.alert('Error', lang.validator.errorServer);
            }
          } catch (error) {
            console.error('Error during API call:', error);
            Alert.alert('Error', lang.validator.errorServer);
            crashlytics().recordError(new Error(error));
            crashlytics().log(error);
          }
        } else if (responseData === 'NO') {
          Alert.alert('Failed', lang.validator.duplicatedEmail);
        } else {
          Alert.alert('Error', lang.validator.errorServer);
        }
      } catch (error) {
        console.error('Error during API call:', error);
        Alert.alert('Error', lang.validator.errorServer);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    }
  };

  const isValidEmail = email => {
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
  };

  onEmailChange = text => {
    setEmail(text);
    setIsEmailValid(isValidEmail(text));
  };

  const onBack = () => {
    navigation.navigate('First');
  };

  const chooseRegion = (flag, countryCode, country) => {
    navigation.navigate('ChooseRegion', {
      flag: flag,
      countryCode: countryCode,
      country: country,
    });
  };

  const genderSelector = getGender => {
    if (getGender == 0) {
      setGender('pria');
    } else {
      setGender('wanita');
    }
  };

  const ageSelector = getAge => {
    if (getAge == 0) {
      setAge('10');
    } else if (getAge == 1) {
      setAge('20');
    } else if (getAge == 2) {
      setAge('30');
    } else if (getAge == 3) {
      setAge('40');
    } else if (getAge == 4) {
      setAge('50+');
    }
  };

  useEffect(() => {
    // Get Language Data
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage(currentLanguage, 'screen_signup');

        // Set your language state
        setLang(screenLang);
      } catch (err) {
        console.error('Error in fetchData:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    fetchData();

    fetch(`${URL_API}&act=app7190-01&country=${countryCode}`)
      .then(response => response.json())
      .then(jsonData => {
        var jsonToArr = Object.values(jsonData);
        var arrResult = jsonToArr.flat();
        setAreaData(arrResult);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      });
  }, []);

  // Get Update Area Data
  useEffect(() => {
    fetch(`${URL_API}&act=app7190-01&country=${countryCode ? countryCode : 82}`)
      .then(response => response.json())
      .then(jsonData => {
        var jsonToArr = Object.values(jsonData);
        var arrResult = jsonToArr.flat();
        setAreaData(arrResult);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      });
  }, [countryCode]);

  // ListWrapper
  const ListWrapper = ({onClose}) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          setIsListWrapperVisible(false);
          onClose();
        }}
        style={{
          flex: 1,
        }}>
        <View
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}>
          <ScrollView
            style={{
              position: 'absolute',
              top: '56.5%', // Sesuaikan sesuai kebutuhan
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              maxHeight: 155, // Sesuaikan sesuai kebutuhan
              overflowY: 'auto',
              elevation: 4,
              padding: 5,
              marginHorizontal: 25,
            }}>
            {areaData
              .filter(item => {
                return item.description
                  .toLowerCase()
                  .includes(region.toLowerCase());
              })
              .map((item, index) => (
                <Pressable
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#dbdbdb',
                    paddingTop: 5,
                    paddingBottom: 2,
                    marginHorizontal: 5,
                  }}
                  key={index}
                  onPress={() => {
                    setRegion(item.description);
                    setRegionID(item.subcode);
                    setIsListWrapperVisible(false);
                  }}>
                  {console.log(item.description)}
                  <Text style={styles.normalText}>{item.description}</Text>
                </Pressable>
              ))}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const closeButton = () => {
    setIsListWrapperVisible(false);
  };

  useEffect(() => {
    if (region !== '') {
      setIsListWrapperVisible(true);
    } else {
      setIsListWrapperVisible(false);
    }
  }, [region]);

  useEffect(() => {
    if (region.trim() !== '') {
      setIsListWrapperVisible(true);
    } else {
      setIsListWrapperVisible(false);
    }
  }, [region]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.root]}>
        <ButtonBack onClick={onBack} />

        {/*  Title */}
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.title ? lang.title : ''}
          </Text>
        </View>

        {/*  Field - Name */}
        <CustomInput
          label={lang && lang.name ? lang.name.label : ''}
          placeholder={lang && lang.name ? lang.name.placeholder : ''}
          value={name}
          setValue={setName}
          isPassword={false}
        />

        {/*  Field - Email */}
        <CustomInput
          label={lang && lang.email ? lang.email.label : ''}
          placeholder={lang && lang.email ? lang.email.placeholder : ''}
          value={email}
          setValue={onEmailChange}
          isPassword={false}
        />
        {isEmailValid ? null : (
          <Text
            style={{
              alignSelf: 'flex-start',
              marginLeft: 25,
              color: 'red',
              fontFamily: 'Poppins-Medium',
              fontSize: 13,
            }}>
            {lang && lang.validator ? lang.validator.invalidEmail : ''}
          </Text>
        )}

        {/*  Field - Password */}
        <CustomInput
          label={lang && lang.password ? lang.password.label : ''}
          placeholder={lang && lang.password ? lang.password.placeholder : ''}
          value={password}
          setValue={setPassword}
          secureTextEntry
          isPassword={true}
        />

        {/*  Field - Phone Number */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {lang && lang.phone_number ? lang.phone_number.label : ''}
          </Text>
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

        {/*  Field - Region */}
        <CustomInput
          label={lang && lang.area ? lang.area.label : ''}
          placeholder={lang && lang.area ? lang.area.placeholder : ''}
          value={region}
          setValue={setRegion}
          isPassword={false}
        />

        {isListWrapperVisible && <ListWrapper onClose={closeButton} />}

        {/*  Field - Gender */}
        <View style={[styles.formGroup, {zIndex: -1}]}>
          <Text style={styles.label}>
            {lang && lang.gender ? lang.gender.label : ''}
          </Text>
          <CustomMultipleChecbox
            texts={[
              lang && lang.gender ? lang.gender.male : '',
              lang && lang.gender ? lang.gender.female : '',
              ,
            ]}
            count={2}
            singleCheck={true}
            wrapperStyle={styles.horizontalChecbox}
            defaultCheckedIndices={[0]}
            onCheckChange={genderSelector}
          />
        </View>

        {/*  Field - Age */}
        <View style={[styles.formGroup, {zIndex: -1}]}>
          <Text style={styles.label}>
            {lang && lang.age ? lang.age.label : ''}
          </Text>
          <CustomMultipleChecbox
            texts={['10', '20', '30', '40', '50+']}
            count={5}
            singleCheck={true}
            wrapperStyle={styles.horizontalChecbox}
            defaultCheckedIndices={[0]}
            onCheckChange={ageSelector}
          />
        </View>

        {/* Field - Referral Email */}
        <CustomInput
          label={lang && lang.referral ? lang.referral.label : ''}
          placeholder={lang && lang.referral ? lang.referral.placeholder : ''}
          value={refferalEmail}
          setValue={setRefferalEmail}
          isPassword={false}
        />

        {/* Bottom Section */}
        <View style={[styles.bottomSection]}>
          <View style={styles.additionalLogin}>
            <Text style={styles.normalText}>
              {lang && lang.add_desc ? lang.add_desc.ad1 : ''} {'\n'}
              {lang && lang.add_desc ? lang.add_desc.ad2 : ''}
            </Text>
          </View>
          <Pressable onPress={onSignUp} style={styles.buttonSignUp}>
            <Image
              source={require('../../../assets/images/icon_next.png')}
              resizeMode="contain"
              style={styles.buttonSignUpImage}
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
    marginBottom: -20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#343a59',
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
  horizontalChecbox: {
    flexDirection: 'row',
    paddingTop: 5,
    alignSelf: 'flex-start',
  },
  formGroup: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
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

export default SignUpScreen;
