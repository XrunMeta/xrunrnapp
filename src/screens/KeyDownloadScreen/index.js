import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {getFontFam, fontSize, getLanguage2} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

const KeyDownload = ({navigation, route}) => {
  const [lang, setLang] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

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

  const onBack = () => {
    navigation.navigate('WalletHome');
  };

  const checkBoxToggle = () => {
    setIsChecked(!isChecked);
    console.log(!isChecked);
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

      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_keyDownload
              ? lang.screen_keyDownload.title
              : ''}
          </Text>
        </View>
      </View>

      {/* Desc */}
      <ScrollView style={{paddingHorizontal: 20, paddingVertical: 10, flex: 1}}>
        <Text style={styles.text}>
          {lang && lang.screen_keyDownload ? lang.screen_keyDownload.desc : ''}
        </Text>
      </ScrollView>

      {/* Verify */}
      <View
        style={{
          paddingHorizontal: 20,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-center',
            marginHorizontal: 5,
            marginBottom: 10,
            flex: 1,
          }}
          onPress={checkBoxToggle}>
          <View
            style={[
              styles.checkbox,
              isChecked ? styles.checkedBox : styles.uncheckedBox,
            ]}>
            {isChecked && <Text style={styles.checkMark}>✔</Text>}
          </View>
          <Text
            style={[styles.text, {flexWrap: 'wrap', flexShrink: 1}]}
            onPress={checkBoxToggle}>
            {lang && lang.screen_keyDownload
              ? lang.screen_keyDownload.verify
              : ''}
          </Text>
        </TouchableOpacity>
        <Pressable
          onPress={checkBoxToggle}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-end',
            flexDirection: 'column-reverse',
            height: 100,
            justifyContent: 'center',
          }}
          disabled={!isChecked}>
          <Image
            source={
              !isChecked
                ? require('../../../assets/images/icon_nextDisable.png')
                : require('../../../assets/images/icon_next.png')
            }
            resizeMode="contain"
            style={{height: 80, width: 80}}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default KeyDownload;
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
  text: {
    fontFamily: getFontFam() + 'Regular',
    textAlign: 'left',
    fontSize: fontSize('body'),
    lineHeight: 19,
    color: '#343a59',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#343a59',
    borderColor: '#343a59',
  },
  uncheckedBox: {
    backgroundColor: 'transparent',
    borderColor: '#343a59',
  },
  checkMark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
