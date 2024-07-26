import {Alert, Platform} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
// import messaging from '@react-native-firebase/messaging';
import * as RNLocalize from 'react-native-localize';

// Endpoint API
export const authcode = process.env.GATEWAY_AUTH_CODE;
const gateway = process.env.GATEWAY;
export const URL_API = gateway + authcode;
export const URL_API_NODEJS = process.env.GATEWAY_NODEJS;

const funcTransaction = async (
  nameTransaction,
  act,
  member,
  currency,
  daysbefore,
  startwith,
) => {
  try {
    const request = await fetch(
      `${URL_API}&act=${act}&startwith=${startwith}&member=${member}&currency=${currency}&daysbefore=${daysbefore}`,
    );
    const response = await request.json();
    return response.data;
  } catch (err) {
    console.log(`Failed get ${nameTransaction}: ${err}`);
    Alert.alert('', `Failed get ${nameTransaction}: ${err}`);
    crashlytics().recordError(new Error(err));
    crashlytics().log(err);
  }
};

export const funcTotalHistory = async (
  nameTransaction = 'totalHistory',
  act = 'app4200-05',
  member,
  currency,
  daysbefore,
  startwith = 0,
) => {
  return await funcTransaction(
    nameTransaction,
    act,
    member,
    currency,
    daysbefore,
    startwith,
  );
};

export const funcTransferHistory = async (
  nameTransaction = 'transferHistory',
  act = 'app4200-06',
  member,
  currency,
  daysbefore,
  startwith = 0,
) => {
  return await funcTransaction(
    nameTransaction,
    act,
    member,
    currency,
    daysbefore,
    startwith,
  );
};

export const funcReceivedDetails = async (
  nameTransaction = 'receivedDetails',
  act = 'app4200-01',
  member,
  currency,
  daysbefore,
  startwith = 0,
) => {
  return await funcTransaction(
    nameTransaction,
    act,
    member,
    currency,
    daysbefore,
    startwith,
  );
};

export const funcTransitionHistory = async (
  nameTransaction = 'transitionHistory',
  act = 'app4200-03',
  member,
  currency,
  daysbefore,
  startwith = 0,
) => {
  return await funcTransaction(
    nameTransaction,
    act,
    member,
    currency,
    daysbefore,
    startwith,
  );
};

// Load button see more if cliok
const fetchDetailTransaction = async (
  routeSwipe,
  totalData,
  setTotalData,
  member,
  currency,
  days,
  setSeeMore,
  lastPosition,
  setLastPosition,
) => {
  setLastPosition(lastPosition + 20000);
  console.log(totalData.length);
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
        setSeeMore(false);
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
        setSeeMore(false);
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
        setSeeMore(false);
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
        setSeeMore(false);
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
  setSeeMore,
  lastPosition,
  setLastPosition,
) => {
  console.log(totalData);
  fetchDetailTransaction(
    routeSwipe,
    totalData,
    setTotalData,
    member,
    currency,
    days,
    setSeeMore,
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
    return Platform.OS === 'android' ? 11 : 13;
  } else if (type === 'body') {
    return Platform.OS === 'android' ? 13 : 15;
  } else if (type === 'subtitle') {
    return Platform.OS === 'android' ? 16 : 18;
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
