import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../../components/CustomInput';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  gatewayNodeJS,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';
import IOSButtonFixer from '../../components/IOSButtonFixer';

const RegistRecommendScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  const [recID, setRecID] = useState('');
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});
  const [isDisable, setIsDisable] = useState(false);

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        // Get User Data from Asyncstorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);
        setUserData(astorJsonData);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchData();
  }, []);

  const onSaveChange = () => {
    if (recID == '') {
      Alert.alert(
        lang && lang.alert ? lang.alert.title.fail : '',
        lang && lang.screen_recommend && lang.screen_recommend.add_recommend
          ? lang.screen_recommend.add_recommend.placeholder
          : '',
      );
    } else {
      const registRecommend = async () => {
        try {
          setIsDisable(true);
          const body = {
            member: userData.member,
            email: recID,
          };

          const result = await gatewayNodeJS('app7410-01', 'POST', body);
          const data = result.data[0].data;

          if (data.data === 'no id') {
            Alert.alert(
              lang && lang.alert ? lang.alert.title.fail : '',
              lang &&
                lang.screen_recommend &&
                lang.screen_recommend.add_recommend
                ? lang.screen_recommend.add_recommend.not_found
                : '',
            );

            setRecID('');
          } else if (data.data === 'ok') {
            Alert.alert(
              lang && lang.alert ? lang.alert.title.success : '',
              lang &&
                lang.screen_recommend &&
                lang.screen_recommend.add_recommend
                ? lang.screen_recommend.add_recommend.recommended
                : '',
            );

            navigation.replace('InfoHome');
          } else {
            Alert.alert(
              lang && lang.alert ? lang.alert.title.warning : '',
              lang &&
                lang.screen_recommend &&
                lang.screen_recommend.add_recommend
                ? lang.screen_recommend.add_recommend.already
                : '',
            );

            navigation.replace('InfoHome');
          }
        } catch (error) {
          console.error('Terjadi kesalahan:', error.message);
          crashlytics().recordError(new Error(error));
          crashlytics().log(error);
        } finally {
          setIsDisable(false);
        }
      };

      registRecommend();
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        {/* Title */}
        <View style={{flexDirection: 'row'}}>
          <View style={{position: 'absolute', zIndex: 1}}>
            <ButtonBack onClick={handleBack} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              {lang && lang.screen_recommend ? lang.screen_recommend.title : ''}
            </Text>
          </View>
        </View>

        <CustomInput
          label={
            lang && lang.screen_recommend && lang.screen_recommend.add_recommend
              ? lang.screen_recommend.add_recommend.label
              : ''
          }
          placeholder={
            lang && lang.screen_recommend && lang.screen_recommend.add_recommend
              ? lang.screen_recommend.add_recommend.placeholder
              : ''
          }
          value={recID}
          setValue={setRecID}
        />

        <IOSButtonFixer count={5} />

  
          <ButtonNext
            onClick={onSaveChange}
            isDisabled={!isDisable && recID == ''}
          />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
  },
  titleWrapper: {
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
});

export default RegistRecommendScreen;
