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
} from '../../../utils';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

// ########## Main Function ##########
const PhoneVerificationScreen = () => {
  const route = useRoute();
  const {login} = useAuth();
  const {mobile, mobilecode, countrycode} = route.params;
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  let ScreenHeight = Dimensions.get('window').height;
  const [lang, setLang] = useState({});

  const phoneAuth = async () => {
    try {
      const response = await fetch(`${URL_API_NODEJS}/login-02`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          mobile,
        }),
      });
      const responseData = await response.json(); // Convert response to JSON

      console.log(responseData.data[0]);

      if (responseData?.data[0]?.status == true) {
        console.log('Kode dikirim boy');
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
  };

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
    phoneAuth();
  }, []);

  const onBack = () => {
    navigation.replace('PhoneLogin');
  };

  const onSignIn = async () => {
    const getAuthCode = verificationCode.join('');

    // Check Email & Auth Code Relational
    try {
      const responseAuth = await fetch(`${URL_API_NODEJS}/login-03`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          mobile,
          code: getAuthCode,
        }),
      });
      const responseAuthText = await responseAuth.json();
      const firstResObj = responseAuthText?.data[0];

      console.log('RespAPI login-03 -> ' + JSON.stringify(firstResObj));

      if (firstResObj.data == false) {
        // Invalid Number
        Alert.alert(
          'Failed',
          lang.screen_notExist.field_phoneVerif.invalidNumber,
        );
        // navigation.navigate('SignupByEmail', {
        //   mobile: mobile,
        //   mobilecode: mobilecode,
        //   countrycode: countrycode,
        // });

        navigation.replace('SignIn');

        console.log(`
          Data dikirim (Phone Verif) :
            Mobile  => ${mobile}
            MobCode => ${mobilecode}
            CouCode => ${countrycode}
        `);
      } else if (firstResObj?.data == 'login') {
        // Login Automatically
        try {
          const responseLogin = await fetch(`${URL_API_NODEJS}/login-01`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authcode}`,
            },
            body: JSON.stringify({
              mobile,
              type: 2,
            }),
          });
          const responseLoginData = await responseLogin.json();

          console.log(
            JSON.stringify(responseLoginData) +
              ' -> data:' +
              responseLoginData?.data[0]?.data,
          );

          if (responseLoginData?.status !== 'success') {
            console.log('ke halaman berikutnya (ap1700)');
            navigation.navigate('SignupByEmail', {
              mobile: mobile,
              mobilecode: mobilecode,
              countrycode: countrycode,
            });
          } else {
            await AsyncStorage.setItem('userEmail', responseLoginData.email);
            // Do Login Auth
            login();
            navigation.reset({
              index: 0,
              routes: [{name: 'Home'}],
            });
          }
        } catch (error) {
          console.error('Error during Check Login with Mobile:', error);
          crashlytics().recordError(new Error(error));
          crashlytics().log(error);
        }
      } else {
        console.log('ke halaman berikutnya (ap1700)');
        // navigation.navigate('SignupByEmail', {
        //   mobile: mobile,
        //   mobilecode: mobilecode,
        //   countrycode: countrycode,
        // });
        navigation.replace('SignIn');
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error during Check Auth Code:', error);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  };

  const onSignInDisabled = () => {
    Alert.alert('Warning', lang.screen_notExist.field_phoneVerif.emptyCode);
  };

  const onProblem = () => {
    setModalVisible(!modalVisible);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  // Send Code Auth Again
  const sendCodeAgain = () => {
    phoneAuth();
    setModalVisible(!modalVisible);
  };

  // ########## Input Verification Code ##########
  const inputRefs = useRef([]);

  const handleInputChange = (text, index) => {
    const newCode = [...verificationCode];
    newCode[index] = text;

    setVerificationCode(newCode);

    if (text != '' && index < 3) {
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

  // ########## Countdown ##########
  const Countdown = () => {
    // const [seconds, setSeconds] = useState(599); // Duration
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [seconds]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return (
      <View style={styles.container}>
        {seconds > 0 ? (
          <Text style={styles.disableText}>
            {lang &&
            lang.screen_notExist &&
            lang.screen_notExist.field_phoneVerif
              ? lang.screen_notExist.field_phoneVerif.on
              : ''}{' '}
            {formattedMinutes}:{formattedSeconds}
          </Text>
        ) : (
          <Pressable onPress={onProblem} style={styles.resetPassword}>
            <Text style={styles.emailAuth}>
              {lang &&
              lang.screen_notExist &&
              lang.screen_notExist.field_phoneVerif
                ? lang.screen_notExist.field_phoneVerif.off
                : ''}
            </Text>
          </Pressable>
        )}
      </View>
    );
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
                  lang.screen_notExist &&
                  lang.screen_notExist.field_phoneVerif
                    ? lang.screen_notExist.field_phoneVerif.sendAgain
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
    <SafeAreaView>
      <ScrollView style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        {/* Text Section */}
        <View style={styles.textWrapper}>
          <Text style={styles.normalText}>
            {lang &&
            lang.screen_notExist &&
            lang.screen_notExist.field_phoneVerif
              ? lang.screen_notExist.field_phoneVerif.label
              : ''}
          </Text>
          <Text style={styles.boldText}>{mobile}</Text>
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
              placeholder="0"
              placeholderTextColor="grey"
              value={code}
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
        <View style={[styles.bottomSection]}>
          <View style={styles.additionalLogin}>
            <Countdown />
          </View>
          {isCodeComplete ? (
            <Pressable onPress={onSignIn} style={styles.buttonSignIn}>
              <Image
                source={require('../../../assets/images/icon_next.png')}
                resizeMode="contain"
                style={styles.buttonSignInImage}
              />
            </Pressable>
          ) : (
            <Pressable onPress={onSignInDisabled} style={styles.buttonSignIn}>
              <Image
                source={require('../../../assets/images/icon_nextDisable.png')}
                resizeMode="contain"
                style={styles.buttonSignInImage}
              />
            </Pressable>
          )}
        </View>

        {/* Slider Modal */}
        <SliderModal visible={modalVisible} onClose={toggleModal} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {},
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
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
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
    width: '100%',
    padding: 20,
    height: Dimensions.get('window').height - 370,
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

export default PhoneVerificationScreen;
