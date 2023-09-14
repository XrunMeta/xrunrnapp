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
import React, {useState} from 'react';
import CustomInput from '../../components/CustomInput/';
import ButtonBack from '../../components/ButtonBack/';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext/AuthContext';

const SignInScreen = () => {
  const {isLoggedIn, login} = useAuth();
  const [email, setEmail] = useState('ggg@hhh.com');
  const [password, setPassword] = useState('111!!!aaaAAA');
  const [isEmailValid, setIsEmailValid] = useState(true);

  const navigation = useNavigation();

  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', 'Please insert your Email');
    } else if (!isValidEmail(email)) {
      Alert.alert('Error', 'Invalid email address');
    } else if (password.trim() === '') {
      Alert.alert('Error', 'Please insert your Password');
    } else {
      try {
        const response = await fetch(
          `https://app.xrun.run/gateway.php?act=login-checker&email=${email}&pin=${password}`,
        );
        const data = await response.text();

        if (data === 'OK') {
          login();
          navigation.navigate('Tabs');
          // Simpan session dan navigasi ke halaman selanjutnya
        } else {
          Alert.alert('Error', 'Invalid Email & Password');
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'An error occurred while logging in');
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

  const onEmailAuth = () => {
    navigation.navigate('EmailAuth');
  };

  const onBack = () => {
    navigation.navigate('First');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Login Via E-mail</Text>
          <Text style={styles.subTitle}>Let's Login Quickly "Catch Me"</Text>
        </View>

        <CustomInput
          label="Email"
          placeholder="xrun@xrun.run"
          value={email}
          // setValue={setEmail}
          setValue={onEmailChange}
          isPassword={false}
        />
        {isEmailValid ? null : (
          <Text
            style={{
              alignSelf: 'flex-start',
              marginLeft: 25,
              color: 'red',
            }}>
            Your Email is not Valid
          </Text>
        )}

        <CustomInput
          label="Password"
          placeholder="Password"
          value={password}
          setValue={setPassword}
          secureTextEntry
          isPassword={true}
        />

        <View style={[styles.bottomSection]}>
          <View style={styles.additionalLogin}>
            <Text style={styles.normalText}>Have you tried </Text>
            <Pressable onPress={onEmailAuth} style={styles.resetPassword}>
              <Text style={styles.emailAuth}>BY EMAIL AUTHCODE</Text>
            </Pressable>
          </View>
          <Pressable onPress={onSignIn} style={styles.buttonSignIn}>
            <Image
              source={require('../../../assets/images/icon_next.png')}
              resizeMode="contain"
              style={styles.buttonSignInImage}
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
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    color: '#343a59',
  },
  subTitle: {
    fontFamily: 'Poppins-Medium',
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
  normalText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#343a59',
  },
  emailAuth: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#343a59',
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

export default SignInScreen;
