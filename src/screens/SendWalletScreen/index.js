import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Alert,
  PermissionsAndroid,
  Animated,
  ActivityIndicator,
  BackHandler,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import ButtonBack from '../../components/ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInputWallet from '../../components/CustomInputWallet';
import {
  URL_API,
  getLanguage2,
  getFontFam,
  fontSize,
  refreshBalances,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  request,
  PERMISSIONS,
  check,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {BarcodeScanner} from 'rn-barcode-zxing';
import BarcodeMask from 'react-native-barcode-mask';

const SendWalletScreen = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [balance, setBalance] = useState(0);
  const [limitTransfer, setLimitTransfer] = useState(0);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const [chainId, setChainId] = useState(1);
  const [currency, setCurrency] = useState('1');
  const [token, setToken] = useState('');
  const [network, setNetwork] = useState('');

  const {dataWallet} = route.params;
  const [selectedExchange, setSelectedExchange] = useState('360001');
  const [isVisibleReadQR, setIsVisibleReadQR] = useState(false);
  const [dataMember, setDataMember] = useState({});
  const [cointrace, setCointrace] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isPopupSend, setIsPopupSend] = useState(false);
  const [isPopupSendConfirmation, setIsPopupSendConfirmation] = useState(false);
  const [isIconNextDisabled, setIsIconNextDisabled] = useState(true);

  // Animated notification in QR
  const [fadeAnim] = useState(new Animated.Value(0));
  const [zIndexAnim, setZIndexAnim] = useState(-1);

  // About Estimated gas
  const [gasEstimate, setGasEstimate] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [totalGasCost, setTotalGasCost] = useState(0);

  const [countEstimatedGas, setCountEstimatedGas] = useState(0);
  const [isInitialCallGasEstimated, setIsInitialCallGasEstimated] =
    useState(false);

  const [isTextBlinking, setIsTextBlinking] = useState(false);
  const [isDisableButtonConfirm, setIsDisableButtonConfirm] = useState(false);
  const fadeAnimEstimatedGas = useRef(new Animated.Value(1)).current;

  const [totalTransfer, setTotalTransfer] = useState(0);
  const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);

  const [logIntervalId, setLogIntervalId] = useState(null);

  // Set currency and set token
  useEffect(() => {
    if (dataWallet.currency) {
      // Set currency
      setCurrency(dataWallet.currency);

      // Set token xr or et
      const token = dataWallet.currency == 1 ? 'xr' : 'et';
      setToken(token);
    }
  }, [dataWallet]);

  // Set the current network
  useEffect(() => {
    if (dataWallet.subcurrency) {
      const subcurrency = dataWallet.subcurrency;

      switch (subcurrency) {
        case '5000':
        case '5100':
          setNetwork('ETH');
          setChainId(1);
          break;
        case '5200':
        case '5201':
          setNetwork('POL');
          setChainId(137);
          setToken('');
          break;
        case '5300':
          setNetwork('BNB');
          setChainId(56);
          setToken('');
          break;
        default:
          setNetwork('ETH');
          setChainId(1);
          break;
      }
    }
  }, [dataWallet]);

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
        console.error('Failed to get userData from AsyncStorage:', err);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    };

    getUserData();
  }, []);

  // Interval gas estimated
  useEffect(() => {
    if (totalGasCost && isInitialCallGasEstimated) {
      setIsLoading(false);
      setIsPopupSend(true);
      console.log(`Run the setInterval for call function getEstimatedGas()`);

      // Set up an interval to log the refresh count every 1 second
      const intervalId = setInterval(() => {
        setCountEstimatedGas(prevCount => {
          const newCount = (prevCount % 30) + 1; // Reset to 1 after 30
          console.log(`Countdown refresh gas estimated: ${newCount}`);

          if (newCount === 30) {
            console.log('Disable button confirm');
            setIsDisableButtonConfirm(true);
            setIsTextBlinking(true);
            getEstimatedGas();
          }
          return newCount;
        });
      }, 1000);

      setLogIntervalId(intervalId);

      // Cleanup function to clear the interval
      return () => {
        clearInterval(intervalId);
        console.log('Interval cleared.');
      };
    }
  }, [totalGasCost, isInitialCallGasEstimated]);

  // Request for get gas tracker to Inufra API
  const gasTracker = async chainId => {
    try {
      const requestGasTracker = await fetch(
        `https://gas.api.infura.io/v3/${process.env.INFURA_APIKEY}/networks/${chainId}/suggestedGasFees`,
      );
      const response = await requestGasTracker.json();
      const priorityGasTracker = response.low.suggestedMaxPriorityFeePerGas;
      return priorityGasTracker;
    } catch (error) {
      Alert.alert(lang.global_error.network_busy);
      setIsLoading(false);
      gasEstimateNetworkBusy();

      console.log(`Error gas tracker: ${error}`);
    }
  };

  // Function for get estimated gas
  const getEstimatedGas = async () => {
    try {
      console.log(
        `Gas estimated network ${network} | chainId: ${chainId} | token: ${token}`,
      );
      const priorityGasTracker = await gasTracker(chainId);
      // Request for get gas estimated to gateway.php
      const request = await fetch(
        `${URL_API}&act=gasEstimated&from=${dataWallet.address}&to=${address}&amount=${amount}&token=${token}&network=${network}&chainId=${chainId}&priorityGasTracker=${priorityGasTracker}`,
      );
      const responses = await request.json();
      const results = responses['data'];

      // If data array not empty from response API

      if (results.length > 0) {
        const gasEstimateFromAPI = results[0]['gasLimit'];
        const gasPriceFromAPI = results[0]['gasPrice'];
        const totalGasCostFromAPI = results[0]['totalGasCost'];

        console.log(`Total gas cost ${network}: ${totalGasCostFromAPI}`);
        if (!totalGasCostFromAPI || !gasEstimateFromAPI || !gasPriceFromAPI) {
          setIsLoading(false);
          Alert.alert(lang.global_error.network_busy);

          gasEstimateNetworkBusy();
        }

        setGasEstimate(gasEstimateFromAPI);
        setGasPrice(gasPriceFromAPI);
        setTotalGasCost(totalGasCostFromAPI);

        console.log('Active button confirm');
        setIsDisableButtonConfirm(false);
        setIsTextBlinking(false);

        const total = parseFloat(totalGasCostFromAPI) + parseFloat(amount);
        setTotalTransfer(total);

        if (!isInitialCallGasEstimated) {
          setIsInitialCallGasEstimated(true);
        }
      } else {
        const messageResponse = responses['message'];

        if (messageResponse === 'insufficient funds') {
          Alert.alert(lang.screen_send.note_insufficient_balance_total);
        }

        setIsLoading(false);
        gasEstimateNetworkBusy();
      }
    } catch (error) {
      Alert.alert(lang.global_error.network_busy);
      setIsLoading(false);
      gasEstimateNetworkBusy();

      console.log(`Error gas estimated: ${error}`);
    }
  };

  // Animated blink text estimated gas
  // If button disable run the blinking animated
  useEffect(() => {
    if (isTextBlinking) {
      blink();
    } else {
      fadeAnimEstimatedGas.setValue(1);
      Animated.timing(fadeAnimEstimatedGas).stop();
    }
  }, [isTextBlinking]);

  const blink = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnimEstimatedGas, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimEstimatedGas, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  // Disable confirm send if balance not enough
  useEffect(() => {
    if (isPopupSendConfirmation) {
      console.log(
        `Total transfer: ${totalTransfer} | Balance: ${balance} | Gas estimated: ${totalGasCost} | Total transfer > balance: ${
          totalTransfer > balance
        }`,
      );
      if (totalTransfer > balance || isTextBlinking) {
        setIsDisableButtonConfirm(true);
      } else {
        setIsDisableButtonConfirm(false);
      }

      // Show note/text if user insufficient balance
      if (totalTransfer > balance) {
        setIsInsufficientBalance(true);
      } else {
        setIsInsufficientBalance(false);
      }
    }
  }, [
    isPopupSendConfirmation,
    isDisableButtonConfirm,
    isTextBlinking,
    totalTransfer,
  ]);

  // Cancel call gasEstimated
  const cancelGasEstimated = () => {
    setIsPopupSend(false);
    setIsPopupSendConfirmation(false);

    setIsInitialCallGasEstimated(false);
    setCountEstimatedGas(0);

    setIsDisableButtonConfirm(false);
    setIsTextBlinking(false);

    setIsInsufficientBalance(false);
  };

  // If gas estimate API network busy
  const gasEstimateNetworkBusy = () => {
    setIsLoading(false);

    setTotalGasCost('???');
    setTotalTransfer('???');

    setIsPopupSendConfirmation(false);

    setIsInitialCallGasEstimated(false);
    setCountEstimatedGas(0);

    setIsDisableButtonConfirm(true);
    setIsTextBlinking(false);

    setIsInsufficientBalance(false);
  };

  // Get list stock exchange
  const stockExchange = async () => {
    try {
      const response = await fetch(`${URL_API}&act=ap4300-cointrace`);
      const result = await response.json();
      setCointrace(result.data);
      return result.data;
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error get data listCrypto: ', error);
      console.log('Error get data listCrypto: ', error);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  };

  // Get balance
  const getBalance = async () => {
    try {
      const request = await fetch(
        `${URL_API}&act=app4300-temp-amount&member=${dataMember.member}&currency=${dataWallet.currency}`,
      );
      const response = await request.json();
      const result = response.data;
      if (result.length > 0) {
        setBalance(parseFloat(result[0].Wamount));
        setLimitTransfer(result[0].limittransfer);

        const listStockExchange = await stockExchange();
        setCointrace(listStockExchange);

        setCurrency(dataWallet.currency);

        setIsLoading(false);
      } else {
        setIsLoading(false);
        Alert.alert('Error get data balance');
        console.log(`Error get data balance: ${error}`);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error get data balance');
      console.log(`Error get data balance: ${error}`);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  };

  useEffect(() => {
    // Init refresh balance, cointrace, and get balance
    const initFunc = async () => {
      if (dataWallet && dataMember.member) {
        // Refresh / update balance
        await refreshBalances(dataMember.member);

        // Get balance
        getBalance();
      }
    };

    initFunc();
  }, [dataWallet, dataMember]);

  const handleBackPress = () => {
    if (isVisibleReadQR) {
      setIsVisibleReadQR(false);
      return true;
    } else {
      navigation.navigate('WalletHome');
      return true;
    }
  };

  // User press back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [isVisibleReadQR]);

  useEffect(() => {
    if (amount === '' || amount > balance) {
      setIsIconNextDisabled(true);
    } else if (amount == 0) {
      setIsIconNextDisabled(true);
    } else if (address === '' || address.length < 40) {
      setIsIconNextDisabled(true);
    } else {
      setIsIconNextDisabled(false);
    }
  }, [amount, address]);

  const onBack = () => {
    navigation.navigate('WalletHome');
  };

  const onQRCodeScan = async () => {
    try {
      if (Platform.OS == 'ios') {
        check(PERMISSIONS.IOS.CAMERA)
          .then(result => {
            switch (result) {
              case RESULTS.DENIED:
                console.log(
                  'The permission has not been requested / is denied but requestable',
                );
                request(PERMISSIONS.IOS.CAMERA).then(result => {
                  console.log(`Permission: ${result}`);
                });
                openSettings();
                break;
              case RESULTS.LIMITED:
                console.log(
                  'The permission is limited: some actions are possible',
                );
                break;
              case RESULTS.GRANTED:
                console.log('The permission is granted');
                setIsVisibleReadQR(true);
                break;
              case RESULTS.BLOCKED:
                request(PERMISSIONS.IOS.CAMERA).then(result => {
                  console.log(`Permission: ${result}`);
                });
                openSettings();
                console.log(
                  'The permission is denied and not requestable anymore',
                );
                break;
            }
          })
          .catch(error => {
            console.log(`Error QR Code Send: ${error}`);
            Alert.alert(
              '',
              lang && lang.global_error && lang.global_error.error
                ? lang.global_error.error
                : '',
            );
          });
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setIsVisibleReadQR(true);
        } else {
          Alert.alert(
            lang && lang ? lang.permissions_alert.title_camera_permission : '',
            lang && lang ? lang.permissions_alert.desc_camera_permission : '',
            [
              {
                text:
                  lang && lang ? lang.complete_exchange.cancel_exchange : '',
              },
              {
                text: lang && lang ? lang.screen_wallet.confirm_alert : '',
                onPress: () => openSettings(),
              },
            ],
          );
        }
      }
    } catch (err) {
      console.warn(`Error permission camera: ${err}`);
    }
  };

  // Execute function transfer

  // Checking limit transfer
  const getLimitTransfer = async () => {
    try {
      const request = await fetch(
        `${URL_API}&act=ap4300-getLimitTransfer&member=${dataMember.member}&currency=${currency}&amountrq=${amount}`,
      );
      const response = await request.json();

      const avaliable = response.avaliable;
      return avaliable;
    } catch (error) {
      Alert.alert('Check limit transfer failed');
      console.log(`Check limit transfer failed: ${error}`);
      setIsLoading(false);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  };

  // Transfer by stock exchange
  const transferByStockExchange = async () => {
    try {
      const request = await fetch(
        `${URL_API}&act=ap4300-03&member=${dataMember.member}&addrto=${address}&currency=${currency}&amount=${amount}&coinmarket=${selectedExchange}`,
      );
      const response = await request.json();
      const data = response.data;
      return data;
    } catch (error) {
      Alert.alert(lang.global_error.network_busy);
      console.log(`Transfer failed ap4300-03: ${error}`);
      gasEstimateNetworkBusy();
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  };

  // Post transfer
  const postTransfer = async () => {
    try {
      const dataStockExchange = await transferByStockExchange();

      if (dataStockExchange) {
        const request = await fetch(
          `${URL_API}&act=postTransferNew&to=${address}&amount=${amount}&token=${token}&member=${dataMember.member}&gasEstimate=${gasEstimate}&gasPrice=${gasPrice}&network=${network}&chainId=${chainId}`,
        );
        const response = await request.json();

        const {status, hash} = response;
        console.log(
          `Transfer complete.... Token: ${token} | Status: ${status} | Hash: ${hash} | act=postTransferNew`,
        );

        if (status === 'success') {
          setIsLoading(false);
          setAddress('');
          setAmount('');
          setSelectedExchange('360001');

          navigation.navigate('CompleteSend', {
            amount,
            addrto: address,
            txid: hash,
            symbol: dataWallet.symbol,
          });
        } else {
          Alert.alert(lang.global_error.network_busy);
          console.log('Transfer failed postTransfer');
          gasEstimateNetworkBusy();
        }
      } else {
        Alert.alert(lang.global_error.network_busy);
        console.log(`Transfer failed ap4300-03: ${error}`);
        gasEstimateNetworkBusy();
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    } catch (error) {
      Alert.alert(lang.global_error.network_busy);
      console.log(`Transfer failed postTransfer: ${error}`);
      gasEstimateNetworkBusy();
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  };

  const onSend = async () => {
    if (amount === '') {
      Alert.alert(
        '',
        lang && lang ? lang.screen_send.send_amount_placeholder : '',
        [
          {
            text: lang && lang ? lang.screen_wallet.confirm_alert : '',
          },
        ],
      );
    } else if (amount == 0) {
      Alert.alert(
        '',
        lang && lang ? lang.screen_send.send_amount_greater_zero : '',
        [
          {
            text: lang && lang ? lang.screen_wallet.confirm_alert : '',
          },
        ],
      );
    } else if (amount > balance) {
      Alert.alert(
        '',
        lang && lang ? lang.screen_send.send_balance_not_enough : '',
        [
          {
            text: lang && lang ? lang.screen_wallet.confirm_alert : '',
          },
        ],
      );
    } else if (address === '') {
      Alert.alert(
        '',
        lang && lang ? lang.screen_send.send_address_placeholder : '',
        [
          {
            text: lang && lang ? lang.screen_wallet.confirm_alert : '',
          },
        ],
      );
    } else if (address.length < 40) {
      Alert.alert('', lang && lang ? lang.screen_send.send_address_less : '', [
        {
          text: lang && lang ? lang.screen_wallet.confirm_alert : '',
        },
      ]);
    } else {
      setIsLoading(true);

      const statusLimitTransfer = await getLimitTransfer();
      // Check the limit transfer available
      if (statusLimitTransfer === 'OK') {
        getEstimatedGas();
      } else {
        Alert.alert(lang && lang ? lang.screen_send.send_empty_limit : '');
        console.log(`Check limit transfer failed`);
        setIsLoading(false);
      }
    }
  };

  const onConfirmSend = () => {
    // Confirm transfer
    if (isPopupSendConfirmation) {
      console.log(`Confirm transfer`);

      // Clear the interval and reset countEstimatedGas
      if (logIntervalId) {
        clearInterval(logIntervalId);
        setCountEstimatedGas(0);
        console.log('Interval cleared and count reset.');
      }

      setIsLoading(true);

      console.log(
        `Confirm send Amount: ${amount} | Gas estimate: ${gasEstimate} | Gas Price: ${gasPrice}`,
      );

      postTransfer();
    }
    // Next transfer for confirmation
    else {
      setIsDisableButtonConfirm(true);
      setIsPopupSendConfirmation(true);

      const total = parseFloat(totalGasCost) + parseFloat(amount);
      setTotalTransfer(total);
    }
  };

  const handleQRCodeRead = ({code}) => {
    const data = Platform.OS === 'ios' ? code : code[0];
    console.log(`Scanned: ${data}`);
    setAddress(data);
    fadeIn();
    setZIndexAnim(1);
    setIsVisibleReadQR(false);
  };

  // Animation
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      fadeOut();
    });
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setZIndexAnim(-1);
    });
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
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang ? lang.screen_wallet.table_head_send : ''}
          </Text>
        </View>
      </View>
      <ScrollView overScrollMode="never">
        <View style={{backgroundColor: '#fff'}}>
          <View style={styles.partTop}>
            <Text style={styles.currencyName}>{dataWallet.symbol}</Text>
            <View style={styles.partScanQR}>
              <Text style={styles.balance}>
                Balance: {balance}
                {dataWallet.symbol}
              </Text>
              <TouchableOpacity
                style={styles.scanQRCode}
                activeOpacity={0.7}
                onPress={onQRCodeScan}>
                <Image
                  source={require('../../../assets/images/scanqr.png')}
                  style={{width: 30, height: 30}}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.partBottom}>
            <CustomInputWallet
              value={amount}
              setValue={setAmount}
              isNumber
              label={`${
                lang && lang ? lang.screen_send.send_amount_label : ''
              }`}
              placeholder={`${
                lang && lang ? lang.screen_send.send_amount_placeholder : ''
              }`}
            />

            <CustomInputWallet
              value={address}
              setValue={setAddress}
              label={`${
                lang && lang ? lang.screen_send.send_address_label : ''
              }`}
              placeholder={`${
                lang && lang ? lang.screen_send.send_address_placeholder : ''
              }`}
            />

            <CustomInputWallet
              value={`${limitTransfer}${dataWallet.symbol}`}
              readonly
              label={`${
                lang && lang ? lang.screen_send.send_availables_label : ''
              }`}
            />
          </View>
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableOpacity
          onPress={onSend}
          style={styles.button}
          activeOpacity={0.6}>
          <Image
            source={
              isIconNextDisabled
                ? require('../../../assets/images/ico-btn-passive.png')
                : require('../../../assets/images/ico-btn-active.png')
            }
            resizeMode="contain"
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Scan QR code */}
      {isVisibleReadQR && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            zIndex: 20,
          }}>
          <BarcodeScanner
            shouldScan={true}
            onBarcodesDetected={handleQRCodeRead}
            scanBarcode={true}
            showFrame={true}>
            <BarcodeMask
              width={280}
              height={280}
              showAnimatedLine={true}
              outerMaskOpacity={1}
              edgeHeight={48}
              edgeWidth={48}
              animatedLineColor={'#FFFFFF'}
              animatedLineHeight={3}
              backgroundColor={'rgba(3, 3, 3, 0.3)'}
              animatedLineWidth={204}
              lineAnimationDuration={2000}
            />
          </BarcodeScanner>
        </View>
      )}
      <Animated.View
        style={{
          alignItems: 'center',
          position: 'absolute',
          bottom: 40,
          right: 0,
          left: 0,
          zIndex: zIndexAnim,
          opacity: fadeAnim,
        }}>
        <View
          style={{
            backgroundColor: 'rgb(65, 65, 65)',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            maxWidth: 300,
          }}>
          <Image
            source={require('../../../assets/images/xrun_round.png')}
            style={{width: 28, height: 28}}
          />
          <Text style={styles.notificationTextInQR}>Scanned: {address}</Text>
        </View>
      </Animated.View>
      {isPopupSend && (
        <View style={styles.popupConversion}>
          <View style={styles.wrapperConversion}>
            <View style={styles.wrapperPartTop}>
              <Text style={styles.textChange}>
                {lang && lang ? lang.screen_notify.send : ''}{' '}
              </Text>
              <Text style={styles.textCheckInformation}>
                {lang && lang
                  ? lang.screen_conversion.check_conversion_desc
                  : ''}
              </Text>
            </View>
            <View style={styles.contentConversion}>
              {isPopupSendConfirmation ? (
                <>
                  {/* With total transfer */}
                  <View style={styles.wrapperTextConversion}>
                    <Text style={styles.textPartLeft}>
                      {' '}
                      {lang && lang ? lang.screen_setting.close.desc.clo2 : ''}
                    </Text>
                    <Text style={styles.textPartRight}>
                      {amount}
                      {dataWallet.symbol}
                    </Text>
                  </View>
                  <View style={styles.wrapperTextConversion}>
                    <Text style={styles.textPartLeft}>
                      {lang && lang
                        ? lang.screen_complete_send.wallet_address
                        : ''}
                    </Text>
                    <Text style={[styles.textPartRight, {maxWidth: 180}]}>
                      {address}
                    </Text>
                  </View>
                  <View>
                    <View style={styles.wrapperTextConversion}>
                      <Text style={styles.textPartLeft}>
                        {lang && lang ? lang.screen_send.estimated_gas_fee : ''}
                      </Text>
                      <Animated.Text
                        style={{
                          opacity: fadeAnimEstimatedGas,
                        }}>
                        <Text style={styles.textPartRight}>
                          {totalGasCost === '???'
                            ? totalGasCost
                            : `${parseFloat(totalGasCost)
                                .toString()
                                .substring(0, 12)}${network}`}
                        </Text>
                      </Animated.Text>
                    </View>
                  </View>
                  <View style={styles.wrapperTextConversion}>
                    <Text style={styles.textPartLeft}>
                      {' '}
                      {lang && lang ? lang.screen_advertise.total : ''}
                    </Text>
                    <Animated.Text
                      style={{
                        opacity: fadeAnimEstimatedGas,
                      }}>
                      <Text style={styles.textPartRight}>
                        {totalTransfer.toString().substring(0, 12)}
                        {network}
                      </Text>
                    </Animated.Text>
                  </View>
                  {isInsufficientBalance && (
                    <View style={styles.wrapperTextConversion}>
                      <Text style={[styles.textPartLeft, {color: 'red'}]}>
                        {lang && lang
                          ? lang.screen_send.note_insufficient_balance.note1
                          : ''}
                        <Text style={{textTransform: 'capitalize'}}>
                          {' '}
                          {network === 'ETH'
                            ? 'ethereum'
                            : dataWallet.displaystr}{' '}
                        </Text>
                        {lang && lang
                          ? lang.screen_send.note_insufficient_balance.note2
                          : ''}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  {/* Without total transfer */}
                  <View style={styles.wrapperTextConversion}>
                    <Text style={styles.textPartLeft}>
                      {lang && lang ? lang.screen_setting.close.desc.clo2 : ''}
                    </Text>
                    <Text style={styles.textPartRight}>
                      {amount}
                      {dataWallet.symbol}
                    </Text>
                  </View>
                  <View style={styles.wrapperTextConversion}>
                    <Text style={styles.textPartLeft}>
                      {lang && lang
                        ? lang.screen_complete_send.wallet_address
                        : ''}
                    </Text>
                    <Text style={[styles.textPartRight, {maxWidth: 180}]}>
                      {address}
                    </Text>
                  </View>
                  <View>
                    <View style={styles.wrapperTextConversion}>
                      <Text style={styles.textPartLeft}>
                        {lang && lang ? lang.screen_send.estimated_gas_fee : ''}
                      </Text>
                      <Animated.Text
                        style={{
                          opacity: fadeAnimEstimatedGas,
                        }}>
                        <Text style={styles.textPartRight}>
                          {totalGasCost === '???'
                            ? totalGasCost
                            : `${parseFloat(totalGasCost)
                                .toString()
                                .substring(0, 12)}${network}`}
                        </Text>
                      </Animated.Text>
                    </View>
                  </View>
                  <View style={styles.wrapperTextConversion}>
                    <Text style={[styles.textPartLeft, {color: 'red'}]}>
                      {lang && lang ? lang.screen_send.notes.note1 : ''}
                      <Text style={{textTransform: 'lowercase'}}>
                        {' '}
                        {network === 'ETH'
                          ? 'ethereum'
                          : dataWallet.displaystr}{' '}
                      </Text>
                      {lang && lang ? lang.screen_send.notes.note2 : ''}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View style={styles.wrapperButton}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.buttonConfirm}
                onPress={cancelGasEstimated}>
                <Text style={styles.textButtonConfirm}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.buttonConfirm,
                  {
                    backgroundColor: `${
                      isDisableButtonConfirm ? '#ccc' : '#343c5a'
                    }`,
                    flex: 1.5,
                  },
                ]}
                disabled={isDisableButtonConfirm}
                onPress={onConfirmSend}>
                <Text style={[styles.textButtonConfirm, {color: '#fff'}]}>
                  {isPopupSendConfirmation
                    ? lang && lang
                      ? lang.screen_send.confirm
                      : ''
                    : lang && lang
                    ? lang.screen_send.next
                    : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SendWalletScreen;
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
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
  },
  balance: {
    color: '#fff',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('note'),
  },
  partBottom: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 30,
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
    height: 80,
    width: 80,
  },
  partScanQR: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  scanQRCode: {
    backgroundColor: '#fff',
    width: 30,
  },
  wrapperTextScanQR: {
    position: 'absolute',
    bottom: 40,
  },
  textScanQR: {
    color: '#fff',
    fontFamily: getFontFam() + 'Regular',
  },
  notificationTextInQR: {
    color: '#fff',
    fontFamily: getFontFam() + 'Regular',
    margin: 0,
    maxWidth: 240,
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
    maxWidth: 350,
  },
  wrapperPartTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 10,
  },
  textChange: {
    fontFamily: 'Poppins-Medium',
    color: '#000',
    textTransform: 'uppercase',
    fontSize: fontSize('body'),
  },
  textCheckInformation: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize('note'),
    color: '#000',
  },
  contentConversion: {
    borderTopColor: '#343c5a',
    borderTopWidth: 2,
    marginHorizontal: 20,
    paddingVertical: 14,
    rowGap: 24,
  },
  wrapperTextConversion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  textPartLeft: {
    color: '#aaa',
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize('body'),
  },
  textPartRight: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize('body'),
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
