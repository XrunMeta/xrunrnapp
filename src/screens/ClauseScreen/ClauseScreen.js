import {StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {URL_API, getLanguage} from '../../../utils';

const langData = require('../../../lang.json');

const ClauseScreen = () => {
  const {isLoggedIn, logout} = useAuth();
  const [userName, setUserName] = useState(null);
  const [lang, setLang] = useState('');

  let ScreenHeight = Dimensions.get('window').height;

  const navigation = useNavigation();

  //   Call API
  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage(currentLanguage, 'screen_clause');
        setLang(screenLang);
      } catch (err) {
        console.error('Error fetching user data: ', err);
      }
    };
    fetchData();
  }, []);

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  const onServiceClause = () => {
    navigation.navigate('ServiceClause');
  };

  const onClausePersonal = () => {
    navigation.navigate('PersonalClause');
  };

  const onClauseUsage = () => {
    navigation.navigate('UsageClause');
  };

  return (
    <View style={styles.root}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{lang && lang ? lang.title : ''}</Text>
        </View>
      </View>

      {/* List Button */}
      <View
        style={{
          paddingVertical: 10,
          flex: 1,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ButtonList
            label={lang && lang ? lang.category.service : ''}
            onPress={onServiceClause}
          />
          <ButtonList
            label={lang && lang ? lang.category.location : ''}
            onPress={onClausePersonal}
          />
          <ButtonList
            label={lang && lang ? lang.category.usage : ''}
            onPress={onClauseUsage}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default ClauseScreen;

const styles = StyleSheet.create({
  root: {
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
