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
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

const ConversionRequest = ({navigation, route}) => {
  const [lang, setLang] = useState({});
  const [iconNextIsDisabled, setIconNextIsDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const {currency} = route.params;
  const [dataMember, setDataMember] = useState({});
  const [activeNetwork, setActiveNetwork] = useState('ETH');
  const [subcurrency, setSubcurrency] = useState('5205');
  const [balance, setBalance] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Conversion
  const [popupConversion, setPopupConversion] = useState(false);
  const [conversionTargetConverted, setConversionTargetConverted] = useState(0);
  const [conversionRequest, setConversionRequest] = useState(0);
  const [isNaNCoverted, setIsNaNConverted] = useState(false);

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage();

    // Get data member
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const dataMember = JSON.parse(userData);
        setDataMember(dataMember);
      } catch (error) {
        console.error('Failed to get userData from AsyncStorage:', err);
      }
    };

    getUserData();
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
      }
    };

    getBalance();
  }, [dataMember]);

  useEffect(() => {
    if (amount === '' || amount === '-') {
      setIconNextIsDisabled(true);
    } else if (amount == 0 || amount < 0) {
      setIconNextIsDisabled(true);
    } else {
      setIconNextIsDisabled(false);
    }
  }, [amount, address]);

  const onBack = () => {
    navigation.navigate('WalletHome');
  };

  const onSend = () => {
    if (amount === '' || amount === '-') {
      Alert.alert('Warning', 'Invalid input.');
    } else if (parseFloat(amount) > parseFloat(balance)) {
      Alert.alert('Warning', 'Insufficient coin acquired.');
    } else if (amount == 0 || amount < 0) {
      Alert.alert('Warning', 'Please enter the coin above 0.');
    } else {
      // setAmount('');
      setPopupConversion(true);
      setConversionRequest(parseFloat(amount));
      Keyboard.dismiss();
      let totalConverted;

      switch (activeNetwork) {
        case 'ETH':
          totalConverted = parseFloat(amount) * (450 / 2139400.0);
          setConversionTargetConverted(totalConverted);
          setIsNaNConverted(isNaN(totalConverted));
          break;
        case 'TRX':
          totalConverted = parseFloat(amount) * (450 / 86.0);
          setConversionTargetConverted(totalConverted);
          setIsNaNConverted(isNaN(totalConverted));
          break;
        case 'MATIC':
          totalConverted = parseFloat(amount) * (450 / 1230.0);
          setConversionTargetConverted(totalConverted);
          setIsNaNConverted(isNaN(totalConverted));
          break;
        default:
          // Default ETH
          totalConverted = parseFloat(amount) * (450 / 2139400.0);
          setConversionTargetConverted(totalConverted);
          setIsNaNConverted(isNaN(totalConverted));
          break;
      }
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
    if (isNaNCoverted) {
      Alert.alert('', 'Invalid input amount.');
      setPopupConversion(false);
    } else if (address === '') {
      Alert.alert(
        '',
        lang && lang.screen_send && lang.screen_send.send_address_placeholder
          ? lang.screen_send.send_address_placeholder
          : '',
        [
          {
            text:
              lang && lang.screen_wallet && lang.screen_wallet.confirm_alert
                ? lang.screen_wallet.confirm_alert
                : '',
          },
        ],
      );
      setPopupConversion(false);
    } else if (address.length < 40) {
      Alert.alert(
        '',
        lang && lang.screen_send && lang.screen_send.send_address_less
          ? lang.screen_send.send_address_less
          : '',
        [
          {
            text:
              lang && lang.screen_wallet && lang.screen_wallet.confirm_alert
                ? lang.screen_wallet.confirm_alert
                : '',
          },
        ],
      );
      setPopupConversion(false);
    } else {
      setIsLoading(true);

      const request = await fetch(
        `${URL_API}&act=app4420-02&currency=${currency}&member=${dataMember.member}&address=${address}&amount=${amount}&extracurrency=${subcurrency}`,
      );

      const response = await request.json();
      const result = response.data[0].count;
      setIsLoading(false);
      setPopupConversion(false);
      setAmount('');
      setAddress('');
      setActiveNetwork('ETH');

      if (result === '1') {
        navigation.navigate('CompleteConversion', {
          symbol: activeNetwork,
          conversionRequest,
          amount,
        });
      } else {
        Alert.alert('', "It's a server problem. Please try in a few minutes.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Loading */}
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size={'large'} color={'#fff'} />
        </View>
      )}

      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Conversion request</Text>
        </View>
      </View>

      <View style={{backgroundColor: '#fff'}}>
        <View style={styles.partTop}>
          <Text style={styles.currencyName}>-</Text>
          <View style={styles.partScanQR}>
            <Text style={styles.balance}>accquired coin: {balance}XRUN</Text>
          </View>
        </View>

        <View style={styles.partBottom}>
          <Text style={styles.selectNetwork}>Select Network</Text>
          <Text style={styles.description}>
            When switching, the gas is approximately 0.124% deducted before
            switching.
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
              onPress={() => changeActiveNetwork('MATIC')}
              style={[
                styles.wrapperTextNetwork,
                activeNetwork === 'MATIC' && {
                  backgroundColor: currentActiveNetwork,
                },
                {
                  width: 130,
                },
              ]}>
              <Text style={styles.textDay}>MATIC(POLYGON)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wrapperInput}>
            <CustomInputWallet
              value={amount}
              setValue={setAmount}
              isNumber
              labelVisible={false}
              placeholder={'Please enter the amount to be sent.'}
              customFontSize={16}
            />

            <CustomInputWallet
              value={address}
              labelVisible={false}
              setValue={setAddress}
              placeholder={'Please enter the Address'}
              customFontSize={16}
            />
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
              <Text style={styles.textChange}>Change </Text>
              <Text style={styles.textCheckInformation}>
                Please check the information once more.
              </Text>
            </View>
            <View style={styles.contentConversion}>
              <View style={styles.wrapperTextConversion}>
                <Text style={styles.textPartLeft}>Target to be converted</Text>
                <Text style={styles.textPartRight}>
                  {conversionTargetConverted.toFixed(6).replaceAll('.', ',')}
                  {activeNetwork}
                </Text>
              </View>
              <View style={styles.wrapperTextConversion}>
                <Text style={styles.textPartLeft}>
                  Conversion Request from{' '}
                </Text>
                <Text style={styles.textPartRight}>
                  {parseFloat(conversionRequest).toFixed(5)}XRUN
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
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ConversionRequest;
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
    fontSize: 12,
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
    gap: 4,
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
});
