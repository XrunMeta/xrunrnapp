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
  Button,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import {URL_API} from '../../../utils';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ########## Main Function ##########
const PhoneVerificationScreen = () => {
  const route = useRoute();
  const {isLoggedIn, login} = useAuth();
  const {mobile} = route.params;
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  let ScreenHeight = Dimensions.get('window').height;

  const emailAuth = async () => {
    try {
      const response = await fetch(`${URL_API}&act=login-02&mobile=${mobile}`);
      const responseData = await response.json(); // Convert response to JSON

      console.log(responseData.data);

      if (responseData.data === 'ok') {
        console.log('Kode dikirim boy');
      } else {
        Alert.alert('Failed', 'Please enter your number');
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error during Phone Auth:', error);
    }
  };

  useEffect(() => {
    emailAuth();
  }, []);

  const onBack = () => {
    navigation.navigate('First');
  };

  const onLoginPassword = () => {
    navigation.replace('SignIn');
  };

  const onSignIn = async () => {
    const getAuthCode = verificationCode.join('');

    console.log(
      'Url API login-03 -> ' +
        `${URL_API}&act=login-03&mobile=${mobile}&code=${getAuthCode}`,
    );

    // Check Email & Auth Code Relational
    try {
      const responseAuth = await fetch(
        `${URL_API}&act=login-03&mobile=${mobile}&code=${getAuthCode}`,
      );
      const responseAuthText = await responseAuth.text();

      // Pisahkan objek JSON
      const responseObjects = responseAuthText.split('Jamal');

      // Bentuk kembali setiap objek JSON
      responseObjects.forEach(async (responseObject, index) => {
        let formattedResponse = responseObject;

        // // Tambahkan kurung kurawal di depan dan belakang
        // if (index !== 0) {
        //   formattedResponse = '{' + formattedResponse;
        // }
        // if (index !== responseObjects.length - 1) {
        //   formattedResponse = formattedResponse + '}';
        // }

        console.log('Hahaydde -> ' + formattedResponse);

        // try {
        //   const parsedResponse = JSON.parse(formattedResponse);
        //   console.log('Hasilnya -> ' + JSON.stringify(parsedResponse));
        // } catch (error) {
        //   console.error('Error parsing JSON:', error);
        // }
      });

      // if (responseAuthData.data === 'false') {
      //   // When auth code is false
      //   Alert.alert('Failed', 'Your Auth Code is Wrong');
      // } else if (responseAuthData.data === 'login') {
      //   // Try to login
      //   try {
      //     const responseLogin = await fetch(
      //       `${URL_API}&act=login-01&tp=2&mobile=${mobile}`,
      //     );
      //     const responseLoginData = await responseLogin.json();

      //     console.log(responseLoginData);

      //     // if (responseLoginData === 'OK') {
      //     //   // await AsyncStorage.setItem('userEmail', mobile);
      //     //   login();
      //     //   navigation.replace('SuccessJoin');
      //     // } else {
      //     //   Alert.alert(
      //     //     'Failed',
      //     //     "It's a server problem. Please try in a few minutes.",
      //     //   );
      //     // }
      //   } catch (error) {
      //     console.error('Error during Check Login with Mobile:', error);
      //   }
      // } else {
      //   console.log('ke halaman berikutnya (ap1700)');
      // }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error during Check Auth Code:', error);
    }
  };

  const onSignInDisabled = () => {
    Alert.alert('Peringatan', 'Tolong lengkapi kode verifikasi');
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
    const [seconds, setSeconds] = useState(5);

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
            Please send your code in {formattedMinutes}:{formattedSeconds}
          </Text>
        ) : (
          <Pressable onPress={onProblem} style={styles.resetPassword}>
            <Text style={styles.emailAuth}>A problem has occured</Text>
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
              <CustomButton onPress={sendCodeAgain} text="Send code again" />
              <CustomButton
                text="Login with password"
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
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        {/* Text Section */}
        <View style={styles.textWrapper}>
          <Text style={styles.normalText}>
            Please enter the next 4 digit code sent.
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

        {/* <RepeatablePage>Test</RepeatablePage> */}
      </View>
    </ScrollView>
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
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
  },
  boldText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#343a59',
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
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
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#343a59',
  },
  disableText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#aeb1b5',
  },
  codeInputContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 20,
  },
  codeInput: {
    width: 40,
    height: 60,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
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
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 7,
  },
});

export default PhoneVerificationScreen;
