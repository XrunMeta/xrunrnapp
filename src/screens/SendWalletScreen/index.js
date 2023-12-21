import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInputWallet from '../../components/CustomInputWallet';
import CustomDropdownWallet from '../../components/CustomDropdownWallet';
const langData = require('../../../lang.json');

const SendWalletScreen = ({navigation, route}) => {
  const [lang, setLang] = useState({});
  const [iconNextIsDisabled, setIconNextIsDisabled] = useState(true);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const {dataWallet} = route.params;
  const [selectedExchange, setSelectedExchange] = useState('');

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
  }, []);

  useEffect(() => {
    if (amount !== '' && address !== '') {
      setIconNextIsDisabled(false);
    } else {
      setIconNextIsDisabled(true);
    }
  }, [amount, address]);

  const onBack = () => {
    navigation.navigate('WalletHome');
  };

  const onSend = () => {
    if (amount === '') {
      Alert.alert('Warning', 'Amount jangan kosong bang');
    } else if (address === '') {
      Alert.alert('Warning', 'Address jangan kosong bang');
    } else {
      setIconNextIsDisabled(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_send && lang.screen_send.title
              ? lang.screen_send.title
              : ''}
          </Text>
        </View>
      </View>

      <View style={{height: '70%', backgroundColor: '#fff'}}>
        <View style={styles.partTop}>
          <Text style={styles.currencyName}>XRUN</Text>
          <View style={styles.partScanQR}>
            <Text style={styles.balance}>Balance: 1.869 XRUN</Text>
            <TouchableOpacity style={styles.scanQRCode} activeOpacity={0.7}>
              <Image
                source={require('../../../assets/images/scanqr.png')}
                style={{width: 36, height: 36}}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.partBottom}>
          <CustomInputWallet
            value={amount}
            setValue={setAmount}
            isNumber
            label={
              lang && lang.screen_send && lang.screen_send.label_amount
                ? lang.screen_send.label_amount
                : ''
            }
            placeholder={
              lang && lang.screen_send && lang.screen_send.amount_placeholder
                ? lang.screen_send.amount_placeholder
                : ''
            }
          />

          <CustomInputWallet
            value={address}
            setValue={setAddress}
            label={
              lang && lang.screen_send && lang.screen_send.label_address
                ? lang.screen_send.label_address
                : ''
            }
            placeholder={
              lang && lang.screen_send && lang.screen_send.address_placeholder
                ? lang.screen_send.address_placeholder
                : ''
            }
          />

          <CustomDropdownWallet
            label={
              lang && lang.screen_send && lang.screen_send.label_exchange
                ? lang.screen_send.label_exchange
                : ''
            }
            onSelectedExchange={value => {
              setSelectedExchange(value);
            }}
            selectedExchange={selectedExchange}
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
  },
  partBottom: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 80,
  },
  button: {
    flexDirection: 'row',
    height: 100,
    marginHorizontal: 24,
    marginTop: 30,
    marginBottom: 10,
    justifyContent: 'flex-end',
  },
  buttonImage: {
    height: 100,
    width: 100,
  },
  partScanQR: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  scanQRCode: {
    backgroundColor: '#fff',
    width: 36,
  },
});
