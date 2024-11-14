import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {
  getFontFam,
  fontSize,
  getLanguage2,
  URL_API_NODEJS,
  authcode,
} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import {useNavigation} from '@react-navigation/native';

const KeyDownload = () => {
  const [lang, setLang] = useState('');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Get Language Data
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const userData = await AsyncStorage.getItem('userData');

        const screenLang = await getLanguage2(currentLanguage);
        const getUserData = JSON.parse(userData);

        // Set your language state
        setLang(screenLang);
        setUserData(getUserData);
      } catch (err) {
        console.error('Error in fetchData:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        navigation.replace('Home');
      }
    };

    fetchData();
  }, []);

  const onBack = () => {
    navigation.replace('WalletHome');
  };

  const checkBoxToggle = () => {
    setIsChecked(!isChecked);
    console.log(!isChecked);
  };

  const onSubmit = async () => {
    try {
      setIsDisable(true);
      setIsChecked(!isChecked);

      const request = await fetch(`${URL_API_NODEJS}/check-02-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          email: userData?.email,
        }),
      });
      const response = await request.json();
      console.log('Email authcode sended ' + JSON.stringify(response));

      if (response?.data[0]?.status == true) {
        // navigation.replace('KeyDownloadAuth', {
        //   dataEmail: userData?.email,
        //   member: userData?.member,
        // });
        navigation.replace('KeyShowDownload');
      } else {
        Alert.alert(
          'Failed',
          'Failed submit download key agreement, try again later',
        );
      }
    } catch (error) {
      Alert.alert('', 'Error submit download key agreement');
      console.error('Error submit download key agreement:', error);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      navigation.replace('Home');
    } finally {
      setIsDisable(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading */}
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size={'large'} color={'#fff'} />
          <Text
            style={{
              color: '#fff',
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              marginTop: 10,
            }}>
            Loading...
          </Text>
        </View>
      )}

      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_keyDownload
              ? lang.screen_keyDownload.title
              : ''}
          </Text>
        </View>
      </View>

      {/* Desc */}
      <ScrollView style={{paddingHorizontal: 20, paddingVertical: 10, flex: 1}}>
        <Text style={styles.text}>
          {lang && lang.screen_keyDownload ? lang.screen_keyDownload.desc : ''}
        </Text>
      </ScrollView>

      {/* Verify */}
      <View
        style={{
          paddingHorizontal: 20,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-center',
            marginHorizontal: 5,
            marginBottom: 10,
            flex: 1,
          }}
          onPress={checkBoxToggle}>
          <View
            style={[
              styles.checkbox,
              isChecked ? styles.checkedBox : styles.uncheckedBox,
            ]}>
            {isChecked && <Text style={styles.checkMark}>✔</Text>}
          </View>
          <Text
            style={[styles.text, {flexWrap: 'wrap', flexShrink: 1}]}
            onPress={checkBoxToggle}>
            {lang && lang.screen_keyDownload
              ? lang.screen_keyDownload.verify
              : ''}
          </Text>
        </TouchableOpacity>
        <Pressable
          onPress={onSubmit}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-end',
            flexDirection: 'column-reverse',
            height: 100,
            justifyContent: 'center',
          }}
          disabled={!isChecked && !isDisable}>
          <Image
            source={
              !isChecked && !isDisable
                ? require('../../../assets/images/icon_nextDisable.png')
                : require('../../../assets/images/icon_next.png')
            }
            resizeMode="contain"
            style={{height: 80, width: 80}}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default KeyDownload;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  containerCard: {
    height: 260,
  },
  containerTable: {
    flex: 1,
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
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: getFontFam() + 'Regular',
    textAlign: 'left',
    fontSize: fontSize('body'),
    lineHeight: 19,
    color: '#343a59',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#343a59',
    borderColor: '#343a59',
  },
  uncheckedBox: {
    backgroundColor: 'transparent',
    borderColor: '#343a59',
  },
  checkMark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
