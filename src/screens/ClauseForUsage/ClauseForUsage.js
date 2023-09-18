import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClauseForUsage = () => {
  const [text, setText] = useState('0');

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
            Clause for Usage/Collecting Personal Information
          </Text>
        </View>
      </View>
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          marginTop: 10,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 18,
            paddingVertical: 20,
          }}>
          {text ? text : 'Loading...'}
        </Text>
      </ScrollView>
    </View>
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
    marginLeft: 70,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#051C60',
    margin: 10,
  },
});
