import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonListWithSub from '../../components/ButtonList/ButtonListWithSub';

const IndividualAdsScreen = () => {
  const [lang, setLang] = useState('');
  const navigation = useNavigation();
  const [member, setMember] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        const userData = await AsyncStorage.getItem('userData');
        const dataMember = JSON.parse(userData);
        setMember(dataMember.member);
        setIsLoading(false);
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

  const onMoveNewIndAdsScreen = () => {
    navigation.navigate('NewIndAds');
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Loading */}
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size={'large'} color={'#fff'} />
          <Text
            style={{
              color: '#fff',
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              marginTop: 10,
            }}>
            Loading...
          </Text>
        </View>
      )}

      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_indAds.title
              ? lang.screen_indAds.title
              : 'Individual Ads'}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginTop: 20,
        }}>
        <Text
          style={{
            color: 'black',
            fontFamily: getFontFam() + 'Bold',
            fontSize: fontSize('body'),
            flex: 1,
            marginLeft: 10,
          }}>
          {lang && lang ? lang.screen_indAds.manage : 'Manage'}
        </Text>
        <Text
          style={{
            color: 'grey',
            fontFamily: getFontFam() + 'Regular',
            fontSize: fontSize('body'),
            flex: 1,
          }}>
          {lang && lang ? lang.screen_indAds.add_coins : 'Add Coins'}
        </Text>
      </View>

      {/* List Button */}
      <View
        style={{
          flex: 1,
          padding: 10,
          paddingTop: 0,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ButtonListWithSub
            label="My Ads Name"
            textClicks="10/200"
            textExposes="250/1000"
          />
          <ButtonListWithSub label="My Ads Name 2" textClicks="10/200" />
          <ButtonListWithSub label="My Ads Name 3" textExposes="250/1000" />
          <TouchableOpacity
            style={{
              backgroundColor: '#fedc00',
              marginTop: 48,
              alignSelf: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 50,
            }}
            onPress={onMoveNewIndAdsScreen}>
            <Text
              style={{
                color: 'black',
                fontFamily: getFontFam() + 'Bold',
                fontSize: fontSize('subtitle'),
                textAlign: 'center',
              }}>
              {lang && lang ? lang.screen_indAds.add_ad : 'Add Ad'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default IndividualAdsScreen;

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
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
