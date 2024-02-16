import {StyleSheet, Text, View, ScrollView, SafeAreaView} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const langData = require('../../../lang.json');

const ClauseForUsage = () => {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    // Get Current Language from Async Storage
    AsyncStorage.getItem('currentLanguage')
      .then(language => {
        // Lakukan sesuatu dengan nilai currentLanguage, misalnya set state atau tindakan lain
        if (language) {
          console.log('Current Language:', language);
          let apiUrl = `${URL_API}&act=app7010-01`;

          // Tambahkan bahasa ke URL jika bahasa adalah "id"
          if (language === 'id') {
            apiUrl += '-id';
          }

          const selectedLanguage = language === 'id' ? 'id' : 'eng';
          const languageData = langData[selectedLanguage];
          setLang(languageData);

          const fetchData = async () => {
            try {
              const response = await fetch(apiUrl);
              const result = await response.json();

              if (result) {
                // Ambil elemen pertama dari array "result" dengan kunci "c"
                const firstElement = result.data[2].c;
                setText(firstElement);
              }
            } catch (err) {
              crashlytics().recordError(new Error(err));
              crashlytics().log(err);
              console.error('Error fetching user data: ', err);
            }
          };

          fetchData();
        }
      })
      .catch(error => {
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
        console.error(
          'Error getting currentLanguage from AsyncStorage:',
          error,
        );
      });
  }, []);

  const onBack = () => {
    navigation.navigate('Clause');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1, top: 15}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_clause
              ? lang.screen_clause.category.usage
              : ''}
          </Text>
        </View>
      </View>
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          marginTop: 10,
          backgroundColor: 'white',
          width: '100%',
        }}>
        <Text
          style={{
            fontFamily: 'Roboto-Regular',
            fontSize: 13,
            color: 'grey',
            paddingVertical: 20,
          }}>
          {text ? text : 'Loading...'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClauseForUsage;

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
    marginLeft: 55,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#051C60',
    margin: 10,
  },
});
