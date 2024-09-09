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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomButton from '../../components/CustomButton/';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const emailAuth = async () => {
    try {
      const response = await fetch(
        `${URL_API}&act=login-02-email&email=${dataUser.email}`,
      );
      const responseData = await response.text(); // Convert response to JSON

      console.log({responseDataAuth: responseData});

      if (responseData.data === 'false') {
        Alert.alert('Failed', lang.screen_emailVerification.notif.invalidEmail);
      } else {
        console.log('Kode dikirim boy');
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

      const request = await fetch(
        `${URL_API}&act=login-06-joinAndAccount&email=${email}&pin=${pin}&firstname=${firstname}&lastname=${lastname}&gender=${gender}&mobile=${phoneNumber}&mobilecode=${mobileCode}&countrycode=${countryCode}&country=${mobileCode}&region=${region}&age=${age}&recommand=${recommand}&os=${os}`,
      );
      const response = await request.json();
      console.log(`Data SignUp response: ${JSON.stringify(response)}`);

      if (response.data === 'ok') {
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
      const request = await fetch(
        `${URL_API}&act=login-checker&email=${email}&pin=${pin}`,
      );
      const response = await request.text();

      if (response === 'OK') {
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
    const getAuthCode = verificationCode.join('');
    // Check Email & Auth Code Relational
    try {
      const responseAuth = await fetch(
        `${URL_API}&act=login-03-email&email=${dataUser.email}&code=${getAuthCode}`,
      );
      const responseAuthData = await responseAuth.json();

      console.log(JSON.stringify(responseAuthData));

      if (responseAuthData.data === 'false') {
        Alert.alert('Failed', lang.screen_emailVerification.notif.wrongCode);
      } else {
        addNewMember();
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error during Check Auth Code:', error);
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

  // ########## Countdown ##########
  const Countdown = () => {
    const [seconds, setSeconds] = useState(599); // Duration
    // const [seconds, setSeconds] = useState(5);

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
            lang.screen_emailVerification &&
            lang.screen_emailVerification.timer
              ? lang.screen_emailVerification.timer.on
              : ''}{' '}
            {formattedMinutes}:{formattedSeconds}
          </Text>
        ) : (
          <Pressable onPress={onProblem} style={styles.resetPassword}>
            <Text style={styles.emailAuth}>
              {lang &&
              lang.screen_emailVerification &&
              lang.screen_emailVerification.timer
                ? lang.screen_emailVerification.timer.off
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
