import {Alert, Platform, View} from 'react-native';
import CryptoJS from 'crypto-js';
import crashlytics from '@react-native-firebase/crashlytics';
// import messaging from '@react-native-firebase/messaging';
import * as RNLocalize from 'react-native-localize';
import React from 'react';
import CustomInput from './src/components/CustomInput';

// Endpoint API
export const authcode = process.env.GATEWAY_AUTH_CODE;
const gateway = process.env.GATEWAY;
export const URL_API = gateway + authcode;
export const URL_API_NODEJS = process.env.GATEWAY_NODEJS;

export const listTransactionsHistory = async (
  nameList,
  act,
  member,
  currency,
  daysbefore,
  startwith = 0,
) => {
  try {
    const body = {
      startwith,
      member,
      currency,
      daysbefore,
    };

    const result = await gatewayNodeJS(act, 'POST', body);
    console.log(`Success load data list transaction: ${nameList}`);
    return result.data;
  } catch (err) {
    console.log(`Failed get ${nameList}: ${err}`);
    crashlytics().recordError(new Error(err));
    crashlytics().log(err);
  }
};

// Load button see more if click
const loadDetailTransaction = async (
  routeSwipe,
  totalData,
  setTotalData,
  member,
  currency,
  days,
  setSeeBtnMore,
  lastPosition,
  setLastPosition,
) => {
  setLastPosition(lastPosition + 20000);

  switch (routeSwipe) {
    case 'totalHistory':
      const resultTotalHistory = await funcTotalHistory(
        undefined,
        undefined,
        member,
        currency,
        days,
        totalData.length,
      );

      if (resultTotalHistory.length == 0) {
        setSeeBtnMore(false);
      }

      setTotalData(prevData => [...prevData, ...resultTotalHistory]);

      break;
    case 'transferHistory':
      const resultTransferHistory = await funcTransferHistory(
        undefined,
        undefined,
        member,
        currency,
        days,
        totalData.length,
      );

      if (resultTransferHistory.length == 0) {
        setSeeBtnMore(false);
      }

      setTotalData(prevData => [...prevData, ...resultTransferHistory]);

      break;
    case 'receivedDetails':
      const resultReceivedDetails = await funcReceivedDetails(
        undefined,
        undefined,
        member,
        currency,
        days,
        totalData.length,
      );

      if (resultReceivedDetails.length == 0) {
        setSeeBtnMore(false);
      }

      setTotalData(prevData => [...prevData, ...resultReceivedDetails]);

      break;
    case 'transitionHistory':
      const resultTransitionHistory = await funcTransitionHistory(
        undefined,
        undefined,
        member,
        currency,
        days,
        totalData.length,
      );

      if (resultTransitionHistory.length == 0) {
        setSeeBtnMore(false);
      }

      setTotalData(prevData => [...prevData, ...resultTransitionHistory]);

      break;
    default:
      Alert.alert(
        '',
        lang && lang.global_error && lang.global_error.error
          ? lang.global_error.error
          : '',
      );
      break;
  }
};

export const loadMore = (
  routeSwipe,
  totalData,
  setTotalData,
  member,
  currency,
  days,
  setSeeBtnMore,
  lastPosition,
  setLastPosition,
) => {
  loadDetailTransaction(
    routeSwipe,
    totalData,
    setTotalData,
    member,
    currency,
    days,
    setSeeBtnMore,
    lastPosition,
    setLastPosition,
  );
};

// Get Language
export const getLanguage = async (lang, screenName) => {
  try {
    let langData;

    switch (lang) {
      case 'id':
        langData = require('./languages/id.json');
        break;
      case 'en':
        langData = require('./languages/en.json');
        break;
      case 'ko':
        langData = require('./languages/ko.json');
        break;
      case 'zh':
        langData = require('./languages/zh.json');
        break;
      default:
        langData = require('./languages/en.json');
        break;
    }

    const screenLangData = langData ? langData[screenName] : null;
    return screenLangData;
  } catch (err) {
    console.error('Error retrieving Get Language from AsyncStorage: ', err);
    return null;
  }
};

export const getLanguage2 = async lang => {
  try {
    const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
    let langData;
    // console.log('Test', deviceLanguage)

    switch (deviceLanguage) {
      case 'id':
        langData = require('./languages/id.json');
        break;
      case 'en':
        langData = require('./languages/en.json');
        break;
      case 'ko':
        langData = require('./languages/ko.json');
        break;
      case 'zh':
        langData = require('./languages/zh.json');
        break;
      default:
        langData = require('./languages/en.json');
        break;
    }

    return langData;
  } catch (err) {
    console.error('Error retrieving Get Language from AsyncStorage: ', err);
    crashlytics().recordError(new Error(err));
    crashlytics().log(err);
    return null;
  }
};

export const getFCMToken = async callback => {
  //   const fcmToken = await messaging().getToken();
  //   if (fcmToken) {
  //     callback(fcmToken);
  //   } else {
  //     console.log('Failed', 'No token received');
  //   }
};

export const getFontFam = () => {
  if (Platform.OS === 'android') {
    return 'Roboto-';
  } else if (Platform.OS === 'ios') {
    return 'AppleSDGothicNeo-';
  } else {
    return 'Roboto-';
  }
};

export const fontSize = type => {
  if (type === 'note') {
    return Platform.OS === 'android' ? 13 : 14;
  } else if (type === 'body') {
    return Platform.OS === 'android' ? 16 : 16;
  } else if (type === 'subtitle') {
    return Platform.OS === 'android' ? 19 : 19;
  } else if (type === 'title') {
    return Platform.OS === 'android' ? 22 : 26;
  }
};

export const refreshBalances = async member => {
  try {
    if (member) {
      const body = {
        member,
      };

      const result = await gatewayNodeJS('refreshBalances', 'POST', body);
      const count = result.data[0].count;
      console.log(`Result refreshBalances: ${count}`);
    }
  } catch (error) {
    crashlytics().recordError(new Error(error));
    crashlytics().log(error);
  }
};

export const gatewayNodeJS = async (route, method = 'GET', body = {}) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authcode}`,
      },
    };

    // Hanya tambahkan body jika metode bukan GET
    if (method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(body);
    }

    const request = await fetch(`${URL_API_NODEJS}/${route}`, options);
    const response = await request.json();
    return response;
  } catch (error) {
    console.log(`Error gateway NodeJS: ${error}`);
    Alert.alert(lang.global_error.network_busy);
    crashlytics().recordError(new Error(error));
    crashlytics().log(error);
  }
};

export const sha256Encrypt = async text => {
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
};

export const BottomComponentFixer = ({count}) => {
  return (
    <>
      {/* Render `View` berisi `CustomInput` tak terlihat sebanyak `count` */}
      {Array.from({length: count}).map((_, index) => (
        <View key={index} style={{opacity: 0, pointerEvents: 'none'}}>
          <CustomInput
            label={'fixer'}
            placeholder={'fixer'}
            value={'fixer'}
            setValue={() => {}}
            isPassword={false}
          />
        </View>
      ))}

      {/* Flex Spacer untuk menjaga komponen lain tetap di bawah */}
      <View style={{flex: 1}} />
    </>
  );
};
