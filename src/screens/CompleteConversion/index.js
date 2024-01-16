import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CompleteSend = ({navigation, route}) => {
  const [lang, setLang] = useState({});
  const {symbol, amount, conversionRequest} = route.params;

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        let langData;

        switch (currentLanguage) {
          case 'id':
            langData = require('../../../languages/id.json');
            break;
          case 'en':
            langData = require('../../../languages/en.json');
            break;
          case 'ko':
            langData = require('../../../languages/ko.json');
            break;
          case 'zh':
            langData = require('../../../languages/zh.json');
            break;
          default:
            langData = require('../../../languages/en.json');
            break;
        }

        const language = langData;
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
    const handleBackPress = () => {
      navigation.navigate('WalletHome');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={{flex: 1, backgroundColor: '#f3f4f6'}}>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang &&
            lang.complete_conversion &&
            lang.complete_conversion.conversion_request
              ? lang.complete_conversion.conversion_request
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
          {lang && lang.screen_wallet && lang.screen_wallet.table_head_change
            ? lang.screen_wallet.table_head_change
            : ''}{' '}
        </Text>
        <Text
          style={{fontSize: 16, fontFamily: 'Poppins-Regular', color: '#555'}}>
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
            {lang &&
            lang.complete_conversion &&
            lang.complete_conversion.target_converted
              ? lang.complete_conversion.target_converted
              : ''}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              color: '#000',
              maxWidth: 180,
            }}>
            {symbol}
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
            {lang &&
            lang.complete_conversion &&
            lang.complete_conversion.current_balance
              ? lang.complete_conversion.current_balance
              : ''}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              color: '#000',
              maxWidth: 180,
            }}>
            {conversionRequest}
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
            {lang &&
            lang.complete_conversion &&
            lang.complete_conversion.conversion_request
              ? lang.complete_conversion.conversion_request
              : ''}
          </Text>
          <View>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                color: '#000',
                maxWidth: 240,
              }}>
              {amount}
              {symbol}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={{
          fontFamily: 'Poppins-Regular',
          color: '#555',
          paddingHorizontal: 20,
          marginTop: 30,
        }}>
        {lang && lang.complete_conversion && lang.complete_conversion.desc
          ? lang.complete_conversion.desc
          : ''}
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('WalletHome', {
              completeConversion: 'true',
            });
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
