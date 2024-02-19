import {StyleSheet, Text, View, ScrollView, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {getLanguage2} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const SettingScreen = () => {
  const {logout} = useAuth();
  const [lang, setLang] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error fetching user data: ', err);
      }
    };

    fetchData();
  }, []);

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  const onDevice = () => {
    // navigation.navigate('CommonProblem');
  };

  const onLogout = () => {
    Alert.alert(
      `${lang && lang.alert.title ? lang.alert.title.warning : ''}`,
      `${
        lang && lang && lang.screen_setting.button.logout
          ? lang.screen_setting.button.logout
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
            {lang && lang.screen_setting.title ? lang.screen_setting.title : ''}
          </Text>
        </View>
      </View>

      {/* List Button */}
      <View
        style={{
          flex: 1,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Basic Setting */}
          {/* <Text
            style={{
              color: 'grey',
              fontFamily: 'Roboto-Regular',
              fontSize: 13,
              marginLeft: 20,
              marginTop: 15,
            }}>
            {lang && lang ? lang.screen_setting.category.basic.cat : ''}
          </Text>
          <ButtonList
            label={
              lang && lang ? lang.screen_setting.category.basic.device : ''
            }
            onPress={onDevice}
          /> */}

          {/* Account Setting */}
          <Text
            style={{
              color: 'grey',
              fontFamily: 'Roboto-Regular',
              fontSize: 13,
              marginLeft: 20,
              marginTop: 20,
            }}>
            {lang && lang ? lang.screen_setting.category.account.cat : ''}
          </Text>
          <ButtonList
            label={
              lang && lang ? lang.screen_setting.category.account.logout : ''
            }
            onPress={onLogout}
          />
          <ButtonList
            label={
              lang && lang ? lang.screen_setting.category.account.close : ''
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
    fontFamily: 'Roboto-Bold',
    color: '#051C60',
    margin: 10,
  },
});
