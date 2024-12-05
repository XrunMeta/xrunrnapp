import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import Clipboard from '@react-native-clipboard/clipboard';
import TableWalletCard from '../../components/TableWallet';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  refreshBalances,
  gatewayNodeJS,
  saveLogsDB,
} from '../../../utils';
import ShowQRWallet from '../../components/ShowQRWallet';
import crashlytics from '@react-native-firebase/crashlytics';

const WalletScreen = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [member, setMember] = useState(0);
  const [currentCurrency, setCurrentCurrency] = useState('1');
  const [dataWallet, setDataWallet] = useState({});
  const [cardsData, setCardsData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [positionTextQRCode, setPositionTextQRCode] = useState(0);

  // State show text "QR Code"
  const [isShowTextQRCode, setIsShowTextQRCode] = useState(false);

  // State for show QR
  const [isShowQRCodeWallet, setIsShowQRCodeWallet] = useState(false);
  const [cardDataQR, setCardDataQR] = useState([]);

  const flatlistRef = useRef(null);

  const [statusOtherChain, setStatusOtherChain] = useState('off');

  // Popup retry calling API data wallet
  const [isPopupRetry, setIsPopupRetry] = useState(false);
  const [countRetryData, setCountRetryData] = useState(0);

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

    const getMember = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const member = JSON.parse(userData).member;
        setMember(member);

        saveLogsDB(
          '5000400',
          member,
          `${member} Entered Walletpage and yet not page shown`,
          `Entered Walletpage and yet not page shown`,
        );
      } catch (err) {
        console.log(`Failed get member from async storage: ${err}`);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        navigation.replace('Home');
      }
    };

    getMember();
  }, []);

  // Start Flatlist ref for after transfer success automatic move to XRUN card
  useEffect(() => {
    const timer = setTimeout(() => {
      if (flatlistRef.current && cardsData.length > 1 && route.params) {
        if (
          route.params.completeSend === 'true' ||
          route.params.completeConversion === 'true'
        ) {
          console.log('Move to XRUN card');
          flatlistRef.current.scrollToIndex({animated: true, index: 0});
        }
      }
    }, 100); // Delay to ensure FlatList is fully rendered
    return () => clearTimeout(timer);
  }, [flatlistRef, cardsData, route]);

  const getItemLayout = (data, index) => ({
    length: Dimensions.get('window').width,
    offset: Dimensions.get('window').width * index,
    index,
  });
  // End flatlist ref

  // Get data member and show the card list
  const getUserData = async () => {
    try {
      if (member) {
        // Get data wallet
        console.log('Load data wallet....');

        const body = {
          member,
          daysbefore: 7,
        };

        const result = await gatewayNodeJS('app4000-01-rev-01', 'POST', body);

        setCardsData(result.data);
        setIsLoading(false);
        console.log('Wallet data has been loaded');

        saveLogsDB(
          '5000401',
          member,
          `${member} See Wallets and completed load`,
          `User See Wallets and completed load with shown 7 days before`,
        );
      }
    } catch (err) {
      console.error('Failed to get userData from AsyncStorage:', err);
      setIsLoading(false);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      navigation.replace('Home');
    }
  };

  // Get status other chain, if off just show ETH network, if on show ALL network
  const requestStatusOtherChain = async member => {
    const body = {
      member,
    };

    const result = await gatewayNodeJS('showOtherChains', 'POST', body);
    const status = result.data[0].status;
    setStatusOtherChain(status.toLowerCase());
  };

  useEffect(() => {
    getUserData();

    if (member) {
      requestStatusOtherChain(member);
    }
  }, [member]);

  useEffect(() => {
    if (cardsData) {
      setIsPopupRetry(false);
    } else {
      setIsPopupRetry(true);
    }
  }, [cardsData]);

  useEffect(() => {
    // Get data current currency/wallet
    const filterDataWallet = cardsData.filter(wallet => wallet.currency == 1);
    setDataWallet(filterDataWallet[0]);
  }, [cardsData]);

  useEffect(() => {
    const filterDataWallet = cardsData.filter(
      wallet => wallet.currency == currentCurrency,
    );

    setDataWallet(filterDataWallet[0]);
  }, [currentCurrency]);

  // Refresh balance / Update amount
  useEffect(() => {
    refreshBalances(member);
  }, [member]);

  // Refresh app4000-01-rev-01
  useEffect(() => {
    if (route.params !== undefined) {
      if (
        route.params.completeSend === 'true' ||
        route.params.completeConversion === 'true'
      ) {
        setIsLoading(false);
        setCurrentCurrency('1');
      }
    }
  }, [route]);

  const uiCardWallet = (
    walletColors,
    displaystr,
    Wamount,
    Eamount,
    symbol,
    currency,
    limitTransfer,
    amount,
    countrysymbol,
    address,
    symbolimg,
    subcurrency,
    item,
  ) => {
    return (
      <View
        style={[styles.card, {backgroundColor: walletColors[symbol]}]}
        key={currency}>
        <View style={styles.wrapperPartTop}>
          <Text style={styles.cardName}>{displaystr}</Text>
          <View style={styles.wrapperShowQR}>
            <TouchableOpacity
              style={styles.wrapperDots}
              activeOpacity={0.6}
              onPress={event => handleShowQR(event, item)}>
              <View style={styles.dot}></View>
              <View style={styles.dot}></View>
              <View style={styles.dot}></View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.containerTextWallet}>
          <View style={styles.wrapperTextwallet}>
            <Text style={styles.textWallet}>
              {lang.screen_wallet.possess ? lang.screen_wallet.possess : ''}
            </Text>
            <Text style={[styles.valueWallet, {marginBottom: 3}]}>
              {Wamount}
            </Text>
            <Text style={styles.textWallet}>{symbol}</Text>
          </View>

          {currency == 1 && (
            <View style={styles.wrapperTextwallet}>
              <Text style={styles.textWallet}>
                {lang.screen_wallet.able_transfer
                  ? lang.screen_wallet.able_transfer
                  : ''}
              </Text>
              <Text style={styles.textWallet}>
                {limitTransfer}
                {symbol}
              </Text>
            </View>
          )}

          <View
            style={{
              opacity: subcurrency != 5000 && subcurrency != 5100 ? 0 : 1,
              ...styles.wrapperTextwallet,
            }}>
            <Text style={styles.textWallet}>
              {lang.screen_wallet.catch ? lang.screen_wallet.catch : ''}
            </Text>
            <Text style={[styles.valueWallet, {marginBottom: 2}]}>
              {amount}
            </Text>
            <Text style={styles.textWallet}>
              {symbol}{' '}
              {symbol === 'XRUN'
                ? `≈${Math.round(
                    parseFloat(Eamount).toString().substring(0, 9),
                  )}${countrysymbol}`
                : ''}
            </Text>
          </View>
        </View>

        <View style={styles.wrapperPartBottom}>
          <View style={styles.wrapperCopiedHash(currency)}>
            <View style={styles.wrapperHash}>
              <Text style={styles.hash}>
                {address.substring(0, 10) +
                  '...' +
                  address.substring(address.length - 10)}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => copiedHash(address)}>
              <Image
                source={require('../../../assets/images/clipboard.png')}
                style={{width: 15, height: 15}}
              />
            </TouchableOpacity>
          </View>

          <Image
            width={40}
            height={40}
            source={{
              uri: `data:image/jpeg;base64,${symbolimg}`,
            }}
            style={styles.logo(currency)}
          />
        </View>
      </View>
    );
  };

  const routeComponent = ({item}) => {
    const {
      limitTransfer,
      amount: tempAmount,
      Wamount: tempWamount,
      symbol,
      address,
      displaystr,
      symbolimg: tempSymbolimg,
      currency,
      Eamount,
      countrysymbol,
      subcurrency,
    } = item;

    const Wamount = parseFloat(tempWamount).toFixed(2);
    const amount = parseFloat(tempAmount).toFixed(2);

    // Hexa colors wallet
    const walletColors = {
      XRUN: '#187f9a',
      ETH: '#a84249',
      DIGX: '#343b58',
      RUN: '#DEA936',
      MEMP: '#4b5068',
      POL: '#9339D5',
      Q8p: '#9339D5',
      BNB: '#f0b90b',
    };

    const symbolimg = tempSymbolimg.replace(/(\r\n|\n|\r)/gm, '');

    if (statusOtherChain === 'on') {
      // If status other chain == on show all networks, like ETH, MATIC, BNB, etc...
      return uiCardWallet(
        walletColors,
        displaystr,
        Wamount,
        Eamount,
        symbol,
        currency,
        limitTransfer,
        amount,
        countrysymbol,
        address,
        symbolimg,
        subcurrency,
        item,
      );
    } else {
      // If status other chain == off just show ETH network
      if (subcurrency == 5000 || subcurrency == 5100) {
        return uiCardWallet(
          walletColors,
          displaystr,
          Wamount,
          Eamount,
          symbol,
          currency,
          limitTransfer,
          amount,
          countrysymbol,
          address,
          symbolimg,
          subcurrency,
          item,
        );
      }
    }
  };

  const handleShowQR = (event, cardData) => {
    setPositionTextQRCode(event.nativeEvent.pageY);
    setCardDataQR(cardData);
    setIsShowTextQRCode(true);
  };

  const hideTextQRCode = () => {
    setIsShowTextQRCode(false);
  };

  const copiedHash = hash => {
    Clipboard.setString(hash);

    Alert.alert(
      '',
      lang.screen_wallet.copy_qrcode ? lang.screen_wallet.copy_qrcode : '',
      [
        {
          text: lang.screen_wallet.confirm_alert
            ? lang.screen_wallet.confirm_alert
            : '',
        },
      ],
    );
  };

  const onBack = () => {
    navigation.navigate('Home');
  };

  const reloadDataWallet = () => {
    setCountRetryData(prev => prev + 1);
    setIsLoading(true);
    setIsPopupRetry(false);

    getUserData();
    requestStatusOtherChain(member);
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
            {lang && lang.screen_wallet ? lang.screen_wallet.title : ''}
          </Text>
        </View>
      </View>

      <View style={{flex: 1}}>
        <View style={styles.containerCard}>
          <ScrollView style={{flex: 1}}>
            <View style={styles.containerCard}>
              <FlatList
                ref={flatlistRef}
                data={cardsData}
                renderItem={routeComponent}
                getItemLayout={getItemLayout}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={event => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x /
                      event.nativeEvent.layoutMeasurement.width,
                  );
                  setCurrentCurrency(cardsData[index].currency);
                }}
              />
            </View>
          </ScrollView>
        </View>

        <View style={styles.containerTable}>
          <TableWalletCard
            member={member}
            dataWallet={dataWallet}
            currentCurrency={currentCurrency}
            lang={lang}
            route={route}
          />
        </View>
      </View>

      {isShowTextQRCode && (
        <>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.showQRButton(positionTextQRCode)}
            onPress={() => {
              setIsShowTextQRCode(false);
              setIsShowQRCodeWallet(true);
            }}>
            <Text style={styles.textQRCode}>
              {lang.screen_wallet.qrcode_show
                ? lang.screen_wallet.qrcode_show
                : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={hideTextQRCode}
            style={styles.backgroundShowQR}></TouchableOpacity>
        </>
      )}

      {/* Show/Hide popup QR */}
      {isShowQRCodeWallet && (
        <ShowQRWallet
          cardDataQR={cardDataQR}
          setIsShowQRCodeWallet={setIsShowQRCodeWallet}
          lang={lang}
          member={member}
        />
      )}

      {/* Popup retry calling data the wallet */}
      {isPopupRetry && lang && (
        <View style={styles.popupRetry}>
          <View style={styles.wrapper}>
            <Text style={styles.textRetry}>
              {countRetryData >= 3
                ? lang.screen_wallet.wallet_error
                  ? lang.screen_wallet.wallet_error
                  : ''
                : lang.screen_wallet.retry_load_wallet
                ? lang.screen_wallet.retry_load_wallet
                : ''}
            </Text>
            {countRetryData >= 3 ? (
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  marginTop: 24,
                  alignItems: 'center',
                }}
                onPress={() => navigation.replace('Home')}>
                <Text
                  style={{
                    color: '#2563eb',
                    textDecorationLine: 'underline',
                    fontFamily: getFontFam() + 'Regular',
                    fontSize: fontSize('note'),
                  }}>
                  {lang.screen_wallet.go_home}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={reloadDataWallet}
                activeOpacity={0.5}
                style={{
                  marginTop: 24,
                  alignItems: 'center',
                }}>
                <Image
                  source={require('../../../assets/images/reload.png')}
                  width={24}
                  height={24}
                  style={{
                    height: 24,
                    width: 24,
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default WalletScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  containerCard: {
    height: 260,
  },
  containerTable: {
    flex: 1,
  },
  titleWrapper: {
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: 'white',
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
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    paddingTop: 0,
    borderRadius: 8,
    height: 220,
    zIndex: 5,
    width: Dimensions.get('window').width - 40,
  },
  wrapperPartTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    color: 'white',
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('title'),
    paddingTop: 20,
  },
  wrapperShowQR: {
    position: 'relative',
  },
  wrapperDots: {
    flexDirection: 'row',
    gap: 4,
    paddingTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: 'white',
  },
  showQRButton: positionTextQRCode => ({
    position: 'absolute',
    backgroundColor: 'white',
    width: 180,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    zIndex: 2,
    top:
      Platform.OS === 'ios' ? positionTextQRCode + 20 : positionTextQRCode + 30,
    right: 48,
  }),
  backgroundShowQR: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  textQRCode: {
    fontFamily: getFontFam(),
    color: 'black',
    fontSize: fontSize('subtitle'),
  },
  containerTextWallet: {
    marginTop: 20,
  },
  wrapperTextwallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textWallet: {
    color: 'white',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
  },
  valueWallet: {
    color: 'white',
    fontFamily:
      Platform.OS === 'ios' ? 'AppleSDGothicNeo-Bold' : 'Roboto-Medium',
    fontSize: fontSize('subtitle'),
    marginHorizontal: -3,
  },
  wrapperPartBottom: {
    marginTop: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'flex-end',
  },
  wrapperCopiedHash: currency => ({
    flexDirection: 'row',
    gap: 6,
    marginTop: currency == 1 ? 0 : 24,
  }),
  wrapperHash: {
    flexDirection: 'row',
  },
  hash: {
    color: 'white',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
  },
  logo: currency => ({
    height: 40,
    width: 40,
    marginTop: currency == 1 ? -12 : 14,
  }),
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
  popupRetry: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 20,
  },
  wrapper: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    width: '100%',
    padding: 14,
  },
  textRetry: {
    textAlign: 'center',
    color: '#000',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
  },
});
