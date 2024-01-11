import {StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

const RecommendScreen = () => {
  const {isLoggedIn, logout} = useAuth();
  const [userName, setUserName] = useState(null);
  const [lang, setLang] = useState('');

  const navigation = useNavigation();

  //   Call API
  useEffect(() => {
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
  }, []);

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  const onRegist = () => {
    navigation.navigate('RegistRecommend');
  };

  const onRandom = () => {
    navigation.navigate('RandomRecommend');
  };

  return (
    <View style={styles.root}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_recommend ? lang.screen_recommend.title : ''}
          </Text>
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
            label={
              lang && lang.screen_recommend
                ? lang.screen_recommend.category.regist
                : ''
            }
            onPress={onRegist}
          />
          <ButtonList
            label={
              lang && lang.screen_recommend
                ? lang.screen_recommend.category.random
                : ''
            }
            onPress={onRandom}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default RecommendScreen;

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
