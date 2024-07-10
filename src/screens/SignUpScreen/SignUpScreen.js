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
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomInput from '../../components/CustomInput';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import CustomMultipleChecbox from '../../components/CustomCheckbox/CustomMultipleCheckbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import {useAuth} from '../../context/AuthContext/AuthContext';

const SignUpScreen = ({route}) => {
  const [lang, setLang] = useState({});
  const [name, setName] = useState('test');
  const [email, setEmail] = useState('wawasanbelajar14@gmail.com');
  const [password, setPassword] = useState('test1234');
  const [phoneNumber, setPhoneNumber] = useState('213123');
  const [authCode, setAuthCode] = useState('');
  const [region, setRegion] = useState('');
  const [regionID, setRegionID] = useState(0);
  const [gender, setGender] = useState('pria');
  const [age, setAge] = useState('10');
  const [refferalEmail, setRefferalEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const {flag, countryCode = 82, country, code = 'KR'} = route.params || {};
  const [areaData, setAreaData] = useState([]);
  const [isListWrapperVisible, setIsListWrapperVisible] = useState(false);
  const [authShow, setAuthShow] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const navigation = useNavigation();

  const onSignUp = async () => {
    if (name.trim() === '') {
      Alert.alert('Error', lang.screen_signup.validator.emptyName);
    } else if (email.trim() === '') {
      Alert.alert('Error', lang.screen_signup.validator.emptyEmail);
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', lang.screen_signup.validator.invalidEmail);
    } else if (password.trim() === '') {
      Alert.alert('Error', lang.screen_signup.validator.emptyPassword);
    } else if (phoneNumber.trim() === '') {
      Alert.alert('Error', lang.screen_signup.validator.emptyPhone);
    } else if (regionID == 0) {
      Alert.alert('Error', lang.screen_signup.validator.emptyArea);
    } else {
      // Check the email
      const requestCheckEmail = await fetch(
        `${URL_API}&act=login-checker-email&email=${email}`,
      );
      const responseCheckEmail = await requestCheckEmail.text();

      if (responseCheckEmail === 'OK') {
        // Check for the referral email
        const requestReferralEmail = await fetch(
          `${URL_API}&act=ap1810-i01&email=${refferalEmail}`,
        );
        const responseReferralEmail = await requestReferralEmail.json();

        if (responseReferralEmail.result === 'true') {
          const referralMember =
            refferalEmail === '' ? 0 : responseReferralEmail.member;

          navigation.navigate('EmailVerif', {
            dataUser: {
              name,
              email,
              phoneNumber,
              region: regionID,
              age,
              refferalEmail,
              pin: password,
              gender,
              mobileCode: countryCode,
              countryCode: code,
              recommand: referralMember,
            },
          });
        } else if (responseCheckEmail.result === 'false') {
          setRefferalEmail('');
          Alert.alert('Failed', lang.screen_signup.validator.invalidRecommend);
        } else {
          Alert.alert('Error', lang.screen_signup.validator.errorServer);
        }
      } else if (responseCheckEmail === 'NO') {
        Alert.alert('Failed', lang.screen_signup.validator.duplicatedEmail);
      } else {
        Alert.alert('Error', lang.screen_signup.validator.errorServer);
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
        const screenLang = await getLanguage2(currentLanguage);

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

  const onAuth = async (mobile, country) => {
    if (phoneNumber !== '') {
      setAuthLoading(true);

      try {
        const response = await fetch(
          `${URL_API}&act=login-02&mobile=${mobile}&country=${country}`,
        );
        const responseData = await response.json(); // Convert response to JSON

        console.log(responseData.data);

        if (responseData.data === 'ok') {
          console.log('Kode dikirim boy');
          setAuthShow(!authShow);
          setAuthLoading(false);
        } else {
          Alert.alert(
            'Failed',
            lang.screen_notExist.field_phoneVerif.emptyNumber,
          );
        }
      } catch (error) {
        // Handle network errors or other exceptions
        console.error('Error during Phone Auth:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    } else {
      Alert.alert('Failed', lang.screen_notExist.field_phoneVerif.emptyNumber);
    }
  };

  const onVerify = async (mobile, authCode) => {
    if (authCode !== '') {
      setVerifyLoading(true);
      console.log('Bgst -> ' + mobile + ' ' + authCode);
      // Check Email & Auth Code Relational
      try {
        const responseAuth = await fetch(
          `${URL_API}&act=login-03&mobile=${mobile}&code=${authCode}`,
        );
        const responseAuthText = await responseAuth.text();
        const responseObjects = responseAuthText.split('}');
        const firstResObj = JSON.parse(responseObjects[0] + '}');

        if (firstResObj) {
          console.log('RespAPI login-03 -> ' + JSON.stringify(firstResObj));
          setVerifyLoading(false);

          if (firstResObj.data === 'false') {
            // Invalid Number
            Alert.alert(
              'Failed',
              lang.screen_notExist.field_phoneVerif.invalidNumber,
            );
            setAuthCode('');
            setAuthShow(false);
          } else if (firstResObj.data === 'login') {
            // Correct Code
            setAuthCode('');
            setAuthShow(false);
            setAuthenticated(true);
            console.log('Kode udah diverifikasi');
          } else {
            // Error Server
            Alert.alert('Error', lang.screen_signup.validator.errorServer);
          }
        } else {
        }
      } catch (error) {
        // Handle network errors or other exceptions
        console.error('Error during Check Auth Code:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    } else {
      Alert.alert('Warning', lang.screen_notExist.field_phoneVerif.emptyCode);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.root]}>
          <ButtonBack onClick={onBack} />

          {/*  Title */}
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              {lang && lang.screen_signup && lang.screen_signup.title
                ? lang.screen_signup.title
                : ''}
            </Text>
          </View>

          {/*  Field - Name */}
          <CustomInput
            label={
              lang && lang.screen_signup && lang.screen_signup.name
                ? lang.screen_signup.name.label
                : ''
            }
            placeholder={
              lang && lang.screen_signup && lang.screen_signup.name
                ? lang.screen_signup.name.placeholder
                : ''
            }
            value={name}
            setValue={setName}
            isPassword={false}
          />

          {/*  Field - Email */}
          <CustomInput
            label={
              lang && lang.screen_signup && lang.screen_signup.email
                ? lang.screen_signup.email.label
                : ''
            }
            placeholder={
              lang && lang.screen_signup && lang.screen_signup.email
                ? lang.screen_signup.email.placeholder
                : ''
            }
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
                fontFamily: getFontFam() + 'Medium',
                fontSize: fontSize('body'),
              }}>
              {lang && lang.screen_signup && lang.screen_signup.validator
                ? lang.screen_signup.validator.invalidEmail
                : ''}
            </Text>
          )}

          {/*  Field - Password */}
          <CustomInput
            label={
              lang && lang.screen_signup && lang.screen_signup.password
                ? lang.screen_signup.password.label
                : ''
            }
            placeholder={
              lang && lang.screen_signup && lang.screen_signup.password
                ? lang.screen_signup.password.placeholder
                : ''
            }
            value={password}
            setValue={setPassword}
            secureTextEntry
            isPassword={true}
          />

          {/*  Field - Phone Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {lang && lang.screen_signup && lang.screen_signup.phone_number
                ? lang.screen_signup.phone_number.label
                : ''}
            </Text>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
              }}>
              <Pressable
                style={{
                  flexDirection: 'row',
                  marginBottom: -10,
                }}
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
                editable={!authenticated}
                onPressIn={() =>
                  authenticated &&
                  Alert.alert(
                    lang &&
                      lang.screen_signup &&
                      lang.screen_signup.phone_number
                      ? lang.screen_signup.phone_number.disabled
                      : '',
                    lang &&
                      lang.screen_signup &&
                      lang.screen_signup.phone_number
                      ? lang.screen_signup.phone_number.disabledDesc
                      : '',
                  )
                }
              />
            </View>
          </View>

          {/*  Field - Region */}
          <CustomInput
            label={
              lang && lang.screen_signup && lang.screen_signup.area
                ? lang.screen_signup.area.label
                : ''
            }
            placeholder={
              lang && lang.screen_signup && lang.screen_signup.area
                ? lang.screen_signup.area.placeholder
                : ''
            }
            value={region}
            setValue={setRegion}
            isPassword={false}
          />

          {isListWrapperVisible && <ListWrapper onClose={closeButton} />}

          {/*  Field - Gender */}
          <View style={[styles.formGroup, {zIndex: -1}]}>
            <Text style={styles.label}>
              {lang && lang.screen_signup && lang.screen_signup.gender
                ? lang.screen_signup.gender.label
                : ''}
            </Text>
            <CustomMultipleChecbox
              texts={[
                lang && lang.screen_signup && lang.screen_signup.gender
                  ? lang.screen_signup.gender.male
                  : '',
                lang && lang.screen_signup && lang.screen_signup.gender
                  ? lang.screen_signup.gender.female
                  : '',
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
              {lang && lang.screen_signup && lang.screen_signup.age
                ? lang.screen_signup.age.label
                : ''}
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
            label={
              lang && lang.screen_signup && lang.screen_signup.referral
                ? lang.screen_signup.referral.label
                : ''
            }
            placeholder={
              lang && lang.screen_signup && lang.screen_signup.referral
                ? lang.screen_signup.referral.placeholder
                : ''
            }
            value={refferalEmail}
            setValue={setRefferalEmail}
            isPassword={false}
          />

          {/* Bottom Section */}
          <View style={[styles.bottomSection]}>
            <View style={styles.additionalLogin}>
              <Text style={styles.normalText}>
                {lang && lang.screen_signup && lang.screen_signup.add_desc
                  ? lang.screen_signup.add_desc.ad1
                  : ''}{' '}
                {'\n'}
                {lang && lang.screen_signup && lang.screen_signup.add_desc
                  ? lang.screen_signup.add_desc.ad2
                  : ''}
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={authShow}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setAuthShow(!authShow);
        }}>
        <View
          style={{
            flex: 1,
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            onPress={() => setAuthShow(!authShow)}
            style={{
              backgroundColor: '#0000004d',
              flex: 1,
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 10,
              width: 150,
            }}>
            <Text style={styles.label}>Code</Text>

            <TextInput
              keyboardType="numeric"
              style={{
                fontFamily: getFontFam() + 'Medium',
                fontSize: fontSize('body'),
                color: '#343a59',
                borderBottomColor: '#cccccc',
                borderBottomWidth: 1,
                paddingHorizontal: 5,
                paddingBottom: -10,
              }}
              placeholder="Verification code"
              value={authCode}
              setValue={setAuthCode}
              onChangeText={text => setAuthCode(text)}
              maxLength={4}
            />

            <TouchableOpacity
              style={{
                backgroundColor: '#343a59',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 7,
                marginTop: 20,
              }}
              onPress={() => onVerify(phoneNumber, authCode)}>
              {verifyLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  style={{
                    fontFamily: getFontFam() + 'Medium',
                    fontSize: fontSize('note'),
                    color: 'white',
                  }}>
                  {lang && lang.screen_signup && lang.screen_signup.phone_number
                    ? lang.screen_signup.phone_number.auth
                    : ''}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('title'),
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    paddingHorizontal: 5,
    paddingBottom: -10,
    paddingTop: 5,
    flex: 1,
    marginRight: 10,
  },
});

export default SignUpScreen;
