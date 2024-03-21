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
import React, {useState, useEffect, useRef} from 'react';
import ButtonBack from '../../components/ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInputWallet from '../../components/CustomInputWallet';
import {URL_API, getLanguage2} from '../../../utils';
// import crashlytics from '@react-native-firebase/crashlytics';

const Exchange = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [iconNextIsDisabled, setIconNextIsDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const {currency} = route.params;
  const [dataMember, setDataMember] = useState({});
  const [activeNetwork, setActiveNetwork] = useState('ETH');
  const [subcurrency, setSubcurrency] = useState('5205');
  const [symbol, setSymbol] = useState('XRUN');
  const symbolRef = useRef(null);
  const [Eamount, setEamount] = useState(0);
  const [minchange, setMinchange] = useState(0);
  const [estimate, setEstimate] = useState((0.0).toFixed(1));
  const [leftval, setLeftval] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Conversion
  const [popupConversion, setPopupConversion] = useState(false);

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
  }, []);

  useEffect(() => {
    if (dataMember) {
      const coinInquiry = async () => {
        try {
          if (currency === '11') {
            const request = await fetch(
              `${URL_API}&act=nd-1002&member=${dataMember.member}`,
              {
                method: 'POST',
              },
            );
            const response = await request.json();
            const result = await response;
            setEamount(result);
            setSymbol('XRUN');
            setIsLoading(false);
          }
        } catch (e) {
          setIsLoading(false);
          console.log(`Error get coin inquiry: ${err}`);
          crashlytics().recordError(new Error(err));
          crashlytics().log(err);
          Alert.alert(
            '',
            lang && lang.global_error && lang.global_error.error
              ? lang.global_error.error
              : '',
          );
        }
      };

      coinInquiry();

      const viewExchangeBalance = async () => {
        // Deprecated API
        const request = await fetch(
          `${URL_API}&act=app4500-01&currency=${currency}&member=${dataMember.member}`,
          {
            method: 'POST',
          },
        );
        const response = await request.json();

        if (response && response.data.length > 0) {
          setIsLoading(false);
          const result = await response.data[0];
          const {symbol, Eamount, ratio, minchange} = result;
          setSymbol(symbol);
          setEamount(Eamount);
          symbolRef.current = ratio;
          setMinchange(parseFloat(minchange));
          console.log(
            `Symbol: ${symbol} | Eamount: ${Eamount} | Ratio: ${ratio} | Minchange: ${minchange}`,
          );
        }
      };

      viewExchangeBalance();
    }
  }, [dataMember]);

  useEffect(() => {
    let tval = 0;
    if (amount === '' || amount === '-' || amount.length < 1 || amount == 0) {
      tval = 0;
      setEstimate(tval.toFixed(1));
      setIconNextIsDisabled(true);
    } else if (amount > parseFloat(Eamount)) {
      setIconNextIsDisabled(true);
    } else {
      tval = amount;

      const floatAmount = parseFloat(tval);
      const ratio = parseFloat(symbolRef.current);
      const result = floatAmount * ratio;
      setEstimate(result);

      setIconNextIsDisabled(false);
    }
  }, [amount]);

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
    } else if (amount == 0 || amount < 0) {
      Alert.alert(
        '',
        lang && lang.screen_conversion && lang.screen_conversion.coin_above_0
          ? lang.screen_conversion.coin_above_0
          : '',
      );
      // } else if (amount < minchange) {
      //   Alert.alert(
      //     '',
      //     lang && lang ? lang.screen_conversion.minimum_exchange : '',
      //     [
      //       {
      //         text: lang && lang ? lang.screen_wallet.confirm_alert : '',
      //       },
      //     ],
      //   );
    } else if (amount > Eamount) {
      Alert.alert(
        '',
        lang && lang ? lang.screen_send.send_balance_not_enough : '',
        [
          {
            text: lang && lang ? lang.screen_wallet.confirm_alert : '',
          },
        ],
      );
    } else {
      setPopupConversion(true);
      Keyboard.dismiss();
      const leftval = parseFloat(Eamount) - parseFloat(amount);
      setLeftval(leftval);
    }
  };

  const cancelConversion = () => {
    setPopupConversion(false);
  };

  const currentActiveNetwork = '#fedc00';
  const changeActiveNetwork = network => {
    setActiveNetwork(network);

    switch (network) {
      case 'ETH':
        setSubcurrency('5205');
        break;
      case 'TRX':
        setSubcurrency('5201');
        break;
      case 'MATIC':
        setSubcurrency('5203');
        break;
      default:
        setSubcurrency('5205');
        break;
    }
  };

  const confirmConversion = async () => {
    setIsLoading(true);

    try {
      const request = await fetch(
        `${URL_API}&act=app4520-01&currency=${currency}&member=${dataMember.member}&asxrun=${estimate}&amount=${amount}`,
        {
          method: 'POST',
        },
      );
      const response = await request.json();
      const result = await response.data[0];
      const {count} = result;

      if (count.toString() === '-1') {
        Alert.alert(result.v2);
      } else {
        navigation.navigate('CompleteExchange', {
          symbol,
          amount,
          currency,
          originamount: Eamount,
          estimate,
          leftval,
        });
      }
    } catch (err) {
      Alert.alert(
        '',
        lang && lang.global_error && lang.global_error.error
          ? lang.global_error.error
          : '',
      );
      console.error('Error in fetchData:', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
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
            {lang && lang.screen_wallet.table_head_exchange
              ? lang.screen_wallet.table_head_exchange
              : ''}
          </Text>
        </View>
      </View>

      <View style={{backgroundColor: '#fff'}}>
        <View style={styles.partTop}>
          <Text style={[styles.currencyName, {opacity: 0}]}>-</Text>
          <View style={styles.partScanQR}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.balance}>
                {lang && lang ? lang.screen_conversion.acquired_coin : ''}:{' '}
                {Eamount}
              </Text>
              <Text style={styles.balance} ref={symbolRef}>
                {symbol}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.partBottom}>
          <Text style={styles.selectNetwork}>
            {lang && lang.screen_conversion && lang.screen_conversion.exchanged
              ? lang.screen_conversion.exchanged
              : ''}
          </Text>
          <Text style={styles.description}>
            {lang &&
            lang.screen_conversion &&
            lang.screen_conversion.exchanged_xrun_desc
              ? lang.screen_conversion.exchanged_xrun_desc
              : ''}
          </Text>

          <View style={styles.wrapperNetwork}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => changeActiveNetwork('ETH')}
              style={[
                styles.wrapperTextNetwork,
                activeNetwork === 'ETH' && {
                  backgroundColor: currentActiveNetwork,
                },
              ]}>
              <Text style={styles.textDay}>ETH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => changeActiveNetwork('TRX')}
              style={[
                styles.wrapperTextNetwork,
                activeNetwork === 'TRX' && {
                  backgroundColor: currentActiveNetwork,
                },
              ]}>
              <Text style={styles.textDay}>TRON</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => changeActiveNetwork('BUTTON')}
              style={[
                styles.wrapperTextNetwork,
                activeNetwork === 'BUTTON' && {
                  backgroundColor: currentActiveNetwork,
                },
              ]}>
              <Text style={styles.textDay}>BUTTON</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wrapperInput}>
            <CustomInputWallet
              value={amount}
              setValue={setAmount}
              isNumber
              labelVisible={false}
              placeholder={
                lang &&
                lang.screen_conversion &&
                lang.screen_conversion.input_exchanged
                  ? lang.screen_conversion.input_exchanged
                  : ''
              }
              customFontSize={16}
            />
          </View>
          <Text style={styles.estimate}>{estimate}XRUN</Text>
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
                {lang && lang ? lang.screen_wallet.table_head_exchange : ''}{' '}
              </Text>
              <Text style={styles.textCheckInformation}>
                {lang && lang
                  ? lang.screen_conversion.check_conversion_desc
                  : ''}
              </Text>
            </View>
            <View style={styles.contentConversion}>
              <View style={styles.wrapperTextConversion}>
                <Text style={styles.textPartLeft}>
                  {lang && lang ? lang.complete_exchange.exchange_target : ''}
                </Text>
                <Text style={styles.textPartRight}>
                  {symbol} {'>> XRUN'}
                </Text>
              </View>
              <View style={styles.wrapperTextConversion}>
                <Text style={styles.textPartLeft}>
                  {lang && lang ? lang.complete_exchange.exchange_request : ''}
                </Text>
                <Text style={styles.textPartRight}>
                  {amount}
                  {symbol}
                </Text>
              </View>
              <View style={styles.wrapperTextConversion}>
                <Text style={styles.textPartLeft}>
                  {lang && lang ? lang.screen_wallet.table_head_exchange : ''}
                </Text>
                <Text style={styles.textPartRight}>{estimate}XRUN</Text>
              </View>
              <View style={styles.wrapperTextConversion}>
                <Text style={styles.textPartLeft}>
                  {lang && lang
                    ? lang.complete_exchange.post_exchange_balance
                    : ''}
                </Text>
                <Text style={styles.textPartRight}>
                  {leftval}
                  {symbol}
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

export default Exchange;
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
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
  },
  balance: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginTop: 10,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    color: '#bbb',
    marginTop: 4,
  },
  wrapperNetwork: {
    flexDirection: 'row',
    gap: 12,
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
    fontFamily: 'Poppins-Medium',
    color: 'black',
  },
  wrapperInput: {
    gap: 10,
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
    fontFamily: 'Poppins-Medium',
    color: '#000',
    textTransform: 'uppercase',
    fontSize: 13,
  },
  textCheckInformation: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#000',
  },
  contentConversion: {
    borderTopColor: '#343c5a',
    borderTopWidth: 2,
    marginHorizontal: 20,
    paddingVertical: 14,
    rowGap: 28,
  },
  wrapperTextConversion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textPartLeft: {
    color: '#aaa',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  textPartRight: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
  },
  estimate: {
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    color: '#aaa',
    textAlign: 'right',
    marginTop: 10,
  },
});
