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
import CustomButton from '../../components/CustomButton/';

// ########## Send Code (Refresh Page) ##########
const RepeatablePage = () => {
  const [count, setCount] = useState(0);

  const resetPage = () => {
    setCount(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Page Content</Text>
      <Text style={styles.text}>Count: {count}</Text>
      <Button title="Increment Count" onPress={() => setCount(count + 1)} />
      <Button title="Reset Page" onPress={resetPage} />
    </View>
  );
};

// ########## Main Function ##########
const EmailVerificationScreen = () => {
  const [email, setEmail] = useState('');
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
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);

  let ScreenHeight = Dimensions.get('window').height;

  const onBack = () => {
    navigation.navigate('SignIn');
  };

  const onSignIn = () => {
    console.warn('Go to next page');
  };

  const onSignInDisabled = () => {
    Alert.alert('Peringatan', 'Tolong lengkapi kode verifikasi');
  };

  const onProblem = () => {
    setModalVisible(!modalVisible);
  };

  const {dataEmail} = route.params;

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
  // ########## Input Verification Code ##########

  // ########## Countdown ##########
  const Countdown = () => {
    // const [seconds, setSeconds] = useState(599); // Duration
    const [seconds, setSeconds] = useState(599);

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
  // ########## Countdown ##########

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
              <CustomButton text="Send code again" />
              <CustomButton
                text="Login with password"
                onPress={onBack}
                type="SECONDARY"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };
  // ########## Help Modal ##########

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        {/* Text Section */}
        <View style={styles.textWrapper}>
          <Text style={styles.normalText}>
            Enter the 6 digit verification code
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
    fontSize: 15,
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
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#343a59',
    borderBottomWidth: 2,
    borderRadius: 5,
    borderColor: '#cdced4',
    marginHorizontal: 5,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
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

export default EmailVerificationScreen;
