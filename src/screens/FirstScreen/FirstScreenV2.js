import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  Dimensions,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import React, {useState, useEffect} from 'react';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fontSize, getFontFam, saveLogsDB} from '../../../utils';
import Carousel, {Pagination} from 'react-native-snap-carousel';

const FirstScreenV2 = ({navigation}) => {
  const [lang, setLang] = useState({});
  const {width} = Dimensions.get('window');
  const itemWidth = width - 30;
  const [activeIndex, setActiveIndex] = useState(0);
  const [currLanguage, setCurrLanguage] = useState('id');

  // const requestNotificationPermission = async () => {
  //   if (Platform.OS === 'android' && Platform.Version >= 33) {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //       {
  //         title: 'Notification Permission',
  //         message: 'This app needs access to show notifications.',
  //         buttonNeutral: 'Ask Me Later',
  //         buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       },
  //     );

  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log('Notification permission granted');
  //     } else {
  //       console.log('Notification permission denied');
  //     }
  //   }
  // };

  useEffect(() => {
    const initializeApp = async () => {
      // Simpan log pengguna membuka aplikasi
      saveLogsDB(
        '5000010',
        0,
        'User open app',
        'User open app and see first screen',
      );

      // Minta izin notifikasi
      // await requestNotificationPermission();
    };

    initializeApp();
  }, []);

  const setCurrentLanguage = async language => {
    try {
      // Simpan bahasa yang digunakan ke dalam AsyncStorage
      await AsyncStorage.setItem('currentLanguage', language);
      console.log('Bahasa saat ini disimpan: ', language);
    } catch (error) {
      console.error(
        'Error saat menyimpan bahasa ke dalam AsyncStorage: ',
        error,
      );
    }
  };

  useEffect(() => {
    const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
    setCurrentLanguage(deviceLanguage);
    setCurrLanguage(deviceLanguage);
    let langData;

    switch (deviceLanguage) {
      case 'id':
        langData = require('../../../languages/id.json');
        break;
      case 'en':
        langData = require('../../../languages/en.json');
        break;
      case 'ko':
        langData = require('../../../languages/ko.json');
        break;
      case 'zh':
        langData = require('../../../languages/zh.json');
        break;
      default:
        langData = require('../../../languages/en.json');
        break;
    }

    const language = langData;
    setLang(language);
  }, []);

  const onSignIn = () => {
    navigation.navigate('SignIn');
  };

  const onJoin = () => {
    navigation.navigate('SignUp');
  };

  const images = [
    require('../../../assets/images/image_firstSlider1.png'),
    require('../../../assets/images/image_firstSlider2.png'),
    require('../../../assets/images/image_firstSlider3.png'),
  ];

  const renderImage = ({item, index}) => {
    return (
      <Image
        source={item}
        style={[
          styles.sliderImage,
          {
            width: Dimensions.get('window').width - 45,
            alignSelf: 'center',
          },
        ]}
        resizeMode="cover"
      />
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.root}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_first && lang.screen_first.title
              ? lang.screen_first.title[1]
              : ''}
          </Text>
          <Text style={[styles.title, {marginTop: -5}]}>
            {lang && lang.screen_first && lang.screen_first.title
              ? lang.screen_first.title[2]
              : ''}
          </Text>
        </View>

        <View style={styles.sliderWrapper}>
          <Carousel
            layout={'default'}
            data={images}
            renderItem={renderImage}
            sliderWidth={width}
            itemWidth={itemWidth} // Atur lebar item sesuai dengan perhitungan di atas
            onSnapToItem={index => setActiveIndex(index)} // Fungsi untuk mengubah indeks item aktif saat digulir
          />
          {/* Pagination */}
          <Pagination
            dotsLength={images.length} // Jumlah titik di pagination
            activeDotIndex={activeIndex} // Indeks titik aktif
            containerStyle={{paddingBottom: 0, paddingTop: 15}} // Gaya kontainer pagination
            dotStyle={{
              width: 8,
              height: 8,
              borderRadius: 5,
              marginHorizontal: -20,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }} // Gaya titik pagination yang aktif
            inactiveDotStyle={{
              width: 5,
              height: 5,
              borderRadius: 4,
              marginHorizontal: -20,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }} // Gaya titik pagination yang tidak aktif
            inactiveDotOpacity={0.4} // Opasitas titik pagination yang tidak aktif
            inactiveDotScale={0.6} // Skala titik pagination yang tidak aktif
          />
        </View>

        <CustomButton
          text={
            lang && lang.screen_first && lang.screen_first.login
              ? lang.screen_first.login
              : ''
          }
          onPress={onSignIn}
          firstScreen
        />
        <CustomButton
          text={
            lang && lang.screen_first && lang.screen_first.signUp
              ? lang.screen_first.signUp
              : ''
          }
          type="SECONDARY"
          onPress={onJoin}
          firstScreen
        />

        <View style={styles.descWrapper}>
          <Text style={styles.text}>
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[1] + ' '
              : ''}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL(
                  currLanguage === 'id'
                    ? 'https://app.xrun.run/7011.html'
                    : `https://app.xrun.run/7011-${currLanguage}.html`,
                );
              }}>
              {lang && lang.screen_first && lang.screen_first.terms
                ? lang.screen_first.terms
                : ''}
            </Text>{' '}
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[2]
              : ''}{' '}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL(
                  currLanguage === 'id'
                    ? 'https://app.xrun.run/7013.html'
                    : `https://app.xrun.run/7013-${currLanguage}.html`,
                );
              }}>
              {lang && lang.screen_first && lang.screen_first.privacy
                ? lang.screen_first.privacy
                : ''}
            </Text>{' '}
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[3] + ' '
              : ''}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL(
                  currLanguage === 'id'
                    ? 'https://app.xrun.run/7012.html'
                    : `https://app.xrun.run/7012-${currLanguage}.html`,
                );
              }}>
              {lang && lang.screen_first && lang.screen_first.information
                ? lang.screen_first.information
                : ''}
            </Text>{' '}
            {lang && lang.screen_first && lang.screen_first.tos
              ? lang.screen_first.tos[4] + ' '
              : ''}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    position: 'relative',
  },

  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f4f5',
  },
  containContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  titleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: fontSize('title'),
    color: '#343a59',
    fontFamily: getFontFam() + 'Bold',
  },
  sliderWrapper: {
    flex: 1,
    marginBottom: 8,
  },
  sliderImage: {
    flex: 1,
    // width: Dimensions.get('window').width,
    height: '95%',
    borderRadius: 10,
  },
  sliderNavigator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  descWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: 35,
    marginBottom: 20,
  },
  text: {
    fontFamily: getFontFam() + 'Regular',
    textAlign: 'center',
    fontSize: fontSize('body'),
    lineHeight: 19,
    color: '#343a59',
  },
  link: {
    color: '#343a59',
    fontFamily: getFontFam() + 'Regular',
    textDecorationLine: 'underline',
    fontSize: fontSize('body'),
    position: 'relative',
  },
});

export default FirstScreenV2;
