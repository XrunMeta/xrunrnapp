import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  BackHandler,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const CompleteSend = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const {symbol, amount, estimate, currency, originamount, left} = route.params;

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
    <SafeAreaView style={{flex: 1, backgroundColor: '#f3f4f6'}}>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.complete_conversion && lang.complete_conversion.title
              ? lang.complete_conversion.title
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
            color: '#e05c2b',
          }}>
          {lang && lang.screen_wallet && lang.screen_wallet.history_action3306
            ? lang.screen_wallet.history_action3306
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
            alignItems: 'center',
            paddingVertical: 20,
            borderBottomColor: '#bbb',
            borderBottomWidth: 0.7,
            opacity: 0,
          }}>
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
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
              fontFamily: getFontFam() + 'Regular',
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
            paddingBottom: 20,
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
            lang.complete_conversion &&
            lang.complete_conversion.current_balance
              ? lang.complete_conversion.current_balance
              : ''}
          </Text>
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
              color: '#000',
              fontSize: fontSize('body'),
              maxWidth: 180,
            }}>
            {originamount}XRUN
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 20,
            opacity: 0,
          }}>
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
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
                fontFamily: getFontFam() + 'Regular',
                color: '#000',
                maxWidth: 240,
              }}>
              {estimate}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={{
          fontFamily: getFontFam() + 'Regular',
          color: '#555',
          paddingHorizontal: 20,
          marginTop: 30,
          fontSize: fontSize('body'),
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
    </SafeAreaView>
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
