import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  PermissionsAndroid,
  Animated,
  ActivityIndicator,
  BackHandler,
  ScrollView,
  SafeAreaView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import ButtonBack from '../../components/ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInputWallet from '../../components/CustomInputWallet';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  refreshBalances,
  gatewayNodeJS,
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
import ButtonNext from '../../components/ButtonNext/ButtonNext';

const SendWalletScreen = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [balance, setBalance] = useState(0);
  const [limitTransfer, setLimitTransfer] = useState(0);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState(
    '0xd556B48f0675880E4AdbD8CAfD49a895623832fF',
  );

  // Transfer Ticket Modal
  const [isTransferTicketModalVisible, setIsTransferTicketModalVisible] =
    useState(false);

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
        navigation.replace('Home');
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
        navigation.replace('Home');
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
            console.log(newCount);
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

  const closeTransferTicketModal = () => {
    setIsTransferTicketModalVisible(false);
    navigation.replace('WalletHome');
  };

  const navigateToShop = () => {
    setIsTransferTicketModalVisible(false);
    navigation.replace('ShopHome', {memberID: dataMember?.member});
  };

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
      navigation.replace('Home');
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

      const body = {
        from: dataWallet.address,
        to: address,
        amount,
        token,
        network,
        chainId,
        priorityGasTracker,
      };

      const result = await gatewayNodeJS('gasEstimated', 'POST', body);
      const results = result.data;

      // If data array not empty from response API
      if (results.length > 0) {
        const gasEstimateFromAPI = results[0]['gasLimit'];
        const gasPriceFromAPI = results[0]['gasPrice'];
        const totalGasCostFromAPI = results[0]['totalGasCost'];

        console.log(`Total gas cost ${network}: ${totalGasCostFromAPI}`);
        if (!totalGasCostFromAPI || !gasEstimateFromAPI || !gasPriceFromAPI) {
          setIsLoading(false);
          Alert.alert(lang.global_error.network_busy);
          navigation.replace('Home');
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
        const messageResponse = result['message'];

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
      navigation.replace('Home');
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

    setIsIconNextDisabled(false);
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

    setIsIconNextDisabled(false);
  };

  // Get list stock exchange
  const stockExchange = async () => {
    try {
      const result = await gatewayNodeJS('ap4300-cointrace');
      const data = result.data;
      setCointrace(data);
      return data;
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error get data listCrypto: ', error);
      console.log('Error get data listCrypto: ', error);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      navigation.replace('Home');
    }
  };

  // Get balance
  const getBalance = async () => {
    try {
      const body = {
        member: dataMember.member,
        currency: dataWallet.currency,
      };

      const result = await gatewayNodeJS('app4300-temp-amount', 'POST', body);
      const results = result.data;

      if (results.length > 0) {
        setBalance(parseFloat(results[0].Wamount));
        setLimitTransfer(results[0].limittransfer);

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
        navigation.replace('Home');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error get data balance');
      console.log(`Error get data balance: ${error}`);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      navigation.replace('Home');
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
    if (amount || address) {
      setIsIconNextDisabled(false);
    } else {
      setIsIconNextDisabled(true);
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
            navigation.replace('Home');
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
      const body = {
        member: dataMember.member,
        currency,
        amountrq: amount,
      };

      const result = await gatewayNodeJS(
        'ap4300-getLimitTransfer',
        'POST',
        body,
      );
      const available = result.data[0].available;
      return available;
    } catch (error) {
      Alert.alert('Check limit transfer failed');
      console.log(`Check limit transfer failed: ${error}`);
      setIsLoading(false);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      navigation.replace('Home');
    }
  };

  // Transfer by stock exchange
  const transferByStockExchange = async () => {
    try {
      const body = {
        member: dataMember.member,
        addrto: address,
        currency,
        amount,
        coinmarket: selectedExchange,
      };

      const result = await gatewayNodeJS('ap4300-03', 'POST', body);
      const data = result.data[0].data;
      return data;
    } catch (error) {
      Alert.alert(lang.global_error.network_busy);
      console.log(`Transfer failed ap4300-03: ${error}`);
      gasEstimateNetworkBusy();
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      navigation.replace('Home');
    }
  };

  // Post transfer
  const postTransfer = async () => {
    try {
      // // For Polygon
      // if (currency == 16) {
      // Transfer ticket checker
      const ticketResponse = await gatewayNodeJS('getDataActiveItem', 'POST', {
        member: dataMember.member,
      });

      const transferTicket =
        ticketResponse.status === 'success' &&
        ticketResponse.data.find(item => item.item == 1);

      if (!transferTicket) {
        setIsLoading(false);
        setIsTransferTicketModalVisible(true);
        return;
      }
      // }

      const dataStockExchange = await transferByStockExchange();

      if (dataStockExchange) {
        const body = {
          to: address,
          amount,
          token,
          member: dataMember.member,
          gasEstimate,
          gasPrice,
          network,
          chainId,
        };

        const result = await gatewayNodeJS('postTransferNew', 'POST', body);
        const status = result.status;
        const hash = result.data[0].rtn.hash;

        if (!hash || hash === 'undefined') {
          Alert.alert(lang.screen_signup.validator.errorServer);
          gasEstimateNetworkBusy();
          setIsLoading(false);
          console.log('Transfer failed postTransfer');
          navigation.replace('Home');
          return;
        }

        console.log(
          `Transfer complete.... Token: ${token} | Status: ${status} | Hash: ${hash} | act=postTransferNew`,
        );

        if (status === 'success') {
          // if (currency == 16) {
          const useTicket = await gatewayNodeJS('useInappStorage', 'POST', {
            member: dataMember.member,
            storage: transferTicket.storage,
          });

          if (
            !(
              useTicket.status === 'success' &&
              useTicket.data[0].affectedRows > 0
            )
          ) {
            Alert.alert(lang.global_error.network_busy);
            console.log('Failed to use in-app storage');
            setIsLoading(false);
            return;
          }
          // }

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
          setIsIconNextDisabled(false);
        } else {
          Alert.alert(lang.global_error.network_busy);
          console.log('Transfer failed postTransfer');
          gasEstimateNetworkBusy();
          setIsLoading(false);
          navigation.replace('Home');
        }
      } else {
        Alert.alert(lang.global_error.network_busy);
        console.log(`Transfer failed ap4300-03: ${error}`);
        gasEstimateNetworkBusy();
        setIsLoading(false);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert(lang.global_error.network_busy);
      console.log(`Transfer failed postTransfer: ${error}`);
      gasEstimateNetworkBusy();
      setIsLoading(false);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      navigation.replace('Home');
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
        <ScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.partTop}>
            {/* <Text style={styles.currencyName}>{dataWallet.symbol}</Text> */}
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

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('CompleteSend', {
                amount: '0.00000002',
                addrto: '0x30a9B3fcFCc0aD66B70f2d473b39a35252002d89',
                txid: '0928x08291028kosieu920281',
                symbol: 'ETH',
              });
            }}></TouchableOpacity>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1}}>
            <ButtonNext onClick={onSend} isDisabled={isIconNextDisabled} />
          </KeyboardAvoidingView>
        </ScrollView>

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
                      <Text style={[styles.textPartLeft, {width: 120}]}>
                        {' '}
                        {lang && lang
                          ? lang.screen_setting.close.desc.clo2
                          : ''}
                      </Text>
                      <Text style={styles.textPartRight}>
                        {amount}
                        {dataWallet.symbol}
                      </Text>
                    </View>
                    <View style={styles.wrapperTextConversion}>
                      <Text style={[styles.textPartLeft, {width: 120}]}>
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
                        <Text style={[styles.textPartLeft, {width: 120}]}>
                          {lang && lang
                            ? lang.screen_send.estimated_gas_fee
                            : ''}
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
                      <Text style={[styles.textPartLeft, {width: 120}]}>
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
                        <Text
                          style={[
                            styles.textPartLeft,
                            {color: 'red', marginTop: 20},
                          ]}>
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
                      <Text style={[styles.textPartLeft, {width: 120}]}>
                        {lang && lang
                          ? lang.screen_setting.close.desc.clo2
                          : ''}
                      </Text>
                      <Text style={styles.textPartRight}>
                        {amount}
                        {dataWallet.symbol}
                      </Text>
                    </View>
                    <View style={styles.wrapperTextConversion}>
                      <Text style={[styles.textPartLeft, {width: 120}]}>
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
                        <Text style={[styles.textPartLeft, {width: 120}]}>
                          {lang && lang
                            ? lang.screen_send.estimated_gas_fee
                            : ''}
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
                      <Text
                        style={[
                          styles.textPartLeft,
                          {color: 'red', marginTop: 20},
                        ]}>
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
                      flex: 1,
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

        {/* No Transfer Ticket Modal */}
        <Modal
          visible={isTransferTicketModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeTransferTicketModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {(lang && lang.screen_wallet?.no_ticket_title) ||
                    'No Transfer Ticket'}
                </Text>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  {(lang && lang.screen_wallet?.no_ticket_message) ||
                    'You do not have a transfer ticket. Please purchase one from the shop before proceeding.'}
                </Text>
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={closeTransferTicketModal}>
                  <Text style={styles.modalButtonTextSecondary}>
                    {(lang && lang.screen_wallet?.close) || 'Close'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={navigateToShop}>
                  <Text style={styles.modalButtonTextPrimary}>
                    {(lang && lang.screen_wallet?.buy_ticket) || 'Buy Ticket'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    paddingHorizontal: 20,
    paddingVertical: 34,
    gap: 30,
    backgroundColor: 'white',
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
    fontSize: fontSize('body'),
    color: '#000',
  },
  contentConversion: {
    borderTopColor: '#343c5a',
    borderTopWidth: 2,
    marginHorizontal: 20,
    paddingVertical: 32,
    rowGap: 16,
  },
  wrapperTextConversion: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    gap: 12,
  },
  textPartLeft: {
    color: '#000',
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
    backgroundColor: '#D3D3D3',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButtonConfirm: {
    color: '#343c5a',
    fontFamily: 'Poppins-Medium',
    textTransform: 'uppercase',
    fontSize: fontSize('subtitle'),
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '85%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    color: '#343c5a',
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('subtitle'),
    textAlign: 'center',
  },
  modalBody: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalText: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#343c5a',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonTextPrimary: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: 'white',
  },
  modalButtonTextSecondary: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343c5a',
  },
});
