import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';

// Get Language Data
const langData = require('../../../lang.json');

const InfoScreen = () => {
  const [lang, setLang] = useState({});
  const {isLoggedIn, logout} = useAuth();
  const [userName, setUserName] = useState(null);
  const [userDetails, setUserDetails] = useState([]);

  let ScreenHeight = Dimensions.get('window').height;

  const navigation = useNavigation();

  //   Call API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const response = await fetch(
          `https://app.xrun.run/gateway.php?act=login-04-email&email=${userEmail}`,
        );
        const data = await response.json();

        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);

        if (data.data === 'true') {
          const fullName = `${data.firstname}${data.lastname}`;
          setUserName(fullName);

          setUserDetails({
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            gender: data.gender,
            extrastr: data.extrastr,
            country: data.country,
            countrycode: data.countrycode,
            region: data.region,
            ages: data.ages,
          });

          await AsyncStorage.setItem(
            'userDetails',
            JSON.stringify(userDetails),
          );
        }
      } catch (err) {
        console.error('Error fetching user data: ', err);
      }
    };

    fetchData();
  }, []);

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
            // Go to First Screen
            navigation.navigate('First');
          },
        },
      ],
    );
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `
Let's join XRUN!!!
Referral me!
Email : ${userDetails.email}
https://play.google.com/store/apps/details?id=run.xrun.xrunapp`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Berhasil berbagi dengan aktivitas tertentu
          console.log(`Berhasil berbagi dengan ${result.activityType}`);
        } else {
          // Berhasil berbagi
          console.log('Berhasil berbagi');
        }
      } else if (result.action === Share.dismissedAction) {
        // Berbagi dibatalkan
        console.log('Berbagi dibatalkan');
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const onModify = () => {
    console.warn('Modify');
  };

  const onSetting = () => {
    Alert.alert('Alert Title', 'My Alert Msg', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  };

  const onClause = () => {
    navigation.navigate('Clause');
  };

  const onAppInfo = () => {
    navigation.navigate('AppInformation');
  };

  const onBack = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_info && lang.screen_info.title
              ? lang.screen_info.title
              : ''}
          </Text>
        </View>
      </View>

      {/* User Info */}
      <View
        style={{
          backgroundColor: 'white',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 20,
          marginTop: 10,
        }}>
        <View
          style={{
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
              color: 'black',
            }}>
            {userDetails && userDetails.firstname && userDetails.lastname
              ? `${userDetails.firstname}${userDetails.lastname}`
              : 'Loading...'}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 11,
              color: 'grey',
              marginTop: -3,
            }}>
            {userDetails && userDetails.email ? userDetails.email : ''}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
          <TouchableOpacity
            onPress={onShare}
            style={{
              padding: 10,
              borderRadius: 35,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'grey',
            }}>
            <Image
              source={require('../../../assets/images/icon_share.png')}
              resizeMode="contain"
              style={{
                height: 15,
                width: 15,
                marginLeft: -1,
                marginRight: 1,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLogout}
            style={{
              padding: 12,
              borderRadius: 35,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'grey',
            }}>
            <Image
              source={require('../../../assets/images/icon_logout.png')}
              resizeMode="contain"
              style={{
                height: 12,
                width: 12,
                marginLeft: 1,
                marginRight: -1,
                opacity: 0.5,
              }}
            />
          </TouchableOpacity>
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
              lang && lang.screen_info && lang.screen_info.list.modify
                ? lang.screen_info.list.modify
                : ''
            }
            onPress={onModify}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list.setting
                ? lang.screen_info.list.setting
                : ''
            }
            onPress={onSetting}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list.clause
                ? lang.screen_info.list.clause
                : ''
            }
            onPress={onClause}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list.cs
                ? lang.screen_info.list.cs
                : ''
            }
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list.app_info
                ? lang.screen_info.list.app_info
                : ''
            }
            onPress={onAppInfo}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list.recommend
                ? lang.screen_info.list.recommend
                : ''
            }
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2f5f6',
  },
  titleWrapper: {
    paddingVertical: 7,
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
