import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import Clipboard from '@react-native-clipboard/clipboard';
import {TabView, SceneMap} from 'react-native-tab-view';
import TableWalletCard from '../../components/TableWallet';

const langData = require('../../../lang.json');

const WalletScreen = ({navigation}) => {
  const [lang, setLang] = useState({});
  const [isShowTextQRCode, setIsShowTextQRCode] = useState(false);
  const [positionVerticalDots, setPositionVerticalDots] = useState(0);
  const layout = useWindowDimensions();
  const [currentToken, setCurrentToken] = useState('xrun');
  const [index, setIndex] = useState(0);
  const [cardsData, setCardsData] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const refLayout = useRef(null);

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
        const member = JSON.parse(userData).member;

        // Get data card
        fetch(
          `https://app.xrun.run/gateway.php?act=app4000-01-rev&member=${member}`,
        )
          .then(response => response.json())
          .then(result => {
            setCardsData(result.data);
            setRoutes(result.data.map(card => ({key: card.symbol})));

            setIsLoading(false);
          })
          .catch(error => {
            Alert.alert('Failed', `${error}`, [
              {
                text: 'OK',
                onPress: () => console.log('Failed get data card'),
              },
            ]);
          });
      } catch (err) {
        console.error('Failed to get userData from AsyncStorage:', err);
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    // Pastikan cardsData sudah terisi sebelum memanggil getYPosition

    if (cardsData.length > 0 && refLayout.current) {
      console.log('sip');
      refLayout.current.measure((x, y, width, height, pageX, pageY) => {
        console.log(pageY);
        setPositionVerticalDots(pageY);
      });
    }
  }, [cardsData]);

  const renderScene = SceneMap(
    Object.fromEntries(
      cardsData.map(card => [
        card.symbol,
        () => routeComponent(card, showTextQRCode, refLayout, copiedHash),
      ]),
    ),
  );

  const routeComponent = (cardData, showTextQRCode, refLayout, copiedHash) => {
    const {
      amount: tempAmount,
      Wamount: tempWamount,
      symbol,
      address,
      displaystr,
      symbolimg,
    } = cardData;

    const Wamount = parseFloat(tempWamount).toFixed(2);
    const amount = parseFloat(tempAmount).toFixed(2);

    return (
      <View style={styles.card(symbol)} key={symbol}>
        <View style={styles.wrapperPartTop}>
          <Text style={styles.cardName}>{displaystr}</Text>
          <View style={styles.wrapperShowQR}>
            <TouchableOpacity
              style={styles.wrapperDots}
              activeOpacity={0.6}
              onPress={showTextQRCode}>
              <View style={styles.dot}></View>
              <View style={styles.dot}></View>
              <View style={styles.dot}></View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.containerTextWallet}>
          <View style={styles.wrapperTextwallet}>
            <Text style={styles.textWallet}>Possess</Text>
            <Text style={styles.valueWallet}>{Wamount}</Text>
            <Text style={styles.textWallet}>{symbol}</Text>
          </View>

          <View style={styles.wrapperTextwallet}>
            <Text style={styles.textWallet}>Catch</Text>
            <Text style={styles.valueWallet}>{amount}</Text>
            <Text style={styles.textWallet}>XRUN</Text>
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

  const handleKeyCard = index => {
    switch (index) {
      case 0:
        setCurrentToken('xrun');
        break;
      case 1:
        setCurrentToken('eth');
        break;
      case 2:
        setCurrentToken('digx');
        break;
      default:
        setCurrentToken('xrun');
        break;
    }
  };

  const showTextQRCode = () => {
    setIsShowTextQRCode(true);
  };

  const hideTextQRCode = () => {
    setIsShowTextQRCode(false);
  };

  const copiedHash = hash => {
    Clipboard.setString(hash);

    Alert.alert(
      '',
      'The wallet address has been copied. Use it wherever you want.',
      [
        {
          text: 'OK',
        },
      ],
    );
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
        </View>
      )}

      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_wallet && lang.screen_wallet.title
              ? lang.screen_wallet.title
              : ''}
          </Text>
        </View>
      </View>

      <View style={{flex: 1}}>
        <View style={styles.containerCard}>
          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={index => {
              setIndex(index);
              handleKeyCard(index);
            }}
            initialLayout={{width: layout.width}}
            renderTabBar={() => null}
            lazy
            overScrollMode={'never'}
          />
        </View>

        <View style={styles.containerTable}>
          <TableWalletCard currentToken={currentToken} />
        </View>
      </View>

      {isShowTextQRCode && (
        <>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.showQRButton(positionVerticalDots)}>
            <Text style={styles.textQRCode}>QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={hideTextQRCode}
            style={styles.backgroundShowQR}></TouchableOpacity>
        </>
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
    flex: 0.5,
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
  card: token => ({
    backgroundColor:
      token === 'XRUN' ? '#177f9a' : token === 'ETH' ? '#a74248' : '#343b58',
    marginHorizontal: 36,
    marginTop: 20,
    padding: 20,
    paddingTop: 0,
    borderRadius: 8,
    height: 200,
    zIndex: 5,
    width: Dimensions.get('window').width - 72,
  }),
  wrapperPartTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
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
    marginTop: 28,
  },
  wrapperTextwallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textWallet: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  valueWallet: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 22,
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
    fontSize: 13,
  },
  logo: {
    height: 48,
    width: 48,
    marginTop: -28,
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
