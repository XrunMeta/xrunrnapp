import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {getLanguage} from '../../../utils';

const RecommendScreen = () => {
  const navigation = useNavigation();
  const [lang, setLang] = useState('');

  //   Call API
  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage(
          currentLanguage,
          'screen_recommend',
        );
        setLang(screenLang);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchData();
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
          <Text style={styles.title}>{lang ? lang.title : ''}</Text>
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
            label={lang && lang.category ? lang.category.regist : ''}
            onPress={onRegist}
          />
          <ButtonList
            label={lang && lang.category ? lang.category.random : ''}
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
