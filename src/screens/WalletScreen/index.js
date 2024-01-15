import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import Clipboard from '@react-native-clipboard/clipboard';
import {TabView, SceneMap} from 'react-native-tab-view';
import TableWalletCard from '../../components/TableWallet';
import {URL_API, getLanguage} from '../../../utils';
import ShowQRWallet from '../../components/ShowQRWallet';

const WalletScreen = ({navigation, route}) => {
  const [lang, setLang] = useState({});
  const layout = useWindowDimensions();
  const [member, setMember] = useState('');
  const [currentCurrency, setCurrentCurrency] = useState('1');
  const [dataWallet, setDataWallet] = useState({});
  const [index, setIndex] = useState(0);
  const [cardsData, setCardsData] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const refLayout = useRef(null);

  // State show text "QR Code"
  const [isShowTextQRCode, setIsShowTextQRCode] = useState(false);
  const [positionVerticalDots, setPositionVerticalDots] = useState(0);

  // State for show QR
  const [isShowQRCodeWallet, setIsShowQRCodeWallet] = useState(false);
  const [cardDataQR, setCardDataQR] = useState([]);

  // State for send to component TableWallet => Total history, transfer history, Received details, Transition history
  const [emptyWallet, setEmptyWallet] = useState(false);

  useEffect(() => {
    // Get Language Data
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage(currentLanguage, 'screen_wallet');

        // Set your language state
        setLang(screenLang);
      } catch (err) {
        console.error('Error in fetchData:', err);
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
      }
    };

    getMember();
  }, []);

  useEffect(() => {
    // Get data member
    const getUserData = async () => {
      try {
        if (member !== '') {
          // Get data wallet
          fetch(`${URL_API}&act=app4000-01-rev&member=${member}`, {
            method: 'POST',
          })
            .then(response => response.json())
            .then(result => {
              setCardsData(result.data);
              setIsLoading(false);
              setRoutes(result.data.map(card => ({key: card.currency})));
            })
            .catch(error => {
              Alert.alert(
                `${lang.failed_alert ? lang.failed_alert : ''}`,
                `${
                  lang.failed_getwallet_alert ? lang.failed_getwallet_alert : ''
                }`,
                [
                  {
                    text: lang.confirm_alert ? lang.confirm_alert : '',
                    onPress: () =>
                      console.log('Failed get wallet data: ', error),
                  },
                ],
              );
              setIsLoading(false);
            });
        }
      } catch (err) {
        console.error('Failed to get userData from AsyncStorage:', err);
        setIsLoading(false);
      }
    };

    getUserData();
  }, [member]);

  useEffect(() => {
    if (cardsData.length > 0 && refLayout.current) {
      refLayout.current.measure((x, y, width, height, pageX, pageY) => {
        setPositionVerticalDots(pageY);
      });
    }

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

  const renderScene = SceneMap(
    Object.fromEntries(
      cardsData.map(cardData => [
        cardData.currency,
        () => routeComponent(cardData, copiedHash, handleShowQR),
      ]),
    ),
  );

  const routeComponent = (cardData, copiedHash, handleShowQR) => {
    const {
      amount: tempAmount,
      Wamount: tempWamount,
      symbol,
      address,
      displaystr,
      symbolimg,
      currency,
      Eamount,
      countrysymbol,
    } = cardData;

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

    const walletColor = walletColors[symbol] || walletColors['DIGX'];
    return (
      <View
        style={[styles.card, {backgroundColor: walletColor}]}
        key={currency}>
        <View style={styles.wrapperPartTop}>
          <Text style={styles.cardName}>{displaystr}</Text>
          <View style={styles.wrapperShowQR}>
            <TouchableOpacity
              style={styles.wrapperDots}
              activeOpacity={0.6}
              onPress={() => handleShowQR(cardData)}>
              <View style={styles.dot}></View>
              <View style={styles.dot}></View>
              <View style={styles.dot}></View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.containerTextWallet}>
          <View style={styles.wrapperTextwallet}>
            <Text style={styles.textWallet}>
              {lang.possess ? lang.possess : ''}
            </Text>
            <Text style={styles.valueWallet}>
              {Wamount.replaceAll('.', ',')}
            </Text>
            <Text style={styles.textWallet}>{symbol}</Text>
          </View>

          <View style={styles.wrapperTextwallet}>
            <Text style={styles.textWallet}>
              {lang.catch ? lang.catch : ''}
            </Text>
            <Text style={styles.valueWallet}>
              {amount.replaceAll('.', ',')}
            </Text>
            <Text style={styles.textWallet}>
              {symbol}{' '}
              {symbol === 'XRUN'
                ? `≈${parseFloat(Eamount)
                    .toString()
                    .substring(0, 9)}${countrysymbol}`
                : ''}
            </Text>
          </View>
        </View>

        <View style={styles.wrapperPartBottom}>
          <View style={styles.wrapperCopiedHash}>
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
            source={{uri: `data:image/jpeg;base64,${symbolimg}`}}
            style={styles.logo}
          />
        </View>
      </View>
    );
  };

  const handleShowQR = cardData => {
    setCardDataQR(cardData);
    setIsShowTextQRCode(true);
  };

  const hideTextQRCode = () => {
    setIsShowTextQRCode(false);
  };

  const copiedHash = hash => {
    Clipboard.setString(hash);

    Alert.alert('', lang.copy_qrcode ? lang.copy_qrcode : '', [
      {
        text: lang.confirm_alert ? lang.confirm_alert : '',
      },
    ]);
  };

  const onBack = () => {
    navigation.navigate('Home');
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
          <Text style={styles.title}>{lang.title ? lang.title : ''}</Text>
        </View>
      </View>

      <View style={{flex: 1}}>
        <View style={styles.containerCard}>
          <ScrollView style={{flex: 1}}>
            <View style={styles.containerCard}>
              {emptyWallet || (
                <TabView
                  navigationState={{index, routes}}
                  renderScene={renderScene}
                  onIndexChange={index => {
                    setIndex(index);
                    setCurrentCurrency(routes[index].key);
                  }}
                  initialLayout={{width: layout.width}}
                  renderTabBar={() => null}
                  overScrollMode={'never'}
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

      {/* Show/Hide text "QR Code" */}
      {isShowTextQRCode && (
        <>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.showQRButton(positionVerticalDots)}
            onPress={() => {
              setIsShowTextQRCode(false);
              setIsShowQRCodeWallet(true);
            }}>
            <Text style={styles.textQRCode}>
              {lang.qrcode_show ? lang.qrcode_show : ''}
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
    </View>
  );
};

export default WalletScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  containerCard: {
    height: 240,
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
    fontFamily: 'Poppins-Bold',
    color: '#051C60',
    margin: 10,
  },
  card: {
    marginHorizontal: 28,
    marginTop: 20,
    padding: 20,
    paddingTop: 0,
    borderRadius: 8,
    height: 195,
    zIndex: 5,
  },
  wrapperPartTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
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
  showQRButton: positionY => ({
    position: 'absolute',
    backgroundColor: 'white',
    width: 200,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    zIndex: 2,
    top: positionY + 140,
    right: 56,
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
    fontFamily: 'Poppins-Medium',
    color: 'black',
    fontSize: 20,
  },
  containerTextWallet: {
    marginTop: 20,
  },
  wrapperTextwallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textWallet: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  valueWallet: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
  },
  wrapperPartBottom: {
    marginTop: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wrapperCopiedHash: {
    flexDirection: 'row',
    gap: 6,
  },
  wrapperHash: {
    flexDirection: 'row',
  },
  hash: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  logo: {
    height: 40,
    width: 40,
    marginTop: -6,
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
});
