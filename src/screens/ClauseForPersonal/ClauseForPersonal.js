import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const langData = require('../../../lang.json');

const ClauseForPersonal = () => {
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
          let apiUrl = 'https://app.xrun.run/gateway.php?act=app7010-01';

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
                const firstElement = result.data[1].c;
                setText(firstElement);
              }
            } catch (err) {
              console.error('Error fetching user data: ', err);
            }
          };

          fetchData();
        }
      })
      .catch(error => {
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
    <View style={styles.root}>
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1, top: 15}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_clause
              ? lang.screen_clause.category.location
              : ''}
          </Text>
        </View>
      </View>
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          backgroundColor: 'white',
          marginTop: 10,
          width: '100%',
        }}>
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: 13,
            paddingVertical: 20,
            color: 'grey',
          }}>
          {text ? text : 'Loading...'}
        </Text>
      </ScrollView>
    </View>
  );
};

export default ClauseForPersonal;

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
    marginLeft: 70,
    fontSize: 22,
    color: '#051C60',
    margin: 10,
    fontFamily: 'Poppins-Bold',
  },
});
