import {Alert, Platform} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
// import messaging from '@react-native-firebase/messaging';
import * as RNLocalize from 'react-native-localize';

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
    const request = await fetch(
      `${URL_API}&act=${act}&startwith=${startwith}&member=${member}&currency=${currency}&daysbefore=${daysbefore}`,
    );
    const response = await request.json();
    console.log(`Success load data list transaction: ${nameList}`);
    return response.data;
  } catch (err) {
    console.log(`Failed get ${nameList}: ${err}`);
    Alert.alert('', `Failed get ${nameList}`);
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
      const fetchData = await fetch(
        `${URL_API}&act=refreshBalances&member=${member}`,
      );
      const result = await fetchData.json();
      console.log(`Result refreshBalances: ${result}`);
    }
  } catch (err) {
    crashlytics().recordError(new Error(err));
    crashlytics().log(err);
  }
};
