import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../../components/ButtonBack';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  dateIndividualAds,
} from '../../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonListWithSub from '../../../components/ButtonList/ButtonListWithSub';
import InputIndAds from '../../../components/CustomInput/InputIndAds';
import RadioGroup from 'react-native-radio-buttons-group';
import DateTimePicker from '@react-native-community/datetimepicker';
import {launchImageLibrary} from 'react-native-image-picker';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const FirstNewAdsScreen = () => {
  const [lang, setLang] = useState('');
  const navigation = useNavigation();
  const [member, setMember] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [adsName, setAdsName] = useState('');
  const [adOwnerName, setAdOwnerName] = useState('');
  const [adTitle, setAdTitle] = useState('');

  // Popup floating
  const [isShowPopupFloating, setIsShowPopupFloating] = useState(false);
  const [selectedId, setSelectedId] = useState('0');
  const [selectedType, setSelectedType] = useState({
    value: '',
    label: 'AD Type',
  });
  const radioButtons = useMemo(
    () => [
      {
        id: '1',
        label: lang && lang ? lang.screen_indAds.image : '',
        value: 'image',
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () =>
          setValueAdType('image', lang && lang ? lang.screen_indAds.image : ''),
      },
      {
        id: '2',
        label: lang && lang ? lang.screen_indAds.coupon : '',
        value: 'coupon',
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () =>
          setValueAdType(
            'coupon',
            lang && lang ? lang.screen_indAds.coupon : '',
          ),
      },
      {
        id: '3',
        label: lang && lang ? lang.screen_indAds.response : '',
        value: 'response',
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () =>
          setValueAdType(
            'response',
            lang && lang ? lang.screen_indAds.response : '',
          ),
      },
    ],
    [lang],
  );

  // Date Picker
  // Date from
  const [isShowDatePickerDateFrom, setIsShowDatePickerDateFrom] =
    useState(false);
  const [textDateFrom, setTextDateFrom] = useState({
    date: new Date(),
    label: 'Date From',
  });

  // Date Ends
  const [isShowDatePickerDateEnds, setIsShowDatePickerDateEnds] =
    useState(false);
  const [textDateEnds, setTextDateEnds] = useState({
    date: new Date(),
    label: 'Date Ends',
  });

  // Image File
  const [textUploadImage, setTextUploadImage] = useState('Image File');

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

  useEffect(() => {
    if (lang) {
      setSelectedType({
        ...selectedType,
        label: lang && lang ? lang.screen_indAds.ad_type : '',
      });

      setTextDateFrom({
        ...textDateFrom,
        label: lang && lang ? lang.screen_indAds.date_from : '',
      });

      setTextDateEnds({
        ...textDateEnds,
        label: lang && lang ? lang.screen_indAds.date_ends : '',
      });

      setTextUploadImage(lang && lang ? lang.screen_indAds.image_file : '');
    }
  }, [lang]);

  const onMoveIndAdsScreen = () => {
    navigation.navigate('IndAds');
  };

  const showPopupFloating = () => {
    setIsShowPopupFloating(prevValue => !prevValue);
  };

  const setValueAdType = (value, label) => {
    setSelectedType({
      value,
      label,
    });
    setIsShowPopupFloating(false);
  };

  const showDatePickerDateFrom = () => {
    setIsShowDatePickerDateFrom(true);
  };

  const showDatePickerDateEnds = () => {
    setIsShowDatePickerDateEnds(true);
  };

  const onChangeDateFrom = (event, datetime) => {
    setIsShowDatePickerDateFrom(false);

    if (event.type === 'set') {
      const label = dateIndividualAds(datetime);
      setTextDateFrom({label, date: datetime});

      // Update Date Ends minimum date to the next day of Date From
      const nextDay = new Date(datetime);
      nextDay.setDate(nextDay.getDate() + 1); // Tambah 1 hari

      setTextDateEnds({
        label: lang && lang ? lang.screen_indAds.date_ends : '',
        date: nextDay,
      });
    }
  };

  const onChangeDateEnds = (event, datetime) => {
    setIsShowDatePickerDateEnds(false);

    if (event.type === 'set') {
      const label = dateIndividualAds(datetime);
      setTextDateEnds({label, date: datetime});
    }
  };

  const onUploadImage = () => {
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
          setTextUploadImage(
            lang && lang ? lang.screen_indAds.image_saved : '',
          );
        } catch (error) {
          console.error('Error converting to Blob:', error);
        }
      }
    });
  };

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
          {lang && lang ? lang.screen_indAds.new_ad : ''}
        </Text>
      </View>

      {/* List Input */}
      <View
        style={{
          flex: 1,
          padding: 10,
          paddingTop: 0,
        }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.wrapperListInput}>
          <InputIndAds
            placeholder={lang && lang ? lang.screen_indAds.my_ads_name : ''}
            value={adsName}
            setValue={setAdsName}
          />
          <ButtonListWithSub
            label={selectedType.label}
            isDropdown
            onPress={showPopupFloating}
            isTextColorGray
          />
          <InputIndAds
            placeholder={lang && lang ? lang.screen_indAds.ad_owner : ''}
            value={adOwnerName}
            setValue={setAdOwnerName}
          />
          <InputIndAds
            placeholder={lang && lang ? lang.screen_indAds.ad_title : ''}
            value={adTitle}
            setValue={setAdTitle}
          />
          <ButtonListWithSub
            isTextColorGray
            label={textDateFrom.label}
            onPress={showDatePickerDateFrom}
          />
          <ButtonListWithSub
            isTextColorGray
            label={textDateEnds.label}
            onPress={showDatePickerDateEnds}
          />
          <ButtonListWithSub
            isTextColorGray
            label={textUploadImage}
            onPress={onUploadImage}
          />
          <ButtonListWithSub
            label={lang && lang ? lang.screen_indAds.location_worldwide : ''}
            isDropdown
            isTextColorGray
            onPress={onMoveSelectAreaAds}
          />
        </ScrollView>
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
            <Text style={styles.titleRadioButton}>
              {lang && lang ? lang.screen_indAds.select_ad_type : ''}
            </Text>

            <RadioGroup
              radioButtons={radioButtons}
              onPress={setSelectedId}
              selectedId={selectedId}
              containerStyle={{
                alignItems: 'flex-start',
                rowGap: 10,
              }}
            />
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
  titleRadioButton: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('subtitle'),
    marginBottom: 16,
    color: 'black',
    marginLeft: 10,
  },
});
