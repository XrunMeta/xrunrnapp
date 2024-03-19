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
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import Clipboard from '@react-native-clipboard/clipboard';
import TableWalletCard from '../../components/TableWallet';
import {URL_API, getLanguage2, getFontFam} from '../../../utils';
import ShowQRWallet from '../../components/ShowQRWallet';
import crashlytics from '@react-native-firebase/crashlytics';

const WalletScreen = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [member, setMember] = useState('');
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

  const [emptyWallet, setEmptyWallet] = useState(false);

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

    const getMember = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        const member = JSON.parse(userData).member;
        setMember(member);
      } catch (err) {
        console.log(`Failed get member from async storage: ${err}`);
        Alert.alert('', `Failed get member from async storage`);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    getMember();
  }, []);

  // Get data member
  const getUserData = async () => {
    try {
      if (member !== '') {
        // Get data wallet
        fetch(
          `${URL_API}&act=app4000-01-rev-01&member=${member}&daysbefore=7`,
          {
            method: 'POST',
          },
        )
          .then(response => response.json())
          .then(result => {
            setCardsData(result.data);
            setIsLoading(false);
          })
          .catch(error => {
            Alert.alert(
              '',
              `${
                lang.screen_wallet.failed_getwallet_alert
                  ? lang.screen_wallet.failed_getwallet_alert
                  : ''
              }`,
              [
                {
                  text: lang.screen_wallet.confirm_alert
                    ? lang.screen_wallet.confirm_alert
                    : '',
                  onPress: () => {
                    setIsLoading(false);
                  },
                },
              ],
            );
            crashlytics().recordError(new Error(error));
            crashlytics().log(error);
            setIsLoading(false);
          });
      }
    } catch (err) {
      console.error('Failed to get userData from AsyncStorage:', err);
      setIsLoading(false);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
    }
  };

  useEffect(() => {
    getUserData();
  }, [member]);

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

  // Refresh balance
  useEffect(() => {
    const refreshBalance = async () => {
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

    refreshBalance();
  }, [member]);

  // Refresh app4000-01-rev-01
  useEffect(() => {
    if (route.params !== undefined) {
      if (
        route.params.completeSend === 'true' ||
        route.params.completeConversion === 'true'
      ) {
        getUserData();
      }
    }
  }, [route]);

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
    } = item;

    const Wamount = parseFloat(tempWamount).toFixed(2);
    const amount = parseFloat(tempAmount).toFixed(2);

    // Hexa colors wallet
    const walletColors = {
      XRUN: '#187f9a',
      ETH: '#a84249',
      DIGX: '#343b58',
      RUN: '#DEA936',
      MEMP: '#343b58',
    };

    const symbolimg = tempSymbolimg.replace(/(\r\n|\n|\r)/gm, '');

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

          <View style={styles.wrapperTextwallet}>
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
              <Image source={require('../../../assets/images/clipboard.png')} />
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
            {lang && lang.screen_wallet ? lang.screen_wallet.title : ''}
          </Text>
        </View>
      </View>

      <View style={{flex: 1}}>
        <View style={styles.containerCard}>
          <ScrollView style={{flex: 1}}>
            <View style={styles.containerCard}>
              {emptyWallet || (
                <FlatList
                  data={cardsData}
                  renderItem={routeComponent}
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
              )}
            </View>
          </ScrollView>
        </View>

        <View style={styles.containerTable}>
          <TableWalletCard
            member={member}
            dataWallet={dataWallet}
            currentCurrency={currentCurrency}
            lang={lang}
            setEmptyWallet={setEmptyWallet}
            route={route}
          />
        </View>
      </View>

      {isShowTextQRCode && (
        <>
          <TouchableOpacity
            activeOpacity={0.9}
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
        />
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
    height: 230,
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
    fontSize: 22,
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
  card: {
    marginHorizontal: 28,
    marginTop: 20,
    padding: 20,
    paddingTop: 0,
    borderRadius: 8,
    height: 190,
    zIndex: 5,
    width: Dimensions.get('window').width - 58,
  },
  wrapperPartTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    color: 'white',
    fontFamily: getFontFam() + 'Regular',
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
    fontFamily: getFontFam() + 'Medium',
    color: 'black',
    fontSize: 20,
  },
  containerTextWallet: {
    marginTop: 20,
    gap: 4,
  },
  wrapperTextwallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textWallet: {
    color: 'white',
    fontFamily: getFontFam() + 'Regular',
    fontSize: 13,
  },
  valueWallet: {
    color: 'white',
    fontFamily:
      Platform.OS === 'ios' ? 'AppleSDGothicNeo-Bold' : 'Roboto-Medium',
    fontSize: 16,
    marginHorizontal: -3,
  },
  wrapperPartBottom: {
    marginTop: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wrapperCopiedHash: currency => ({
    flexDirection: 'row',
    gap: 6,
    marginTop: currency == 1 ? 0 : 20,
  }),
  wrapperHash: {
    flexDirection: 'row',
  },
  hash: {
    color: 'white',
    fontFamily: getFontFam() + 'Regular',
    fontSize: 12,
  },
  logo: currency => ({
    height: 40,
    width: 40,
    marginTop: currency == 1 ? -12 : -2,
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
});
