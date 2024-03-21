import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2, getFontFam} from '../../../utils';
// import crashlytics from '@react-native-firebase/crashlytics';

const AppInformation = () => {
  const [version, setVersion] = useState('');
  const [lang, setLang] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${URL_API}&act=version`);
        const data = await response.json();

        if (data) {
          setVersion({
            // version: data.version,
            version: 1.87,
            url: data.url,
          });
        }
      } catch (err) {
        console.error('Error fetching version app: ', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    // Get Language
    const currGetLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
      } catch (err) {
        console.error('Error fetching user data: ', err);
      }
    };
    currGetLanguage();

    fetchData();
  });

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_appInfo ? lang.screen_appInfo.title : ''}
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          width: '100%',
          paddingHorizontal: 20,
          marginTop: 10,
        }}>
        <Text
          style={{
            fontFamily: getFontFam() + 'Regular',
            fontSize: 13,
            color: 'grey',
            paddingVertical: 20,
          }}>
          {lang && lang.screen_appInfo ? lang.screen_appInfo.version : ''}{' '}
          {version ? version.version : '...'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AppInformation;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f2f5f6',
  },
  titleWrapper: {
    paddingVertical: 10,
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
});
