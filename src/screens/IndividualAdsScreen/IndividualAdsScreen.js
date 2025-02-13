import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  gatewayNodeJS,
  authcode,
  URL_API_NODEJS,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonListWithSub from '../../components/ButtonList/ButtonListWithSub';
import ButtonConfirmAds from '../../components/ButtonConfirmAds/ButtonConfirmAds';

const IndividualAdsScreen = () => {
  const [lang, setLang] = useState('');
  const navigation = useNavigation();
  const [member, setMember] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [inAdListf, setInAdList] = useState([]);

  const fetchInAdList = async member => {
    try {
      const request = await fetch(`${URL_API_NODEJS}/getInadList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          member,
        }),
      });
      const response = await request.json();

      if (response.status === 'success' && response.code === 200) {
        setInAdList(response.data);
        setIsLoading(false);

        console.log({inadlist: response.data});
      } else {
        console.error('Failed to fetch InAd List:', response.message);
      }
    } catch (error) {
      console.error('Error fetching InAd List:', error);
    }
  };

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

        fetchInAdList(dataMember.member);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error fetching user data: ', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        const AsyncUserData = await AsyncStorage.getItem('userData');
        const data = JSON.parse(AsyncUserData);

        console.log({data});

        const body = {
          member: data?.member,
        };

        const result = await gatewayNodeJS('app7110-01', 'POST', body);
        const userData = result.data[0];

        console.log('Info Screen -> ' + JSON.stringify(userData));
        setIsLoading(false);

        setUserDetails({
          email: userData.email,
          firstname: userData.firstname,
          member: userData.member,
          lastname: userData.lastname,
          gender: userData.gender,
          extrastr: userData.extrastr,
          country: userData.country,
          countrycode: userData.countrycode,
          region: userData.region,
          ages: userData.ages,
        });
      } catch (err) {
        console.error('Error fetching user data: ', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        setIsLoading(false);
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
          }}>
          {lang && lang ? lang.screen_indAds.manage : 'Manage'}
        </Text>
        <Text
          style={{
            color: 'grey',
            fontFamily: getFontFam() + 'Regular',
            fontSize: fontSize('body'),
            flex: 1,
            marginLeft: -10,
          }}>
          {lang && lang ? lang.screen_indAds.add_coins : 'Add Coins'}
        </Text>
      </View>

      {/* List Button */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 8,
          paddingTop: 0,
        }}>
        <FlatList
          data={inAdListf}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ButtonListWithSub
              label={item.label}
              textClicks={`${item.catch_count}/${item.catch_limit}`}
              textExposes={`${item.expose_count}/${item.exposed_limit}`}
            />
          )}
          ListFooterComponent={
            <ButtonConfirmAds
              onPress={onMoveNewIndAdsScreen}
              label={
                lang && lang.screen_indAds
                  ? lang.screen_indAds.add_ad
                  : 'Add Ad'
              }
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {/* {inAdList.map((item, index) => (
            <ButtonListWithSub
              key={item.ind_ad}
              label={item.label}
              textClicks={`${item.catch_count}/${item.catch_limit}`}
              textExposes={`${item.expose_count}/${item.exposed_limit}`}
            />
          ))} */}
        {/* <TouchableOpacity
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
              fontFamily: getFontFam() + 'Medium',
              fontSize: fontSize('subtitle'),
              textAlign: 'center',
            }}>
            {lang && lang ? lang.screen_indAds.add_ad : 'Add Ad'}
          </Text>
        </TouchableOpacity> */}
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
