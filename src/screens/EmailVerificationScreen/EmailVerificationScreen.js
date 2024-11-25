import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
  Keyboard,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomButton from '../../components/CustomButton/';
import {
  URL_API_NODEJS,
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
} from '../../../utils';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonNext from '../../components/ButtonNext/ButtonNext';

// ########## Countdown ##########
const Countdown = ({lang, seconds, onProblem, resetKey}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds, resetKey]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resetKey]);

  const minutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      {timeLeft > 0 ? (
        <Text style={styles.disableText}>
          {lang?.screen_emailVerification?.timer?.on || ''} {formattedMinutes}:
          {formattedSeconds}
        </Text>
      ) : (
        <Pressable onPress={onProblem} style={styles.resetPassword}>
          <Text style={styles.emailAuth}>
            {lang?.screen_emailVerification?.timer?.off || ''}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// ########## Main Function ##########
const EmailVerificationScreen = () => {
  const route = useRoute();
  const {login} = useAuth();
  const {dataUser} = route.params;
  const [verificationCode, setVerificationCode] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  let ScreenHeight = Dimensions.get('window').height;
  const [lang, setLang] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [seconds, setSeconds] = useState(599);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (verificationCode.join('').length > 0) {
      setIsDisable(false);
    } else {
      setIsDisable(true);
    }
  }, [verificationCode]);

  const emailAuth = async () => {
    setSeconds(599);
    setResetKey(prev => prev + 1);

    try {
      const response = await fetch(`${URL_API_NODEJS}/check-02-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          email: dataUser?.email,
        }),
      });
      const responseData = await response.json();

      if (responseData?.data[0]?.status == 'false') {
        Alert.alert('Failed', lang.screen_emailVerification.notif.invalidEmail);
      } else {
        console.log('Kode dikirim boy');
      }
    } catch (error) {
      console.error('Error during emailAuth:', error);
    }
  };

  // Send Code Auth Again
  const sendCodeAgain = () => {
    emailAuth();
    setModalVisible(!modalVisible);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        // Set your language state
        setLang(screenLang);
      } catch (err) {
        console.error('Error in fetchData:', err);
      }
    };

    fetchData();
    emailAuth();
  }, []);

  const onBack = () => {
    navigation.navigate('First');
  };

  const onLoginPassword = () => {
    navigation.navigate('SignPassword', {
      mobile: dataUser.mobile,
    });
    setModalVisible(false);
  };

  // add new member -> act = login-06-joinAndAccount
  const addNewMember = async () => {
    const {
      name,
      email,
      phoneNumber,
      pin,
      region,
      age: tempAge,
      gender: tempGender,
      mobileCode,
      countryCode,
      recommand,
    } = dataUser;

    try {
      const firstname = name.split(' ')[0];
      const lastname = name.split(' ').slice(1).join(' ');
      const age =
        tempAge === '10'
          ? 2210
          : tempAge === '20'
          ? 2220
          : tempAge === '30'
          ? 2230
          : tempAge === '40'
          ? 2240
          : 2250;
      const gender = tempGender === 'pria' ? 2110 : 2111;
      const os = Platform.OS === 'ios' ? 3113 : 3112;
      console.log(
        `Firstname: ${firstname} | Lastname: ${lastname} | Email: ${email} | Pin: ${pin} | Phone Number: ${phoneNumber} | age: ${age} | region: ${region} | gender: ${gender} | Country Code: ${countryCode} | Mobi	le Code: ${mobileCode} | Recommand: ${recommand} : OS: ${os}`,
      );

      const request = await fetch(`${URL_API_NODEJS}/login-06-joinAndAccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          email,
          pin,
          firstname,
          lastname,
          gender,
          mobile: phoneNumber,
          mobilecode: mobileCode,
          countrycode: countryCode,
          country: mobileCode,
          region,
          age,
          recommand,
          os,
        }),
      });
      const response = await request.json();
      console.log(`Data SignUp response: ${JSON.stringify(response)}`);

      if (response?.data[0]?.text == 'ok') {
        loginChecker();
      }
    } catch (error) {
      console.log(`Error during Signup: ${error}`);
      Alert.alert('Error', lang.screen_emailVerification.notif.errorServer);
    }
  };

  // Check login with email and password/pin
  const loginChecker = async () => {
    const {email, pin} = dataUser;

    try {
      const request = await fetch(`${URL_API_NODEJS}/login-checker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          email,
          pin,
        }),
      });
      const response = await request.json();

      console.log({response});

      if (response.data[0].value == 'OK') {
        navigation.replace('SuccessJoin', {
          email,
          pin,
        });
      } else {
        Alert.alert('Failed', lang.screen_emailVerification.notif.errorServer);
      }
    } catch (error) {
      console.log(`Error during check login email & pin: ${error}`);
    }
  };

  const onSignIn = async () => {
    if (verificationCode.join('').length < 6) {
      Alert.alert('Failed', lang.screen_emailVerification.email.label);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsDisable(true);

    const getAuthCode = verificationCode.join('');
    // Check Email & Auth Code Relational
    try {
      const responseAuth = await fetch(`${URL_API_NODEJS}/login-03-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          email: dataUser?.email,
          code: getAuthCode,
        }),
      });
      const responseAuthData = await responseAuth.json();

      if (responseAuthData.status !== 'success') {
        Alert.alert('Failed', lang.screen_emailVerification.notif.wrongCode);
      } else {
        addNewMember();
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error during Check Auth Code:', error);
    } finally {
      setIsSubmitting(false);
      setIsDisable(false);
    }
  };

  const onSignInDisabled = () => {
    Alert.alert('Warning', lang.screen_emailVerification.notif.emptyCode);
  };

  const onProblem = () => {
    setModalVisible(!modalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  // ########## Input Verification Code ##########
  const inputRefs = useRef([]);

  const handleInputChange = (text, index) => {
    const newCode = [...verificationCode];
    newCode[index] = text;

    setVerificationCode(newCode);

    if (text != '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleInputDelete = index => {
    if (verificationCode[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    const newCode = [...verificationCode];
    newCode[index] = '';

    setVerificationCode(newCode);
  };

  const isCodeComplete = verificationCode.every(code => code !== '');

  // ########## Help Modal ##########
  const SliderModal = ({visible, onClose}) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Image
                  source={require('../../../assets/images/icon_close.png')}
                  resizeMode="contain"
                  style={{height: 25}}
                />
              </TouchableOpacity>
              <CustomButton
                onPress={sendCodeAgain}
                text={
                  lang &&
                  lang.screen_emailVerification &&
                  lang.screen_emailVerification.timer
                    ? lang.screen_emailVerification.timer.sendAgain
                    : ''
                }
              />
              <CustomButton
                text={
                  lang &&
                  lang.screen_emailVerification &&
                  lang.screen_emailVerification.timer
                    ? lang.screen_emailVerification.timer.loginPassword
                    : ''
                }
                onPress={onLoginPassword}
                type="SECONDARY"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />
        {/* Text Section */}
        <View style={styles.textWrapper}>
          <Text style={styles.normalText}>
            {lang &&
            lang.screen_emailVerification &&
            lang.screen_emailVerification.email
              ? lang.screen_emailVerification.email.label
              : ''}
          </Text>
          <Text style={styles.boldText}>{dataUser.email}</Text>
        </View>

        {/* Code Input */}
        <View style={styles.codeInputContainer}>
          {verificationCode.map((code, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                activeIndex === index && styles.activeInput,
              ]}
              value={code}
              placeholder="0"
              placeholderTextColor="grey"
              onChangeText={text => handleInputChange(text, index)}
              onKeyPress={({nativeEvent}) => {
                if (nativeEvent.key === 'Backspace') {
                  handleInputDelete(index);
                }
              }}
              onFocus={() => setActiveIndex(index)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>

        {/* Bottom Section*/}
        <ButtonNext onClick={onSignIn} isDisabled={isDisable}>
          <View style={styles.additionalLogin}>
            <Countdown
              lang={lang}
              onProblem={onProblem}
              seconds={seconds}
              resetKey={resetKey}
            />
          </View>
        </ButtonNext>

        {/* Slider Modal */}
        <SliderModal visible={modalVisible} onClose={toggleModal} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
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
  textWrapper: {
    width: '100%',
    padding: 20,
  },
  normalText: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
  boldText: {
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('subtitle'),
    color: '#343a59',
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
    bottom: 0,
  },
  additionalLogin: {
    maxWidth: 200,
  },
  emailAuth: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
  disableText: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: '#aeb1b5',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  codeInput: {
    width: 40,
    height: 60,
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('title'),
    color: '#343a59',
    borderBottomWidth: 2,
    borderRadius: 5,
    borderColor: '#cdced4',
    marginHorizontal: 5,
    textAlign: 'center',
  },
  activeInput: {
    borderColor: '#343a59',
    backgroundColor: '#e1eff0',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    paddingBottom: 50,
  },
  modalText: {
    fontSize: fontSize('subtitle'),
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 7,
  },
});

export default EmailVerificationScreen;
