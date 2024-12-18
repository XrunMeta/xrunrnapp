import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonComplete from '../../components/ButtonComplete/ButtonComplete';

const CompleteSend = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const {addrto, amount, symbol, txid} = route.params;

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
  }, []);

  const copiedTXID = hash => {
    Clipboard.setString(hash);
    Alert.alert('', 'The TXID has been copied. Use it wherever you want.');
    console.log(`Hash: ${hash}`);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#f3f4f6'}}>
        <View style={{flexDirection: 'row'}}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              {lang &&
              lang.screen_complete_send &&
              lang.screen_complete_send.title
                ? lang.screen_complete_send.title
                : ''}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 30,
            marginBottom: 20,
          }}>
          <Text
            style={{
              fontSize: fontSize('subtitle'),
              fontFamily: getFontFam() + 'Regular',
              color: 'red',
            }}>
            {lang && lang.screen_wallet && lang.screen_wallet.table_head_send
              ? lang.screen_wallet.table_head_send
              : ''}{' '}
          </Text>
          <Text
            style={{
              fontSize: fontSize('subtitle'),
              fontFamily: getFontFam() + 'Regular',
              color: '#555',
            }}>
            {lang &&
            lang.screen_complete_send &&
            lang.screen_complete_send.complete_send
              ? lang.screen_complete_send.complete_send
              : ''}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 20,
            backgroundColor: '#fff',
            paddingVertical: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 20,
              borderBottomColor: '#bbb',
              borderBottomWidth: 0.7,
            }}>
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                color: '#555',
                fontSize: fontSize('body'),
              }}>
              {lang &&
              lang.screen_complete_send &&
              lang.screen_complete_send.wallet_address
                ? lang.screen_complete_send.wallet_address
                : ''}
            </Text>
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                color: '#000',
                fontSize: fontSize('body'),
                maxWidth: 180,
              }}>
              {addrto}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 20,
              borderBottomColor: '#bbb',
              borderBottomWidth: 0.7,
            }}>
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('body'),
                color: '#555',
              }}>
              {lang &&
              lang.screen_complete_send &&
              lang.screen_complete_send.amount_send
                ? lang.screen_complete_send.amount_send
                : ''}
            </Text>
            <Text
              style={{
                fontFamily: getFontFam() + 'Medium',
                color: 'red',
                fontSize: fontSize('body'),
                maxWidth: 180,
              }}>
              {amount}
              {symbol}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 20,
            }}>
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                color: '#555',
                fontSize: fontSize('body'),
              }}>
              TXID
            </Text>
            <View>
              <Text
                style={{
                  fontFamily: getFontFam() + 'Medium',
                  color: 'red',
                  fontSize: fontSize('body'),
                  maxWidth: 240,
                }}>
                {txid}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  marginLeft: 'auto',
                }}
                onPress={() => copiedTXID(txid)}>
                <Text
                  style={{
                    fontSize: fontSize('body'),
                    color: '#555',
                    marginTop: 4,
                    textAlign: 'right',
                  }}>
                  COPY txid
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text
          style={{
            fontFamily: getFontFam() + 'Regular',
            color: '#555',
            textAlign: 'center',
            marginTop: 30,
            fontSize: fontSize('body'),
            paddingHorizontal: 20,
          }}>
          {lang && lang.screen_complete_send && lang.screen_complete_send.delay
            ? lang.screen_complete_send.delay
            : ''}
        </Text>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex: 1}}>
          <ButtonComplete
            onClick={() => {
              navigation.navigate('WalletHome', {
                completeSend: 'true',
              });
            }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default CompleteSend;
const styles = StyleSheet.create({
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
});
