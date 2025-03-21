import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInputWallet from '../../components/CustomInputWallet';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  gatewayNodeJS,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';

const Change = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [isIconNextDisabled, setIsIconNextDisabled] = useState(true);
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

  // Transfer Ticket Modal
  const [isTransferTicketModalVisible, setIsTransferTicketModalVisible] =
    useState(false);

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
          const body = {
            member: dataMember.member,
            currency,
          };

          const result = await gatewayNodeJS(
            'app4300-temp-amount',
            'POST',
            body,
          );

          const results = result.data;
          const balance = results[0].amount;
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
    if (amount) {
      setIsIconNextDisabled(false);
    } else {
      setIsIconNextDisabled(true);
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
    } else {
      setPopupConversion(true);
      setConversionRequest(parseFloat(amount).toFixed(9));
      Keyboard.dismiss();
    }
  };

  const cancelConversion = () => {
    setPopupConversion(false);
    setIsIconNextDisabled(false);
  };

  const closeTransferTicketModal = () => {
    setIsTransferTicketModalVisible(false);
    navigation.replace('WalletHome');
  };

  const navigateToShop = () => {
    setIsTransferTicketModalVisible(false);
    navigation.replace('ShopHome', {memberID: dataMember?.member});
  };

  const confirmConversion = async () => {
    if (isNaNCoverted) {
      Alert.alert('', 'Invalid input amount.');
      setPopupConversion(false);
    } else {
      setIsLoading(true);

      try {
        let result;
        // let transferTicket = null;

        // if (currency == 16) {
        //   // Cek tiket transfer
        //   const ticketResponse = await gatewayNodeJS(
        //     'getDataActiveItem',
        //     'POST',
        //     {
        //       member: dataMember.member,
        //     },
        //   );

        //   transferTicket =
        //     ticketResponse.status === 'success' &&
        //     ticketResponse.data.find(item => item.item == 1);

        //   if (!transferTicket) {
        //     setIsLoading(false);
        //     setIsTransferTicketModalVisible(true);
        //     return;
        //   }
        // }

        const body = {
          member: dataMember.member,
          currency,
          amount: String(amount),
        };
        result = await gatewayNodeJS('app4420-02-conv', 'POST', body);

        // if (currency == 16 && transferTicket) {
        //   // Gunakan tiket transfer
        //   const useTicket = await gatewayNodeJS('useInappStorage', 'POST', {
        //     member: dataMember.member,
        //     storage: transferTicket.storage,
        //   });

        //   if (
        //     !(
        //       useTicket.status === 'success' &&
        //       useTicket.data[0].affectedRows > 0
        //     )
        //   ) {
        //     throw new Error('Failed to use transfer ticket');
        //   }
        // }

        setIsLoading(false);
        setPopupConversion(false);
        setAmount('');
        setAddress('');
        setSymbol('XRUN');

        console.log(
          `Success conversion request: ${result?.data?.[0]?.count || 'N/A'}`,
        );

        navigation.navigate('CompleteConversion', {
          symbol,
          estimate,
          amount,
          currency,
          originamount: amount,
          left: 0,
        });

        setIsIconNextDisabled(false);
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
        navigation.replace('Home');
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={styles.container}>
        {/* Loading */}
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size={'large'} color={'#fff'} />
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Poppins-Regular',
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
              {lang && lang ? lang.screen_conversion.title : ''}
            </Text>
          </View>
        </View>

        <ScrollView
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <View style={{backgroundColor: '#fff'}}>
            <View style={styles.partTop}>
              {/* <Text style={styles.currencyName}>-</Text> */}
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

              <View style={styles.wrapperInput}>
                <CustomInputWallet
                  value={amount}
                  setValue={setAmount}
                  isNumber
                  labelVisible={false}
                  placeholder={
                    lang && lang ? lang.screen_conversion.input_convert : ''
                  }
                />
              </View>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1}}>
            <ButtonNext onClick={onSend} isDisabled={isIconNextDisabled} />
          </KeyboardAvoidingView>
        </ScrollView>

        {/* Conversion Confirmation Popup */}
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
                  <Text style={styles.textButtonConfirm}>
                    {lang && lang ? lang.complete_exchange.cancel_exchange : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.buttonConfirm,
                    {backgroundColor: '#343c5a', flex: 1},
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
    fontSize: fontSize('subtitle'),
  },
  balance: {
    color: '#fff',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
  },
  partBottom: {
    paddingHorizontal: 20,
    paddingVertical: 34,
  },
  selectNetwork: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
  description: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
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
    fontFamily: getFontFam() + 'Medium',
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
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  wrapperConversion: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    width: '100%',
  },
  wrapperPartTop: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 10,
  },
  textChange: {
    fontFamily: getFontFam() + 'Medium',
    color: '#000',
    textTransform: 'uppercase',
    fontSize: fontSize('body'),
  },
  textCheckInformation: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: '#000',
  },
  contentConversion: {
    borderTopColor: '#343c5a',
    borderTopWidth: 2,
    marginHorizontal: 10,
    paddingVertical: 14,
    rowGap: 28,
    marginTop: 6,
  },
  wrapperTextConversion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
  },
  textPartLeft: {
    color: '#000',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
  },
  textPartRight: {
    color: '#000',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    maxWidth: 120,
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
    fontFamily: getFontFam() + 'Medium',
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
