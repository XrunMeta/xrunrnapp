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
import React, {useState, useEffect} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import ButtonBack from '../../components/ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInputWallet from '../../components/CustomInputWallet';
import {URL_API, getLanguage2, getFontFam} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  request,
  PERMISSIONS,
  check,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

const SendWalletScreen = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [iconNextIsDisabled, setIconNextIsDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const {dataWallet} = route.params;
  const [selectedExchange, setSelectedExchange] = useState('360001');
  const [isVisibleReadQR, setIsVisibleReadQR] = useState(false);
  const [dataMember, setDataMember] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [cointrace, setCointrace] = useState([]);
  const [popupSend, setPopupSend] = useState(false);

  // Animated notification in QR
  const [fadeAnim] = useState(new Animated.Value(0));
  const [zIndexAnim, setZIndexAnim] = useState(-1);

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

  // List stock exchange
  useEffect(() => {
    const cointrace = async () => {
      try {
        const response = await fetch(`${URL_API}&act=ap4300-cointrace`);
        const result = await response.json();
        setCointrace(result.data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        Alert.alert('Error get data listCrypto: ', err);
        console.log('Error get data listCrypto: ', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    cointrace();
  }, []);

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
    if (amount === '' || amount > parseFloat(dataWallet.Wamount).toString()) {
      setIconNextIsDisabled(true);
    } else if (amount == 0) {
      setIconNextIsDisabled(true);
    } else if (address === '' || address.length < 40) {
      setIconNextIsDisabled(true);
    } else {
      setIconNextIsDisabled(false);
    }
  }, [amount, address]);

  const onBack = () => {
    navigation.navigate('WalletHome');
  };

  const onSend = () => {
    const balance = parseFloat(dataWallet.Wamount).toString();

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
      setPopupSend(true);
    }
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

  const cancelSend = () => {
    setPopupSend(false);
  };

  const confirmSend = () => {
    setIsLoading(true);
    const currency = dataWallet.currency;

    // Get limit transfer
    fetch(
      `${URL_API}&act=ap4300-getLimitTransfer&member=${dataMember.member}&currency=${currency}&amountrq=${amount}`,
      {
        method: 'POST',
      },
    )
      .then(response => response.json())
      .then(result => {
        const {avaliable} = result;

        if (avaliable === 'OK') {
          fetch(
            // Transfer by stock exchange
            `${URL_API}&act=ap4300-03&member=${dataMember.member}&addrto=${address}&currency=${currency}&amount=${amount}&coinmarket=${selectedExchange}`,
            {
              method: 'POST',
            },
          )
            .then(result => result.json())
            .then(() => {
              const token = currency == 1 ? 'xr' : 'et';
              // Transfer coin
              fetch(
                `${URL_API}&act=postTransfer&member=${dataMember.member}&to=${address}&token=${token}&amount=${amount}`,
                {
                  method: 'POST',
                },
              )
                .then(result => result.json())
                .then(response => {
                  const {status, hash} = response;
                  const balance = parseFloat(dataWallet.Wamount).toString();

                  console.log(`Status: ${status}, Hash: ${hash} Post Transfer`);
                  if (status == 'success') {
                    setIsLoading(false);
                    setAddress('');
                    setAmount('');
                    setSelectedExchange('360001');
                    navigation.navigate('CompleteSend', {
                      amount,
                      addrto: address,
                      txid: hash,
                      symbol: dataWallet.symbol,
                      balance,
                    });
                  } else {
                    setIsLoading(false);
                    setPopupSend(false);
                    setAddress('');
                    setAmount('');
                    setSelectedExchange('360001');
                    Alert.alert('', 'Blockchain has problem or delay.');
                  }
                })
                .catch(err => {
                  Alert.alert('', 'Transfer failed: ', err);
                  console.log('Transfer failed postTransfer: ', err);
                  crashlytics().recordError(new Error(err));
                  crashlytics().log(err);
                });
            })
            .catch(err => {
              Alert.alert('', 'Transfer failed: ', err);
              console.log('Transfer failed ap4300-03: ', err);
              crashlytics().recordError(new Error(err));
              crashlytics().log(err);
            });
        } else {
          setIsLoading(false);
          Alert.alert(
            '',
            lang && lang ? lang.screen_send.send_enough_money : '',
          );
        }
      })
      .catch(err => {
        Alert.alert('', 'Check limit transfer failed: ', err);
        setIsLoading(false);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      });
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
                Balance: {parseFloat(dataWallet.Wamount)}
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
              value={`${dataWallet.limitTransfer}${dataWallet.symbol}`}
              readonly
              label={`${
                lang && lang ? lang.screen_send.send_availables_label : ''
              }`}
            />
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
            backgroundColor: '#000',
          }}>
          <QRCodeScanner
            showMarker={true}
            markerStyle={{borderColor: '#26d2ff'}}
            cameraStyle={{height: '100%'}}
            onRead={handleQRCodeRead}
            bottomContent={
              <View style={styles.wrapperTextScanQR}>
                <Text style={styles.textScanQR}>Scan Account</Text>
              </View>
            }
          />
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

      {popupSend && (
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
                  {lang && lang ? lang.screen_complete_send.wallet_address : ''}
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
                  <Text style={styles.textPartRight}>{'< 0.003 eth'}</Text>
                </View>
                <View style={styles.wrapperTextConversion}>
                  <Text
                    style={[
                      styles.textPartLeft,
                      {color: 'red', marginTop: 10},
                    ]}>
                    {lang && lang ? lang.screen_send.note : ''}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.wrapperButton}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.buttonConfirm}
                onPress={cancelSend}>
                <Text style={styles.textButtonConfirm}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.buttonConfirm,
                  {backgroundColor: '#343c5a', flex: 1.5},
                ]}
                onPress={confirmSend}>
                <Text style={[styles.textButtonConfirm, {color: '#fff'}]}>
                  {lang && lang ? lang.screen_wallet.confirm_alert : ''}
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
    fontSize: 22,
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
    fontSize: 16,
  },
  balance: {
    color: '#fff',
    fontFamily: getFontFam() + 'Regular',
    fontSize: 13,
  },
  partBottom: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 80,
    gap: 30,
  },
  button: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 24,
    marginTop: 30,
    marginBottom: 10,
    justifyContent: 'flex-end',
  },
  buttonImage: {
    height: 95,
    width: 95,
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
