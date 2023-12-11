import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import Clipboard from '@react-native-clipboard/clipboard';

const langData = require('../../../lang.json');

const WalletScreen = ({navigation}) => {
  const [lang, setLang] = useState({});
  const [isShowTextQRCode, setIsShowTextQRCode] = useState(false);
  const [hash, setHash] = useState('0xd54D62C609kasdj05d35324f');
  const viewRef = useRef(null);
  const [positionVerticalDots, setPositionVerticalDots] = useState(0);

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

    // Mengukur posisi dan ukuran View setelah rendering
    if (viewRef.current) {
      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        setPositionVerticalDots(pageY);
      });
    }
  }, []);

  const showTextQRCode = () => {
    setIsShowTextQRCode(true);
  };

  const hideTextQRCode = () => {
    setIsShowTextQRCode(false);
  };

  // Mengambil 10 huruf pertama
  const firstHash = hash.substring(0, 10);

  // Mengambil 10 huruf terakhir
  const lastHash = hash.substring(hash.length - 10);

  const copiedHash = () => {
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

      <View style={styles.subContainer}>
        {/* Card */}
        <ScrollView overScrollMode="never">
          <View style={styles.card}>
            <View style={styles.wrapperPartTop}>
              <Text style={styles.cardName}>XRUN</Text>
              <View style={styles.wrapperShowQR}>
                <TouchableOpacity
                  style={styles.wrapperDots}
                  activeOpacity={0.6}
                  onPress={showTextQRCode}
                  ref={viewRef}>
                  <View style={styles.dot}></View>
                  <View style={styles.dot}></View>
                  <View style={styles.dot}></View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.containerTextWallet}>
              <View style={styles.wrapperTextwallet}>
                <Text style={styles.textWallet}>Possess</Text>
                <Text style={styles.valueWallet}>1.87</Text>
                <Text style={styles.textWallet}>XRUN</Text>
              </View>

              <View style={styles.wrapperTextwallet}>
                <Text style={styles.textWallet}>Catch</Text>
                <Text style={styles.valueWallet}>44.71</Text>
                <Text style={styles.textWallet}>XRUN</Text>
              </View>
            </View>

            <View style={styles.wrapperPartBottom}>
              <View style={styles.wrapperCopiedHash}>
                <View style={styles.wrapperHash}>
                  <Text style={styles.hash}>{firstHash}</Text>
                  <Text style={styles.hash}>...</Text>
                  <Text style={styles.hash}>{lastHash}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={copiedHash}>
                  <Image
                    source={require('../../../assets/images/clipboard.png')}
                  />
                </TouchableOpacity>
              </View>

              <Image
                source={require('../../../assets/images/logo_xrun.png')}
                style={styles.logo}
              />
            </View>
          </View>
        </ScrollView>

        <View></View>
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
  subContainer: {
    flex: 1,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#177f9a',
    marginHorizontal: 36,
    marginTop: 20,
    padding: 20,
    paddingTop: 0,
    borderRadius: 8,
    height: 200,
    zIndex: 5,
  },
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
    top: positionY + 50,
    right: 56,
  }),
  backgroundShowQR: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: 'red',
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
});
