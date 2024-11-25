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
  SafeAreaView,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import {
  URL_API_NODEJS,
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
  saveLogsDB,
} from '../../../utils';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonNext from '../../components/ButtonNext/ButtonNext';

// ########## Countdown Component ##########
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
const EmailVerificationLoginScreen = () => {
  const route = useRoute();
  const {login} = useAuth();
  const {dataEmail} = route.params;
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
          email: dataEmail,
        }),
      });

      const responseData = await response.json();

      if (responseData?.data[0]?.status == 'false') {
        Alert.alert('Failed', 'Please enter your email');
      } else {
        console.log('Kode dikirim boy');
      }
    } catch (error) {
      console.error('Error during emailAuth:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        // Start initial countdown when component mounts
        emailAuth();
      } catch (err) {
        console.error('Error in fetchData:', err);
      }
    };

    fetchData();
  }, []);

  const onBack = () => {
    navigation.navigate('First');
  };

  const onLoginPassword = () => {
    navigation.replace('SignPassword');
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
      saveLogsDB(
        '5000022',
        0,
        `${dataEmail} - User entered email auth code and clicked Sign-in button`,
        `${dataEmail} - ${getAuthCode} - User entered this auth code and clicked Sign-in button`,
      );
      const responseAuth = await fetch(`${URL_API_NODEJS}/login-03-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          email: dataEmail,
          code: getAuthCode,
        }),
      });

      const responseAuthData = await responseAuth.json();
      console.log(JSON.stringify(responseAuthData));

      if (responseAuthData.status !== 'success') {
        Alert.alert('Failed', lang.screen_emailVerification.notif.wrongCode);
      } else {
        try {
          const responseLogin = await fetch(
            `${URL_API_NODEJS}/login-04-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authcode}`,
              },
              body: JSON.stringify({
                email: dataEmail,
              }),
            },
          );
          const responseLoginData = await responseLogin.json();

          console.log(
            'RespAPI login-04-email -> ' + JSON.stringify(responseLoginData),
          );

          if (responseLoginData.status !== 'success') {
            navigation.replace('SignUp');
          } else {
            const userData = {
              ages: responseLoginData?.data[0]?.ages,
              country: responseLoginData?.data[0]?.country,
              email: responseLoginData?.data[0]?.email,
              extrastr: responseLoginData?.data[0]?.extrastr,
              firstname: responseLoginData?.data[0]?.firstname,
              gender: responseLoginData?.data[0]?.gender,
              lastname: responseLoginData?.data[0]?.lastname,
              member: responseLoginData?.data[0]?.member,
              mobilecode: responseLoginData?.data[0]?.mobilecode,
            };

            await AsyncStorage.setItem('userEmail', dataEmail);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            console.log({userData});
            login();
            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            });
          }
        } catch (error) {
          // Handle network errors or other exceptions
          console.error('Error during Check Login Email & Pin:', error);
        }
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

  // Send Code Auth Again
  const sendCodeAgain = () => {
    emailAuth();
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
    <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
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
        <Text style={styles.boldText}>{dataEmail}</Text>
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
    </SafeAreaView>
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

export default EmailVerificationLoginScreen;
