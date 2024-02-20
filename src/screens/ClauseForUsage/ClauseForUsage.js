import {StyleSheet, Text, View, ScrollView, SafeAreaView} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import * as RNLocalize from 'react-native-localize';
import {URL_API, getLanguage2} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const ClauseForUsage = () => {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const screenLang = await getLanguage2();
        setLang(screenLang);

        const language = RNLocalize.getLocales()[0].languageCode;
        if (language) {
          let apiUrl = `${URL_API}&act=app7010-01`;
          if (language === 'id') {
            apiUrl += '-id';
          } else if (language === 'ko') {
            apiUrl += '-kr';
          }

          console.log('Bgst -> ' + language + ' -> ' + apiUrl);

          const response = await fetch(apiUrl);
          const result = await response.json();
          if (result) {
            const firstElement = result.data[2].c;
            setText(firstElement);
          }
        }
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error fetching user data: ', err);
      }
    };
    fetchData();
  }, []);

  const onBack = () => {
    navigation.navigate('Clause');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.buttonBack}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title(RNLocalize.getLocales()[0].languageCode)}>
            {lang && lang.screen_clause
              ? lang.screen_clause.category.usage
              : ''}
          </Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.text}>{text ? text : 'Loading...'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClauseForUsage;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2f5f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 5,
  },
  buttonBack: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: locale => ({
    marginLeft: locale === 'id' || locale === 'en' ? 55 : 0,
    fontSize: 22,
    color: '#051C60',
    margin: 10,
    fontFamily: 'Roboto-Bold',
  }),
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    backgroundColor: 'white',
  },
  text: {
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    paddingVertical: 20,
    color: 'grey',
  },
});
