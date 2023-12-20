import {StyleSheet, Text, View, ScrollView, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';

const langData = require('../../../lang.json');

const SettingScreen = () => {
  const {isLoggedIn, logout} = useAuth();
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

  const onDevice = () => {
    // navigation.navigate('CommonProblem');
  };

  const onLogout = () => {
    Alert.alert(
      `${lang && lang.alert ? lang.alert.title.warning : ''}`,
      `${
        lang && lang.screen_info && lang.screen_info.button.logout
          ? lang.screen_info.button.logout
          : ''
      }`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            logout();
            // Go to SignIn Screen
            navigation.replace('SignIn');
          },
        },
      ],
    );
  };

  const onClose = () => {
    navigation.navigate('CloseMember');
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
            {lang && lang.screen_setting ? lang.screen_setting.title : ''}
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
          {/* Basic Setting */}
          <Text
            style={{
              color: 'grey',
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
              marginLeft: 20,
              marginTop: 15,
            }}>
            {lang && lang.screen_setting
              ? lang.screen_setting.category.basic.cat
              : ''}
          </Text>
          <ButtonList
            label={
              lang && lang.screen_setting
                ? lang.screen_setting.category.basic.device
                : ''
            }
            onPress={onDevice}
          />

          {/* Account Setting */}
          <Text
            style={{
              color: 'grey',
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
              marginLeft: 20,
              marginTop: 20,
            }}>
            {lang && lang.screen_setting
              ? lang.screen_setting.category.account.cat
              : ''}
          </Text>
          <ButtonList
            label={
              lang && lang.screen_setting
                ? lang.screen_setting.category.account.logout
                : ''
            }
            onPress={onLogout}
          />
          <ButtonList
            label={
              lang && lang.screen_setting
                ? lang.screen_setting.category.account.close
                : ''
            }
            onPress={onClose}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default SettingScreen;

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
