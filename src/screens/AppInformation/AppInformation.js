import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

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
            version: data.version,
            url: data.url,
          });
        }
      } catch (err) {
        console.error('Error fetching user data: ', err);
      }
    };

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
    fetchData();
  });

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  return (
    <View style={styles.root}>
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
            fontFamily: 'Poppins-Regular',
            fontSize: 13,
            color: 'grey',
            paddingVertical: 20,
          }}>
          {lang && lang.screen_appInfo ? lang.screen_appInfo.version : ''}{' '}
          {version ? version.version : '...'}
        </Text>
      </View>
    </View>
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
    fontFamily: 'Poppins-Bold',
    color: '#051C60',
    margin: 10,
  },
});
