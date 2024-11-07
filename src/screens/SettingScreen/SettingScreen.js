import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  URL_API,
  gatewayNodeJS,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const SettingScreen = () => {
  const {logout} = useAuth();
  const [lang, setLang] = useState('');

  const navigation = useNavigation();

  const [member, setMember] = useState(0);
  const [statusOtherChain, setStatusOtherChain] = useState('off');
  const [isStatusOtherChains, setIsStatusOtherChains] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        const userData = await AsyncStorage.getItem('userData');
        const dataMember = JSON.parse(userData);
        setMember(dataMember.member);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error fetching user data: ', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (member) {
      const statusOtherChain = async () => {
        const body = {
          member,
        };

        const result = await gatewayNodeJS('showOtherChains', 'POST', body);
        const status = result.data[0].status;
        console.log(`Status show other chains: ${status}`);

        setStatusOtherChain(status.toLowerCase());
        setIsStatusOtherChains(status.toLowerCase() === 'on' ? true : false);
        setIsLoading(false);
      };

      statusOtherChain();
    }
  }, [member]);

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  const onDevice = () => {
    // navigation.navigate('CommonProblem');
  };

  const onLogout = () => {
    Alert.alert(
      `${lang && lang.alert.title ? lang.alert.title.warning : ''}`,
      `${
        lang && lang && lang.screen_setting.button.logout
          ? lang.screen_setting.button.logout
          : ''
      }`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            logout();
            // Go to SignIn Screen
            navigation.replace('SignIn');
          },
        },
      ],
    );
  };

  const onClose = () => {
    navigation.navigate('CloseMember');
  };

  const changeStatusOtherChains = () => {
    // setIsLoading(true);

    if (isStatusOtherChains) {
      setStatusOtherChain('off');
    } else {
      setStatusOtherChain('on');
    }

    setIsStatusOtherChains(prevIsStatusOtherChains => !prevIsStatusOtherChains);

    // Save status show other chain
    const saveStatusOtherChain = async () => {
      console.log('sip');
      const body = {
        member,
        status: isStatusOtherChains ? 'off' : 'on',
      };

      const result = await gatewayNodeJS(
        'saveStatusShowOtherChains',
        'POST',
        body,
      );
      const status = result.data[0].status;

      console.log(status);

      if (status === 'success') {
        setIsLoading(false);
      } else {
        console.log(`Failed save show other chains`);
        setIsLoading(false);
      }
    };

    saveStatusOtherChain();
  };

  return (
    <SafeAreaView style={styles.root}>
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
            {lang && lang.screen_setting.title ? lang.screen_setting.title : ''}
          </Text>
        </View>
      </View>

      {/* List Button */}
      <View
        style={{
          flex: 1,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Basic Setting */}
          {/* <Text
            style={{
              color: 'grey',
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              marginLeft: 20,
              marginTop: 15,
            }}>
            {lang && lang ? lang.screen_setting.category.basic.cat : ''}
          </Text>
          <ButtonList
            label={
              lang && lang ? lang.screen_setting.category.basic.device : ''
            }
            onPress={onDevice}
          /> */}

          {/* Account Setting */}
          <Text
            style={{
              color: 'grey',
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              marginLeft: 20,
              marginTop: 20,
            }}>
            {lang && lang ? lang.screen_setting.category.account.cat : ''}
          </Text>
          {/* <ButtonList
            label={
              lang && lang ? lang.screen_setting.category.account.logout : ''
            }
            onPress={onLogout}
          /> */}
          <ButtonList
            label={
              lang && lang ? lang.screen_setting.category.account.close : ''
            }
            onPress={onClose}
          />
          {/* <ButtonList
            label={lang && lang ? lang.screen_setting.other_chain.info : ''}
            isHaveSubText
            isStatusOtherChains={isStatusOtherChains}
            statusOtherChains={statusOtherChain}
            changeStatusOtherChains={changeStatusOtherChains}
            onPress={changeStatusOtherChains}
          /> */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2f5f6',
  },
  titleWrapper: {
    paddingVertical: 10,
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
});
