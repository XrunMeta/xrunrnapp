import {
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLanguage2, getFontFam, fontSize} from '../../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import LabelWithBoxReadOnly from '../../../components/LabelWithBoxReadOnly/LabelWithBoxReadOnly';
import ButtonConfirmAds from '../../../components/ButtonConfirmAds/ButtonConfirmAds';

const AdsCompletePurchase = () => {
  const [lang, setLang] = useState('');
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();
  const {
    adName,
    calculatedValue,
    rewardCoin,
    rewardAmountPerCatch,
    exposeCount,
    exposeLength,
  } = route.params || {};

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        if (isMounted) setLang(screenLang);
        if (isMounted) setIsLoading(false);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error fetching user data: ', err);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, []);

  const mainDetailAd = () => {
    const data = [
      {
        label: lang && lang ? lang.screen_indAds.reward_coin : 'Reward Coin',
        value: rewardCoin,
      },
      {
        label: lang && lang ? lang.screen_indAds.reward_limit : 'Reward Limit',
        value: 100 + rewardCoin,
      },
      {
        label:
          lang && lang
            ? lang.screen_indAds.reward_amount_per_catch
            : 'Reward Amount per Catch',
        value: rewardAmountPerCatch + rewardCoin.toLowerCase(),
      },
      {
        label: lang && lang ? lang.screen_indAds.expose_count : 'Expose Count',
        value:
          exposeCount +
          ` (0.02$/${
            (lang && lang
              ? lang.screen_indAds.expose_count
              : 'Expose Count'
            ).split(' ')[0]
          })`,
      },
      {
        label:
          lang && lang ? lang.screen_indAds.expose_length : 'Expose Length',
        value:
          exposeLength +
          `${lang && lang ? lang.screen_indAds.days : 'days'} (0.2$/${
            lang && lang ? lang.screen_indAds.day : 'Day'
          })`,
      },
    ];

    const arrayToString = data
      .map(item => `${item.label}: ${item.value}`)
      .join('\n');
    return arrayToString;
  };

  const formFields = [
    {
      label: lang && lang ? lang.screen_indAds.ad_detail : "AD's Detail",
      value: adName,
    },
    {
      label: '',
      value: mainDetailAd(),
    },
    {
      label: lang && lang ? lang.screen_indAds.value : 'Value',
      value: calculatedValue + '$',
    },
  ];

  const onMoveListAds = () => {
    navigation.replace('IndAds');
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
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_indAds.title ? lang.screen_indAds.title : ''}
          </Text>
        </View>
      </View>

      {/* List Input */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 8,
          marginTop: 20,
        }}>
        <FlatList
          data={formFields}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <LabelWithBoxReadOnly
              label={item.label}
              value={item.value}
              isTextarea={item.isTextarea}
            />
          )}
          contentContainerStyle={styles.wrapperListInput}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              <Text style={styles.ad_starts_soon}>Your ad starts soon.</Text>
              <ButtonConfirmAds
                label={lang && lang ? lang.screen_showad.textOK : 'OK'}
                onPress={onMoveListAds}
              />
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default AdsCompletePurchase;

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
  wrapperListInput: {
    flexDirection: 'column',
    gap: 12,
  },
  ad_starts_soon: {
    fontSize: fontSize('subtitle'),
    fontFamily: getFontFam() + 'Bold',
    marginHorizontal: 12,
    marginTop: 32,
    color: '#000',
  },
});
