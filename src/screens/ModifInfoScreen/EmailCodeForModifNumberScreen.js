import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  SafeAreaView,
  KeyboardAvoidingView,
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
} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Countdown from './Countdown';
import ButtonNext from '../../components/ButtonNext/ButtonNext';

// ########## Main Function ##########
const EmailCodeForModifNumberScreen = () => {
  const route = useRoute();
  const {dataEmail, member, countryCode} = route.params;
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
  const [isDisable, setIsDisable] = useState(true);
  const [restartCountdown, setRestartCountdown] = useState(0);

  const emailAuth = async () => {
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

      const responseData = await response.json(); // Convert response to JSON

      if (responseData?.data[0]?.status == 'false') {
        Alert.alert('Failed', 'Please enter your email');
      } else {
        console.log('Kode dikirim boy');
        console.log({responseData});
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error during emailAuth:', error);
    }
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
  }, []);

  useEffect(() => {
    const mergeCode = verificationCode.join('');
    setIsDisable(mergeCode == '' ? true : false);
  }, [verificationCode]);

  const onBack = () => {
    navigation.replace('ModifInfo');
  };

  const onSignIn = async () => {
    if (verificationCode.join('').length < 6) {
      Alert.alert('Failed', lang.screen_emailVerification.email.label);
      return;
    }

    if (isDisable) return;
    setIsDisable(true);

    // Cek jika semua kode sudah diisi
    if (!isCodeComplete) {
      Alert.alert('Failed', lang.screen_emailVerification.notif.wrongCode);
      return;
    }

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
          email: dataEmail,
          code: getAuthCode,
        }),
      });

      const responseAuthData = await responseAuth.json();
      console.log(JSON.stringify(responseAuthData));

      if (responseAuthData.status == 'success') {
        navigation.replace('PhoneModif', {member: member, countryCode});
        setIsDisable(false);
      } else {
        Alert.alert('Failed', lang.screen_emailVerification.notif.wrongCode);
        setIsDisable(false);
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error during Check Auth Code:', error);
    } finally {
      setIsDisable(false);
    }
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
    setRestartCountdown(prev => prev + 100);
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

  // Function untuk handle ketika countdown selesai
  const handleCountdownFinish = () => {
    console.log('Countdown selesai');
  };

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
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
                {lang && lang.screen_appInfo
                  ? lang.screen_emailAuth?.label
                  : ''}
              </Text>
            </View>
          </View>

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

          {/* <View style={[styles.bottomSection]}>
            <View style={styles.additionalLogin}>
              <Countdown
                onFinish={handleCountdownFinish}
                lang={lang}
                onProblem={onProblem}
                restart={restartCountdown}
              />
            </View>
            <Pressable
              onPress={onSignIn}
              style={styles.buttonSignIn}
              disabled={isDisable}>
              <Image
                source={
                  isDisable
                    ? require('../../../assets/images/icon_nextDisable.png')
                    : require('../../../assets/images/icon_next.png')
                }
                resizeMode="contain"
                style={styles.buttonSignInImage}
              />
            </Pressable>
          </View> */}

          {/* Slider Modal */}
          <SliderModal visible={modalVisible} onClose={toggleModal} />
        </ScrollView>
        {/* Bottom Section*/}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex: 1}}>
          <ButtonNext onClick={onSignIn} isDisabled={isDisable}>
            <View style={styles.additionalLogin}>
              <Countdown
                onFinish={handleCountdownFinish}
                lang={lang}
                onProblem={onProblem}
                restart={restartCountdown}
              />
            </View>
          </ButtonNext>
        </KeyboardAvoidingView>
      </SafeAreaView>
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

export default EmailCodeForModifNumberScreen;
