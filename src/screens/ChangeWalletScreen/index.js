import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Alert,
  Keyboard,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInputWallet from '../../components/CustomInputWallet';
import {URL_API, getLanguage2} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const Change = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [iconNextIsDisabled, setIconNextIsDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('CONVERT');
  const {currency} = route.params;
  const [dataMember, setDataMember] = useState({});
  const [symbol, setSymbol] = useState('XRUN');
  const [subcurrency, setSubcurrency] = useState('5205');
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Conversion
  const [popupConversion, setPopupConversion] = useState(false);
  const [estimate, setEstimate] = useState(0);
  const [conversionRequest, setConversionRequest] = useState(0);
  const [isNaNCoverted, setIsNaNConverted] = useState(false);

  useEffect(() => {
    // Get Language Data
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        // Set your language state
        setLang(screenLang);
      } catch (err) {
        console.error('Error in fetchData:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    fetchData();

    // Get data member
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const dataMember = JSON.parse(userData);
        setDataMember(dataMember);
      } catch (error) {
        console.error('Failed to get userData from AsyncStorage:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    };

    getUserData();

    if (currency == '1') {
      setSymbol('XRUN');
    }
  }, []);

  // Get balance
  useEffect(() => {
    const getBalance = async () => {
      try {
        if (Object.keys(dataMember).length !== 0) {
          const fetchData = await fetch(
            `${URL_API}&act=app4300-temp-amount&member=${dataMember.member}&currency=${currency}`,
          );

          const response = await fetchData.json();
          const balance = await response.data[0].amount;
          setBalance(balance);
          setIsLoading(false);
        }
      } catch (err) {
        console.log(`Error get balance: ${err}`);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    getBalance();
  }, [dataMember]);

  useEffect(() => {
    if (amount === '' || amount === '-' || parseFloat(amount) > balance) {
      setIconNextIsDisabled(true);
    } else if (amount == 0 || amount < 0) {
      setIconNextIsDisabled(true);
      // } else if (address === '' || address.length < 40) {
      //   setIconNextIsDisabled(true);
    } else {
      setIconNextIsDisabled(false);
    }
  }, [amount, address]);

  const onBack = () => {
    navigation.navigate('WalletHome');
  };

  const onSend = () => {
    if (amount === '' || amount === '-') {
      Alert.alert(
        '',
        lang && lang.screen_conversion && lang.screen_conversion.invalid_input
          ? lang.screen_conversion.invalid_input
          : '',
      );
    } else if (parseFloat(amount) > parseFloat(balance)) {
      Alert.alert(
        '',
        lang &&
          lang.screen_conversion &&
          lang.screen_conversion.insufficient_coin
          ? lang.screen_conversion.insufficient_coin
          : '',
      );
    } else if (amount == 0 || amount < 0) {
      Alert.alert(
        '',
        lang && lang.screen_conversion && lang.screen_conversion.coin_above_0
          ? lang.screen_conversion.coin_above_0
          : '',
      );
      // } else if (address === '') {
      //   Alert.alert(
      //     '',
      //     lang && lang ? lang.screen_send.send_address_placeholder : '',
      //     [
      //       {
      //         text: lang && lang ? lang.screen_wallet.confirm_alert : '',
      //       },
      //     ],
      //   );
      // } else if (address.length < 40) {
      //   Alert.alert('', lang && lang ? lang.screen_send.send_address_less : '', [
      //     {
      //       text: lang && lang ? lang.screen_wallet.confirm_alert : '',
      //     },
      //   ]);
    } else {
      setPopupConversion(true);
      console.log(amount.length);
      setConversionRequest(parseFloat(amount).toFixed(9));
      Keyboard.dismiss();

      // Info checker load
      // const infoCheckerLoad = async () => {
      //   const request = await fetch(
      //     `${URL_API}&act=app4420-01&currency=${currency}&member=${dataMember.member}&amount=${amount}`,
      //   );
      //   const response = await request.json();
      //   const result = await response.data[0];

      //   const {symbol: resultSymbol, amount: resultAmount, fee} = result;
      // };

      // Not using same like code in java
      // infoCheckerLoad();

      // let totalConverted;

      // switch (symbol) {
      //   case 'ETH':
      //     totalConverted = parseFloat(amount) * (450 / 2139400.0);
      //     setEstimate(totalConverted);
      //     setIsNaNConverted(isNaN(totalConverted));
      //     break;
      //   case 'TRX':
      //     totalConverted = parseFloat(amount) * (450 / 86.0);
      //     setEstimate(totalConverted);
      //     setIsNaNConverted(isNaN(totalConverted));
      //     break;
      //   case 'MATIC':
      //     totalConverted = parseFloat(amount) * (450 / 1230.0);
      //     setEstimate(totalConverted);
      //     setIsNaNConverted(isNaN(totalConverted));
      //     break;
      //   default:
      //     // Default ETH
      //     totalConverted = parseFloat(amount) * (450 / 2139400.0);
      //     setEstimate(totalConverted);
      //     setIsNaNConverted(isNaN(totalConverted));
      //     break;
      // }
    }
  };

  const cancelConversion = () => {
    setPopupConversion(false);
  };

  // const currentActiveSymbol = '#fedc00';
  // const changeSymbol = currentSymbol => {
  //   setSymbol(currentSymbol);

  //   switch (currentSymbol) {
  //     case 'ETH':
  //       setSubcurrency('5205');
  //       break;
  //     case 'TRX':
  //       setSubcurrency('5201');
  //       break;
  //     case 'MATIC':
  //       setSubcurrency('5203');
  //       break;
  //     default:
  //       setSubcurrency('5205');
  //       break;
  //   }
  // };

  const confirmConversion = async () => {
    if (isNaNCoverted) {
      Alert.alert('', 'Invalid input amount.');
      setPopupConversion(false);
      // } else if (address === '') {
      //   Alert.alert(
      //     '',
      //     lang && lang.screen_send && lang.screen_send.send_address_placeholder
      //       ? lang.screen_send.send_address_placeholder
      //       : '',
      //     [
      //       {
      //         text:
      //           lang && lang.screen_wallet && lang.screen_wallet.confirm_alert
      //             ? lang.screen_wallet.confirm_alert
      //             : '',
      //       },
      //     ],
      //   );
      //   setPopupConversion(false);
      // } else if (address.length < 40) {
      //   Alert.alert(
      //     '',
      //     lang && lang.screen_send && lang.screen_send.send_address_less
      //       ? lang.screen_send.send_address_less
      //       : '',
      //     [
      //       {
      //         text:
      //           lang && lang.screen_wallet && lang.screen_wallet.confirm_alert
      //             ? lang.screen_wallet.confirm_alert
      //             : '',
      //       },
      //     ],
      //   );
      //   setPopupConversion(false);
    } else {
      setIsLoading(true);

      try {
        const request = await fetch(
          `${URL_API}&act=app4420-02-conv&currency=${currency}&member=${
            dataMember.member
          }&address=${address}&amount=${String(
            amount,
          )}&extracurrency=${subcurrency}`,
        );

        const response = await request.json();
        const result = response.data[0].count;
        setIsLoading(false);
        setPopupConversion(false);
        setAmount('');
        setAddress('');
        setSymbol('XRUN');

        console.log(`Success conversion request: ${result}`);

        navigation.navigate('CompleteConversion', {
          symbol,
          estimate,
          amount,
          currency,
          originamount: amount,
          left: 0,
        });
      } catch (err) {
        Alert.alert(
          '',
          lang && lang.global_error && lang.global_error.error
            ? lang.global_error.error
            : '',
        );
        console.error('Error conversion request:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Loading */}
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size={'large'} color={'#fff'} />
          <Text
            style={{
              color: '#fff',
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
              marginTop: 10,
            }}>
            Loading...
          </Text>
        </View>
      )}

      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang ? lang.screen_conversion.title : ''}
          </Text>
        </View>
      </View>

      <View style={{backgroundColor: '#fff'}}>
        <View style={styles.partTop}>
          <Text style={styles.currencyName}>-</Text>
          <View style={styles.partScanQR}>
            <Text style={styles.balance}>
              {lang && lang ? lang.screen_conversion.acquired_coin : ''}:{' '}
              {balance}XRUN
            </Text>
          </View>
        </View>

        <View style={styles.partBottom}>
          <Text style={styles.selectNetwork}>
            {lang && lang ? lang.screen_conversion.title : ''}
          </Text>
          <Text style={styles.description}>
            {lang && lang ? lang.screen_conversion.desc : ''}
          </Text>

          {/* <View style={styles.wrapperNetwork}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => changeSymbol('ETH')}
              style={[
                styles.wrapperTextNetwork,
                symbol === 'ETH' && {
                  backgroundColor: currentActiveSymbol,
                },
              ]}>
              <Text style={styles.textDay}>ETH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => changeSymbol('TRX')}
              style={[
                styles.wrapperTextNetwork,
                symbol === 'TRX' && {
                  backgroundColor: currentActiveSymbol,
                },
              ]}>
              <Text style={styles.textDay}>TRON</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => changeSymbol('MATIC')}
              style={[
                styles.wrapperTextNetwork,
                symbol === 'MATIC' && {
                  backgroundColor: currentActiveSymbol,
                },
                {
                  width: 130,
                },
              ]}>
              <Text style={styles.textDay}>MATIC(POLYGON)</Text>
            </TouchableOpacity>
          </View> */}

          <View style={styles.wrapperInput}>
            <CustomInputWallet
              value={amount}
              setValue={setAmount}
              isNumber
              labelVisible={false}
              placeholder={
                lang && lang ? lang.screen_conversion.input_convert : ''
              }
              customFontSize={16}
            />
            {/* <CustomInputWallet
              value={address}
              labelVisible={false}
              setValue={setAddress}
              placeholder={
                lang && lang ? lang.screen_send.send_address_placeholder : ''
              }
              customFontSize={16}
            /> */}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableOpacity
          onPress={onSend}
          style={styles.button}
          activeOpacity={0.6}>
          <Image
            source={
              iconNextIsDisabled
                ? require('../../../assets/images/icon_nextDisable.png')
                : require('../../../assets/images/icon_next.png')
            }
            resizeMode="contain"
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {popupConversion && (
        <View style={styles.popupConversion}>
          <View style={styles.wrapperConversion}>
            <View style={styles.wrapperPartTop}>
              <Text style={styles.textChange}>
                {lang && lang ? lang.screen_wallet.history_action3306 : ''}{' '}
              </Text>
              <Text style={styles.textCheckInformation}>
                {lang && lang
                  ? lang.screen_conversion.check_conversion_desc
                  : ''}
              </Text>
            </View>
            <View style={styles.contentConversion}>
              {/* <View style={styles.wrapperTextConversion}>
                <Text style={styles.textPartLeft}>
                  {lang && lang
                    ? lang.complete_conversion.target_converted
                    : ''}
                </Text>
                <Text style={styles.textPartRight}>
                  {estimate.toFixed(6).replaceAll('.', ',')}
                  {symbol}
                </Text>
              </View> */}
              <View style={styles.wrapperTextConversion}>
                <Text style={styles.textPartLeft}>
                  {lang && lang
                    ? lang.complete_conversion.conversion_request
                    : ''}{' '}
                </Text>
                <Text style={styles.textPartRight}>
                  {conversionRequest}
                  XRUN
                </Text>
              </View>
            </View>
            <View style={styles.wrapperButton}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.buttonConfirm}
                onPress={cancelConversion}>
                <Text style={styles.textButtonConfirm}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.buttonConfirm,
                  {backgroundColor: '#343c5a', flex: 1.5},
                ]}
                onPress={confirmConversion}>
                <Text style={[styles.textButtonConfirm, {color: '#fff'}]}>
                  {lang && lang ? lang.screen_wallet.confirm_alert : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default Change;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  titleWrapper: {
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    color: '#051C60',
    margin: 10,
  },
  partTop: {
    backgroundColor: '#343c5a',
    paddingHorizontal: 28,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyName: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
  },
  balance: {
    color: '#fff',
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
  },
  partBottom: {
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  button: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 24,
    marginTop: 30,
    marginBottom: 10,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 10,
    right: 0,
  },
  buttonImage: {
    height: 95,
    width: 95,
  },
  selectNetwork: {
    fontFamily: 'Roboto-Regular',
    color: '#000',
    marginTop: 10,
  },
  description: {
    fontFamily: 'Roboto-Regular',
    color: '#bbb',
    marginTop: 4,
  },
  wrapperNetwork: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    marginBottom: 30,
  },
  wrapperTextNetwork: {
    backgroundColor: '#f3f4f6',
    paddingTop: 6,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    elevation: 2,
  },
  textDay: {
    fontFamily: 'Roboto-Medium',
    color: 'black',
  },
  wrapperInput: {
    gap: 10,
    marginTop: 10,
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
  popupConversion: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapperConversion: {
    backgroundColor: '#fff',
  },
  wrapperPartTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 10,
  },
  textChange: {
    fontFamily: 'Roboto-Medium',
    color: '#000',
    textTransform: 'uppercase',
    fontSize: 13,
  },
  textCheckInformation: {
    fontFamily: 'Roboto-Regular',
    fontSize: 11,
    color: '#000',
  },
  contentConversion: {
    borderTopColor: '#343c5a',
    borderTopWidth: 2,
    marginHorizontal: 10,
    paddingVertical: 14,
    rowGap: 28,
  },
  wrapperTextConversion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  textPartLeft: {
    color: '#aaa',
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
  },
  textPartRight: {
    color: '#000',
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
  },
  wrapperButton: {
    flexDirection: 'row',
  },
  buttonConfirm: {
    padding: 10,
    backgroundColor: '#eee',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButtonConfirm: {
    color: '#343c5a',
    fontFamily: 'Roboto-Medium',
    textTransform: 'uppercase',
  },
});
