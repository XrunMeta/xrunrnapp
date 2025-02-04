import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../../components/ButtonBack';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  dateIndividualAds,
  checkingConditionsAddNewAds,
  calculateDayDifferenceAds,
} from '../../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonListWithSub from '../../../components/ButtonList/ButtonListWithSub';
import InputIndAds from '../../../components/CustomInput/InputIndAds';
import DateTimePicker from '@react-native-community/datetimepicker';
import {launchImageLibrary} from 'react-native-image-picker';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RadioGroups from '../../../components/RadioGroups/RadioGroups';
import ButtonConfirmAds from '../../../components/ButtonConfirmAds/ButtonConfirmAds';

const FirstNewAdsScreen = () => {
  const [lang, setLang] = useState('');
  const navigation = useNavigation();
  const [member, setMember] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [adName, setAdName] = useState('');
  const [adOwnerName, setAdOwnerName] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [rewardAmountPerCatch, setRewardAmountPerCatch] = useState('');
  const [totalReward, setTotalReward] = useState('');
  const [detailProduct, setDetailProduct] = useState('');
  const [calculatedValue, setCalculatedValue] = useState('120');

  // Popup floating
  const [currentTypePopupFloating, setCurrentTypePopupFloating] = useState('');
  const [isShowPopupFloating, setIsShowPopupFloating] = useState(false);

  //  - AD Type
  const [selectedIdAdType, setSelectedIdAdType] = useState('0');
  const [selectedAdType, setSelectedAdType] = useState({
    value: '',
    label: '',
  });

  //  - Expose Count
  const [selectedIdExposeCount, setSelectedIdExposeCount] = useState('0');
  const [selectedExposeCount, setSelectedExposeCount] = useState({
    value: '',
    label: '',
  });

  //  - Reward Coin
  const [selectedIdRewardCoin, setSelectedIdRewardCoin] = useState('0');
  const [selectedRewardCoin, setSelectedRewardCoin] = useState({
    value: '',
    label: '',
  });

  // Date Picker
  // Date from
  const [isShowDatePickerDateFrom, setIsShowDatePickerDateFrom] =
    useState(false);
  const [textDateFrom, setTextDateFrom] = useState({
    date: new Date(),
    label: 'Date From',
    isFill: false,
  });

  // Date Ends
  const [isShowDatePickerDateEnds, setIsShowDatePickerDateEnds] =
    useState(false);
  const [textDateEnds, setTextDateEnds] = useState({
    date: new Date(),
    label: 'Date Ends',
    isFill: false,
  });

  // Image File
  const [uploadImage, setUploadImage] = useState({
    value: '',
    label: 'Image File (Optional)',
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        if (isMounted) setLang(screenLang);

        const userData = await AsyncStorage.getItem('userData');
        const dataMember = JSON.parse(userData);
        if (isMounted) setMember(dataMember.member);
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

  useEffect(() => {
    if (lang) {
      setTextDateFrom({
        ...textDateFrom,
        label: lang && lang ? lang.screen_indAds.date_from : '',
      });

      setTextDateEnds({
        ...textDateEnds,
        label: lang && lang ? lang.screen_indAds.date_ends : '',
      });

      setUploadImage({
        ...uploadImage,
        label: lang && lang ? lang.screen_indAds.image_file : '',
      });
    }
  }, [lang]);

  const onMoveIndAdsScreen = () => {
    navigation.navigate('IndAds');
  };

  const showPopupFloating = type => {
    setCurrentTypePopupFloating(type);
    setIsShowPopupFloating(prevValue => !prevValue);
  };

  const showDatePickerDateFrom = () => {
    setIsShowDatePickerDateFrom(true);
  };

  const showDatePickerDateEnds = () => {
    setIsShowDatePickerDateEnds(true);
  };

  const onChangeDateFrom = useCallback(
    (event, datetime) => {
      setIsShowDatePickerDateFrom(false);

      if (event.type === 'set') {
        const label = dateIndividualAds(datetime);
        setTextDateFrom({label, date: datetime, isFill: true});

        const nextDay = new Date(datetime);
        nextDay.setDate(nextDay.getDate() + 1);
        setTextDateEnds({
          label: lang && lang ? lang.screen_indAds.date_ends : '',
          date: nextDay,
          isFill: false,
        });
      }
    },
    [lang],
  );

  const onChangeDateEnds = useCallback((event, datetime) => {
    setIsShowDatePickerDateEnds(false);

    if (event.type === 'set') {
      const label = dateIndividualAds(datetime);
      setTextDateEnds({label, date: datetime, isFill: true});
    }
  }, []);

  const onUploadImage = useCallback(() => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(options, async response => {
      if (response.errorCode === 'permission') {
        requestGalleryPermission();
      } else {
        const data = response.assets[0];
        const uri = response.assets[0].uri;
        const fileSize = data.fileSize;
        const MAX_FILE_SIZE = 500 * 1024 * 1024;

        if (fileSize > MAX_FILE_SIZE) {
          Alert.alert('File is too large, it should not exceed 5MB');
          return;
        }

        try {
          const image = await fetch(uri);
          const blob = await image.blob();
          console.log('Blob:', blob);
          setUploadImage({
            value: blob,
            label: lang && lang ? lang.screen_indAds.image_saved : '',
          });
        } catch (error) {
          console.error('Error converting to Blob:', error);
        }
      }
    });
  }, [lang]);

  const requestGalleryPermission = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.IOS.PHOTO_LIBRARY;

    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      console.log('Permission granted');
    } else {
      console.log('Permission denied');
    }
  };

  const onMoveSelectAreaAds = () => {
    navigation.navigate('SelectAreaIndAds');
  };

  const formFields = [
    {
      group: '',
      fields: [
        {
          type: 'input',
          placeholder: lang?.screen_indAds?.my_ads_name || 'My Ads Name',
          value: adName,
          setValue: setAdName,
        },
        {
          type: 'button',
          label:
            lang && lang
              ? `${lang.screen_indAds.ad_type}${selectedAdType.label}`
              : 'AD Type',
          isDropdown: true,
          onPress: () => showPopupFloating('ad_type'),
        },
        {
          type: 'input',
          placeholder:
            lang?.screen_indAds?.ad_owner || 'AD Owner (company name)',
          value: adOwnerName,
          setValue: setAdOwnerName,
        },
        {
          type: 'input',
          placeholder: lang?.screen_indAds?.ad_title || 'AD Title',
          value: adTitle,
          setValue: setAdTitle,
        },
        {
          type: 'button',
          label: textDateFrom.label,
          onPress: showDatePickerDateFrom,
        },
        {
          type: 'button',
          label: textDateEnds.label,
          onPress: showDatePickerDateEnds,
        },
        {type: 'button', label: uploadImage.label, onPress: onUploadImage},
        {
          type: 'button',
          label:
            lang?.screen_indAds?.location_worldwide || 'Location/Worldwide',
          isDropdown: true,
          isNewScreen: true,
          onPress: onMoveSelectAreaAds,
        },
        {
          type: 'input',
          placeholder: lang?.screen_indAds?.detail_explain || 'Detail Explain',
          value: detailProduct,
          setValue: setDetailProduct,
        },
      ],
    },
    {
      group: 'Expose Settings',
      fields: [
        {
          type: 'button',
          label:
            lang && lang
              ? `${lang.screen_indAds.expose_count}${selectedExposeCount.label}`
              : 'Expose Count',
          isDropdown: true,
          onPress: () => showPopupFloating('expose_count'),
        },
        {
          type: 'button',
          label:
            lang && lang
              ? `${lang.screen_indAds.reward_coin}${selectedRewardCoin.label}`
              : 'Reward Coin',
          isDropdown: true,
          onPress: () => showPopupFloating('reward_coin'),
        },
        {
          type: 'input',
          placeholder:
            lang?.screen_indAds?.amount_reward_per_catch ||
            'Amount Reward per Catch',
          value: rewardAmountPerCatch,
          setValue: setRewardAmountPerCatch,
          keyboardType: 'numeric',
        },
        {
          type: 'input',
          placeholder: lang?.screen_indAds?.total_reward || 'Total Reward',
          value: totalReward,
          setValue: setTotalReward,
          keyboardType: 'numeric',
        },
      ],
    },
    {
      group: 'Calculated Value',
      fields: [
        {
          type: 'input',
          placeholder:
            lang?.screen_indAds?.ads_in_app_price || 'AD’s in-app price',
          value: calculatedValue + '$',
          setValue: setCalculatedValue,
          keyboardType: 'numeric',
          isEditable: false,
        },
      ],
    },
  ];

  const groupedFields = formFields.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});

  const groupedData = Object.values(groupedFields);

  const filterPopupFloatingByType = () => {
    switch (currentTypePopupFloating) {
      case 'ad_type':
        return (
          <RadioGroups
            lang={lang}
            type={currentTypePopupFloating}
            setSelectedType={setSelectedAdType}
            setIsShowPopupFloating={setIsShowPopupFloating}
            selectedId={selectedIdAdType}
            setSelectedId={setSelectedIdAdType}
          />
        );
        break;
      case 'expose_count':
        return (
          <RadioGroups
            lang={lang}
            type={currentTypePopupFloating}
            setSelectedType={setSelectedExposeCount}
            setIsShowPopupFloating={setIsShowPopupFloating}
            selectedId={selectedIdExposeCount}
            setSelectedId={setSelectedIdExposeCount}
          />
        );
        break;
      case 'reward_coin':
        return (
          <RadioGroups
            lang={lang}
            type={currentTypePopupFloating}
            setSelectedType={setSelectedRewardCoin}
            setIsShowPopupFloating={setIsShowPopupFloating}
            selectedId={selectedIdRewardCoin}
            setSelectedId={setSelectedIdRewardCoin}
          />
        );
        break;
      default:
        return <Text>Empty data Floating Point</Text>;
        break;
    }
  };

  const onMoveDetailAdsScreen = () => {
    // const isValid = checkingConditionsAddNewAds(
    //   lang,
    //   adName,
    //   selectedAdType,
    //   adOwnerName,
    //   adTitle,
    //   textDateFrom.isFill,
    //   textDateEnds.isFill,
    //   detailProduct,
    //   selectedExposeCount,
    //   selectedRewardCoin,
    //   rewardAmountPerCatch,
    //   totalReward,
    //   calculatedValue,
    // );

    // if (isValid) {
    navigation.navigate('IndAdsDetail', {
      adName,
      calculatedValue,
      rewardCoin: selectedRewardCoin.value,
      rewardAmountPerCatch,
      exposeCount: selectedExposeCount.value,
      exposeLength: calculateDayDifferenceAds(
        textDateFrom.date,
        textDateEnds.date,
      ),
    });
    // }
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
          <ButtonBack onClick={onMoveIndAdsScreen} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_indAds.title ? lang.screen_indAds.title : ''}
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
          {lang && lang ? lang.screen_indAds.new_ad : 'New AD'}
        </Text>
      </View>

      {/* List Input */}
      <View
        style={{
          flex: 1,
          padding: 10,
          paddingTop: 0,
        }}>
        <FlatList
          data={groupedData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View>
              {item.map((group, index) => (
                <View key={index}>
                  {group.group && (
                    <Text
                      style={{
                        marginHorizontal: 20,
                        marginTop: 10,
                        marginBottom: 24,
                        fontSize: fontSize('body'),
                        color: 'black',
                      }}>
                      {group.group}
                    </Text>
                  )}
                  {group.fields.map((field, index) =>
                    field.type === 'input' ? (
                      <InputIndAds
                        key={index}
                        placeholder={field.placeholder}
                        value={field.value}
                        setValue={field.setValue}
                        isEditable={field.isEditable}
                        keyboardType={field.keyboardType && 'numeric'}
                      />
                    ) : field.type === 'button' ? (
                      <ButtonListWithSub
                        key={index}
                        label={field.label}
                        isDropdown={field.isDropdown}
                        isNewScreen={field.isNewScreen}
                        isTextColorGray
                        onPress={field.onPress}
                      />
                    ) : field.type === 'text' ? (
                      <Text key={index}>
                        {field.label} {field.value}
                      </Text>
                    ) : null,
                  )}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.wrapperListInput}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <ButtonConfirmAds
              onPress={onMoveDetailAdsScreen}
              label={lang && lang ? lang.screen_indAds.place_ad : 'Place Ad'}
            />
          }
        />
      </View>

      {/* Popup Floating */}
      {isShowPopupFloating && (
        <View style={styles.popupFloating}>
          <TouchableOpacity
            style={styles.fullScreenOverlay}
            onPress={() => setIsShowPopupFloating(false)}
            activeOpacity={1}
          />
          <ScrollView style={styles.subPopupFloating}>
            {filterPopupFloatingByType()}
          </ScrollView>
        </View>
      )}

      {/* Date Picker From */}
      {isShowDatePickerDateFrom && (
        <DateTimePicker
          value={textDateFrom.date}
          mode="date"
          is24Hour
          onChange={onChangeDateFrom}
          minimumDate={new Date()}
        />
      )}

      {/* Date Picker Ends */}
      {isShowDatePickerDateEnds && (
        <DateTimePicker
          value={textDateEnds.date}
          mode="date"
          is24Hour
          onChange={onChangeDateEnds}
          minimumDate={new Date(textDateFrom.date).setDate(
            textDateFrom.date.getDate() + 1,
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default FirstNewAdsScreen;

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
    gap: 8,
  },
  popupFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  subPopupFloating: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    width: 320,
    overflow: 'hidden',
    zIndex: 2,
    maxHeight: 200,
  },
});
