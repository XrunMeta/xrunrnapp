import {Alert, Platform, View} from 'react-native';
import CryptoJS from 'crypto-js';
import crashlytics from '@react-native-firebase/crashlytics';
// import messaging from '@react-native-firebase/messaging';
import * as RNLocalize from 'react-native-localize';
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
    return Platform.OS === 'android' ? 9 : 11;
  } else if (type === 'body') {
    return Platform.OS === 'android' ? 12 : 14;
  } else if (type === 'subtitle') {
    return Platform.OS === 'android' ? 15 : 17;
  } else if (type === 'title') {
    return Platform.OS === 'android' ? 18 : 20;
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

      // const request = await fetch(`${URL_API_NODEJS}/refreshBalancesNewRPC`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${authcode}`,
      //   },
      //   body: JSON.stringify({
      //     member,
      //   }),
      // });
      // const result = await request.json();
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

export const saveLogsDB = async (
  logcode,
  member,
  title = null,
  contents = null,
) => {
  try {
    const request = await fetch(`${URL_API_NODEJS}/addLogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authcode}`,
      },
      body: JSON.stringify({
        logcode,
        member,
        title,
        contents,
        os: Platform.OS == 'android' ? 3112 : 3113,
      }),
    });
    const data = await request.json();

    if (data?.data[0]?.affectedRows == 1) {
      console.log(
        `DB Logs saved -> ${logcode} - ${member} - ${title} - [${Platform.OS}] ${contents}`,
      );
      return true;
    } else {
      console.log(
        `DB Logs failed saved -> ${logcode} - ${member} - ${title} - [${Platform.OS}] ${contents}`,
      );
      return false;
    }
  } catch (error) {
    console.log(
      `DB Logs error saved -> ${logcode} - ${member} - ${title} - [${Platform.OS}] ${contents} - ${err}`,
    );
    crashlytics().recordError(new Error(error));
    crashlytics().log(error);
  }
};

export const formatISODate = isoDateString => {
  return isoDateString.replace('T', ' ').split('.')[0];
};

export const decrypt = encrypted => {
  const key = process.env.KEY;
  const iv = process.env.IV;

  // Konversi base64 ke WordArray
  const encryptedWords = CryptoJS.enc.Base64.parse(encrypted);

  const decrypted = CryptoJS.AES.decrypt(
    {ciphertext: encryptedWords},
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
};

const blacklistedPassword = [
  'password',
  '123456',
  '123456789',
  'qwerty',
  '12345678',
  '111111',
  '123123',
  'abc123',
  'password1',
  '12345',
  '1234567',
  'letmein',
  'welcome',
  'admin',
  'passw0rd',
  '1234',
  '000000',
  '1q2w3e',
  '654321',
  'superman',
  'sunshine',
  'monkey',
  'football',
  'princess',
  'charlie',
  'aa123456',
  'dragon',
  'mustang',
  'baseball',
  'trustno1',
  'iloveyou',
  'login',
  'flower',
  'hello',
  'freedom',
  'starwars',
  'whatever',
  'hottie',
  'michael',
  'batman',
  'ninja',
  'qazwsx',
  'qwertyuiop',
  'p@ssw0rd',
  '123qwe',
  'mynoob',
  'secret',
  '123abc',
  'killer',
  'master',
  'password123',
  'zaq12wsx',
  '555555',
  '1qaz2wsx',
  'qwerty123',
  'asdfgh',
  'zaq12wsxcde',
  'google',
  'loveme',
  'jordan23',
  'maggie',
  'cookie',
  'shadow',
  'whatever123',
  'summer',
  'super123',
  'newyork',
  'samsung',
  'michelle',
  'marilyn',
  'purple',
  'secure',
  'trust',
  'aaron431',
  'viking',
  'zxcvbnm',
  'angel',
  'cheese',
  'coffee',
  'school',
  'password!',
  'america',
  'canada',
  'batman123',
  'babygirl',
  'iloveyou2',
  '123123123',
  'computer',
  'pass123',
  'golden',
  'iloveme',
  'skywalker',
  'johnny',
  'harley',
  'ferrari',
  'mercedes',
  'paris',
  'disney',
  'red123',
  'soccer',
  'heather',
  'ginger',
  'peanut',
  'taylor',
  'Jakarta',
  'Seoul',
  'London',
  'Bali',
  'Busan',
  'Manchester',
  'Surabaya',
  'Gyeongju',
  'Birmingham',
  'Yogyakarta',
  'Jeju',
  'Cardiff',
  'Bandung',
  'Incheon',
  'Brighton',
  'Liverpool',
  'Medan',
  'Daejeon',
  'KualaLumpur',
  'Pusan',
  'Jeonju',
  'Nottingham',
  'Kyoto',
  'Denpasar',
  'Tokyo',
  'Merseyside',
  'Pekanbaru',
  'Suwon',
  'Cork',
  'Stoke-on-Trent',
  'Jambi',
  'Daegu',
  'Semarang',
  'Gwangju',
  'Bristol',
  'Sapporo',
  'Edinburgh',
  'Kochi',
  'Bournemouth',
  'Fukuoka',
  'Chungju',
  'Vancouver',
  'Halifax',
  'Cheonan',
  'Paju',
  'Sunderland',
  'Tangerang',
  'Songdo',
  'Gifu',
  'Islington',
  'Busan',
  'KualaLumpur',
  'Kobe',
  'Seongnam',
  'Aberdeen',
  'Osaka',
  'Tbilisi',
  'HongKong',
  'Moscow',
  'Paris',
  'LasVegas',
  'Copenhagen',
  'Yokohama',
  'Taichung',
  'Belfast',
  'Sydney',
  'Milan',
  'Berlin',
  'Rome',
  'Barcelona',
  'Lisbon',
  'Tokyo',
  'Shanghai',
  'LosAngeles',
  'NewYork',
  'Sydney',
  'Toronto',
  'Dubai',
  'Bangkok',
  'HongKong',
  'KualaLumpur',
  'Dubai',
  'Amsterdam',
  'Moscow',
  'Chicago',
  'Montreal',
  'Geneva',
  'Zurich',
  'Vienna',
  'Prague',
];

export const validatePassword = (
  email,
  password,
  blacklist = blacklistedPassword,
  companyName = 'XRUN',
) => {
  // 1. Check for uppercase, lowercase, digit, special character, and length
  const passwordPolicy =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordPolicy.test(password)) {
    return 'Password must include uppercase, lowercase, number, special character, and be at least 8 characters.';
  }

  // 2. Prohibit password same as email
  if (password.toLowerCase() === email.toLowerCase()) {
    return 'Password cannot be the same as your email.';
  }

  // 3. Check against blacklist
  if (
    blacklist.some(item => password.toLowerCase().includes(item.toLowerCase()))
  ) {
    return 'Password contains forbidden words or common patterns.';
  }

  // 4. Prohibit company name or abbreviation
  if (password.toLowerCase().includes(companyName.toLowerCase())) {
    return 'Password cannot contain the company name.';
  }

  // 6. Prohibit passwords matching common formats
  const commonPatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // Dates (YYYY-MM-DD)
    /^\d{2}\/\d{2}\/\d{4}$/, // Dates (MM/DD/YYYY)
    /^\d{3}-\d{2}-\d{4}$/, // Social Security Numbers (SSN-like)
    /^\d{10}$/, // Phone numbers (10 digits)
    /^[A-Z0-9]{1,7}$/, // License plate numbers
  ];
  if (commonPatterns.some(pattern => pattern.test(password))) {
    return 'Password matches a common format (date, phone number, etc.).';
  }

  // If all validations pass
  return '';
};

export const validateEmail = (email, companyName = 'XRUN') => {
  // 1. Check for uppercase, lowercase, digit, special character, and length
  // const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  if (!pattern.test(email)) {
    return 'Your email is not valid';
  }

  // 2. Prohibit company name or abbreviation
  if (email.toLowerCase().includes(companyName.toLowerCase())) {
    return 'Email cannot contain the company name.';
  }

  // If all validations pass
  return '';
};
