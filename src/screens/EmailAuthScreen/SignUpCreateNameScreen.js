import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

const SignUpCreateName = () => {
  const route = useRoute();
  const [lang, setLang] = useState({});
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const {mobile, mobilecode, countrycode, email, pin} = route.params;

  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;

  const onBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage();
  }, []);

  const onSignIn = async () => {
    if (lastname.trim() === '') {
      Alert.alert('Failed', 'Please fill your Last name');
    } else if (name.trim() === '') {
      Alert.alert('Failed', 'Please fill your name');
    } else {
      navigation.navigate('SignupCreateGender', {
        mobile: mobile,
        mobilecode: mobilecode,
        countrycode: countrycode,
        email: email,
        pin: pin,
        firstname: name,
        lastname: lastname,
      });

      console.log(`
        Data dikirim (Create Name): 
          Mobile  => ${mobile}
          MobCode => ${mobilecode}
          CouCode => ${countrycode}
          Email   => ${email}
          Pin     => ${pin}
          First   => ${name}
          Last    => ${lastname} 
      `);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
      <View style={[styles.root, {height: ScreenHeight}]}>
        <ButtonBack onClick={onBack} />

        <View
          style={{
            width: '100%',
            paddingHorizontal: 25,
            marginTop: 30,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 13,
              color: '#343a59',
              marginBottom: -5,
            }}>
            What is your name?
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              gap: 25,
            }}>
            {/* Last Name */}
            <TextInput
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 13,
                color: '#343a59',
                borderBottomColor: '#cccccc',
                borderBottomWidth: 1,
                paddingHorizontal: 5,
                paddingBottom: -10,
                flex: 1,
              }}
              placeholder="Last name"
              value={lastname}
              onChangeText={setLastname}
              autoCapitalize="words"
            />

            {/* Name */}
            <TextInput
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 13,
                color: '#343a59',
                borderBottomColor: '#cccccc',
                borderBottomWidth: 1,
                paddingHorizontal: 5,
                paddingBottom: -10,
                flex: 1,
              }}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={[styles.bottomSection]}>
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
  bottomSection: {
    padding: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    width: '100%',
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

export default SignUpCreateName;
