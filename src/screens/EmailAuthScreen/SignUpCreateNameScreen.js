import {
  View,
  Text,
  StyleSheet,
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
import {getLanguage2, getFontFam} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

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
    const fetchLangData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        setLang(screenLang);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchLangData();
  }, []);

  const onSignIn = async () => {
    if (lastname.trim() === '') {
      Alert.alert('Failed', lang.screen_notExist.field_name.emptyLastName);
    } else if (name.trim() === '') {
      Alert.alert('Failed', lang.screen_notExist.field_name.emptyName);
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
            fontFamily: getFontFam() + 'Medium',
            fontSize: 13,
            color: '#343a59',
            marginBottom: -5,
          }}>
          {lang && lang.screen_notExist && lang.screen_notExist.field_name
            ? lang.screen_notExist.field_name.label
            : ''}
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
              fontFamily: getFontFam() + 'Medium',
              fontSize: 13,
              color: '#343a59',
              borderBottomColor: '#cccccc',
              borderBottomWidth: 1,
              paddingHorizontal: 5,
              paddingBottom: -10,
              flex: 1,
            }}
            placeholder={
              lang && lang.screen_notExist && lang.screen_notExist.field_name
                ? lang.screen_notExist.field_name.placeholder_last
                : ''
            }
            placeholderTextColor="grey"
            value={lastname}
            onChangeText={setLastname}
            autoCapitalize="words"
          />

          {/* Name */}
          <TextInput
            style={{
              fontFamily: getFontFam() + 'Medium',
              fontSize: 13,
              color: '#343a59',
              borderBottomColor: '#cccccc',
              borderBottomWidth: 1,
              paddingHorizontal: 5,
              paddingBottom: -10,
              flex: 1,
            }}
            placeholder={
              lang && lang.screen_notExist && lang.screen_notExist.field_name
                ? lang.screen_notExist.field_name.placeholder_first
                : ''
            }
            placeholderTextColor="grey"
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
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 5,
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
