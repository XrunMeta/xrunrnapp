import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';

const langData = require('../../../lang.json');

const CompleteSend = ({navigation, route}) => {
  const [lang, setLang] = useState({});
  const {addrto, amount, symbol, txid} = route.params;

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

  const copiedTXID = hash => {
    Clipboard.setString(hash);
    Alert.alert('', 'The TXID has been copied. Use it wherever you want.');
    console.log(`Hash: ${hash}`);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f3f4f6'}}>
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
            fontSize: 16,
            fontFamily: 'Poppins-Regular',
            color: '#e05c2b',
          }}>
          Send{' '}
        </Text>
        <Text
          style={{fontSize: 16, fontFamily: 'Poppins-Regular', color: '#555'}}>
          is complete.
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: 30,
          backgroundColor: '#fff',
          paddingVertical: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 20,
            borderBottomColor: '#bbb',
            borderBottomWidth: 0.7,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              color: '#555',
            }}>
            Wallet Address
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              color: '#000',
              fontSize: 12,
              maxWidth: 180,
            }}>
            {addrto}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 20,
            borderBottomColor: '#bbb',
            borderBottomWidth: 0.7,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              color: '#555',
            }}>
            Transfer amount
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              color: '#e05c2b',
              fontSize: 15,
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
            alignItems: 'center',
            paddingVertical: 20,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              color: '#555',
            }}>
            TXID
          </Text>
          <View>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                color: '#e05c2b',
                fontSize: 15,
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
                  fontSize: 15,
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
          fontFamily: 'Poppins-Regular',
          color: '#555',
          textAlign: 'center',
          marginTop: 30,
        }}>
        실제 전송은 네트워크 상황에 따라 지연될 수 있습니다.
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('WalletHome');
          }}
          style={styles.button}
          activeOpacity={0.6}>
          <Image
            source={require('../../../assets/images/icon_check.png')}
            resizeMode="contain"
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
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
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#051C60',
    margin: 10,
  },
  button: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 24,
    marginTop: 30,
    marginBottom: 10,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 40,
    right: 0,
  },
  buttonImage: {
    height: 95,
    width: 95,
  },
});