import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {getLanguage2, getFontFam, fontSize} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import {useAuth} from '../../context/AuthContext/AuthContext';
import ButtonComplete from '../../components/ButtonComplete/ButtonComplete';

// ########## Main Function ##########
const SuccessCloseMembership = () => {
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [lang, setLang] = useState({});
  const {logout} = useAuth();

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
  }, []);

  const onSubmit = async () => {
    logout();

    // Go to SignIn Screen
    navigation.reset({
      index: 0,
      routes: [{name: 'SignIn'}],
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        <View>
          {/* Content Section */}
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}>
            <Text
              style={[
                styles.normalText,
                {
                  textAlign: 'center',
                  fontFamily: getFontFam() + 'Bold',
                  fontSize: fontSize('subtitle'),
                },
              ]}>
              {lang &&
              lang.screen_setting &&
              lang.screen_setting.close &&
              lang.screen_setting.close.desc
                ? lang.screen_setting.close.desc.success_title
                : ''}
            </Text>
            <Text style={[styles.normalText, {textAlign: 'center'}]}>
              {lang &&
              lang.screen_setting &&
              lang.screen_setting.close &&
              lang.screen_setting.close.desc
                ? lang.screen_setting.close.desc.success_desc
                : ''}
            </Text>
          </View>

          {/* Bottom Section*/}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1}}>
            <ButtonComplete onClick={onSubmit} />
          </KeyboardAvoidingView>
        </View>
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
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
  normalText: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
    marginTop: 10,
  },
  bottomSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
  },
});

export default SuccessCloseMembership;
