import {
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../../components/ButtonBack';
import {getLanguage2, getFontFam, fontSize} from '../../../../utils';
import {useNavigation} from '@react-navigation/native';
import MapAds from '../../../components/Map/MapAds';
import {RadioGroup} from 'react-native-radio-buttons-group';

const SelectAreaNewAdsScreen = () => {
  const [lang, setLang] = useState('');
  const navigation = useNavigation();
  const [member, setMember] = useState(0);

  // Popup floating
  const [isShowPopupFloating, setIsShowPopupFloating] = useState(false);
  const [selectedId, setSelectedId] = useState('1');
  const [selectedExposeArea, setSelectedExposeArea] = useState({
    value: 100,
    label: 'Around',
  });

  const radioButtons = useMemo(
    () => [
      {
        id: '1',
        label: 100,
        value: 100,
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () => setValueAdExposeArea(100, '100'),
      },
      {
        id: '2',
        label: 200,
        value: 200,
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () => setValueAdExposeArea(200, '200'),
      },
      {
        id: '3',
        label: 500,
        value: 500,
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () => setValueAdExposeArea(500, '500'),
      },
      {
        id: '4',
        label: 1000,
        value: 1000,
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () => setValueAdExposeArea(1000, '1000'),
      },
      {
        id: '5',
        label: lang && lang ? lang.screen_indAds.worldwide : 'Worldwide',
        value: 20037500,
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () =>
          setValueAdExposeArea(
            99999,
            lang && lang ? lang.screen_indAds.worldwide : 'Worldwide',
          ),
      },
    ],
    [lang],
  );

  const setValueAdExposeArea = (value, label) => {
    setSelectedExposeArea({
      value,
      label,
    });
    setIsShowPopupFloating(false);
  };

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

  const onMoveFirstNewAdsScreen = () => {
    navigation.navigate('NewIndAds');
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onMoveFirstNewAdsScreen} />
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

      {/* Map */}
      <MapAds
        lang={lang}
        setIsShowPopupFloating={setIsShowPopupFloating}
        labelAround={selectedExposeArea.label}
        valueAround={selectedExposeArea.value}
      />

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
              {lang && lang ? lang.screen_indAds.expose_area : ''}
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
    </SafeAreaView>
  );
};

export default SelectAreaNewAdsScreen;

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
  mapContainer: {
    height: 350,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    width: 'auto',
  },
  mapPointButton: {
    alignItems: 'center',
    position: 'absolute',
    width: 60,
    height: 35,
    zIndex: 1,
    padding: 10,
    marginVertical: 5,
    right: -8,
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
    maxHeight: 280,
  },
  titleRadioButton: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('subtitle'),
    marginBottom: 16,
    color: 'black',
    marginLeft: 10,
  },
});
