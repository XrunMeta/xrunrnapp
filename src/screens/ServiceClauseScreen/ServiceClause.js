import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, ScrollView, SafeAreaView} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import * as RNLocalize from 'react-native-localize';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const ServiceClause = () => {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const screenLang = await getLanguage2();
        setLang(screenLang);

        const language = RNLocalize.getLocales()[0].languageCode;
        if (!language) return;

        let apiUrl = `${URL_API}&act=app7010-01`;
        if (language === 'id') apiUrl += '-id';
        if (language === 'ko') apiUrl += '-kr';

        const response = await fetch(apiUrl);
        const result = await response.json();
        if (result) setText(result?.data[0]?.c);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error fetching user data: ', err);
      }
    };

    fetchData();
  }, []);

  const onBack = () => navigation.navigate('Clause');

  return (
    <SafeAreaView style={styles.root}>
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang?.screen_clause?.category?.service}
          </Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.text}>{text ? text : 'Loading...'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    backgroundColor: 'white',
    width: '100%',
  },
  text: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: 'grey',
    paddingVertical: 20,
  },
});

export default ServiceClause;
