import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import {IronSource} from 'ironsource-mediation';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import crashlytics from '@react-native-firebase/crashlytics';
import FastImage from 'react-native-fast-image';

const androidAdmobAdUnit = process.env.ADMOB_ADUNIT_ANDROID;
const iosAdmobAdUnit = process.env.ADMOB_ADUNIT_IOS;

const androidIronAdUnit = process.env.IRON_ADUNIT_ANDROID;
const iosIronAdUnit = process.env.IRON_ADUNIT_IOS;

const admobAdUnit = Platform.select({
  android: androidAdmobAdUnit,
  ios: iosAdmobAdUnit,
});
const ironAdUnit = Platform.select({
  android: androidIronAdUnit,
  ios: iosIronAdUnit,
});

const CustomModal = ({visible, text, onOK, textOK}) => {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{text}</Text>
          <TouchableOpacity onPress={onOK} style={styles.okButton}>
            <Text style={styles.okButtonText}>{textOK}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ShowAdScreen = ({route}) => {
  const {screenName, member, advertisement, coin, coinScreen} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTextOK, setModalTextOK] = useState('');
  const [lang, setLang] = useState({});
  const [interstitialAd, setInterstitialAd] = useState(null);
  const [isIronReady, setIsIronReady] = useState(false);
  const [showIronSourceAd, setShowIronSourceAd] = useState(false);
  const [isAdmobLoading, setIsAdmobLoading] = useState(false);
  const [isIronLoading, setIsIronLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const handleOKPress = () => {
    setModalVisible(false);

    setTimeout(() => {
      if (coinScreen) {
        navigation.replace(screenName, {
          sendActiveTab: 'Camera',
        });
      } else {
        navigation.replace(screenName);
      }
    }, 600);
  };

  const loadAdmobAd = async () => {
    if (isAdmobLoading) return; // Mencegah permintaan ulang
    setIsAdmobLoading(true);

    try {
      const ad = InterstitialAd.createForAdRequest(
        TestIds.INTERSTITIAL,
        // admobAdUnit,
      );

      ad.addAdEventListener(AdEventType.LOADED, () => {
        setInterstitialAd(ad);
        setIsAdmobLoading(false);
        console.log('AdMob interstitial ad loaded.');
      });

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        setAdCompleted(true);
        console.log('AdMob interstitial ad closed.');
      });

      ad.addAdEventListener(AdEventType.ERROR, async error => {
        console.error('AdMob interstitial ad failed to load:', error);
        setIsAdmobLoading(false);
        await loadIronSourceAd();
      });

      await ad.load();
    } catch (error) {
      console.error('Error loading AdMob ad:', error);
      setIsAdmobLoading(false);
      await loadIronSourceAd();
    }
  };

  // const loadIronSourceAd = async () => {
  //   try {
  //     IronSource.validateIntegration().catch(e => console.error(e));

  //     await IronSource.setAdaptersDebug(true);
  //     await IronSource.shouldTrackNetworkState(true);
  //     await IronSource.setConsent(true);
  //     await IronSource.setMetaData('is_child_directed', ['false']);
  //     await IronSource.setUserId('userTest');
  //     await IronSource.init(ironAdUnit);

  //     IronSource.setLevelPlayInterstitialListener({
  //       onAdReady: adInfo => {
  //         console.log({AdReady: adInfo});
  //         setIsIronReady(true);
  //         setIsLoading(false);
  //         IronSource.showInterstitial();
  //       },
  //       onAdLoadFailed: async error => {
  //         console.log({AdLoadFailed: error});
  //         setIsIronReady(false);
  //         setIsLoading(false);
  //         await loadAdmobAd();
  //       },
  //       onAdClosed: adInfo => {
  //         console.log({AdClosed: adInfo});
  //         setAdCompleted(true);
  //         setIsIronReady(false);
  //       },
  //       onAdShowFailed: (error, adInfo) => {
  //         console.log({AdShowFailed: adInfo, error});
  //         setIsIronReady(false);
  //       },
  //     });

  //     await IronSource.loadInterstitial();
  //   } catch (e) {
  //     console.error(e);
  //     await loadAdmobAd();
  //   }
  // };
  const loadIronSourceAd = async () => {
    if (isIronLoading) return; // Mencegah permintaan ulang
    setIsIronLoading(true);

    try {
      IronSource.validateIntegration().catch(e => console.error(e));
      await IronSource.setAdaptersDebug(true);
      await IronSource.shouldTrackNetworkState(true);
      await IronSource.setConsent(true);
      await IronSource.setMetaData('is_child_directed', ['false']);
      await IronSource.setUserId(member ? member : 'userTest');
      await IronSource.init(ironAdUnit);

      IronSource.setLevelPlayInterstitialListener({
        onAdReady: adInfo => {
          console.log({AdReady: adInfo});
          setIsIronReady(true);
          setIsIronLoading(false);
          IronSource.showInterstitial();
        },
        onAdLoadFailed: async error => {
          console.log({AdLoadFailed: error});
          setIsIronReady(false);
          setIsIronLoading(false);
          await loadAdmobAd();
        },
        onAdClosed: adInfo => {
          console.log({AdClosed: adInfo});
          setAdCompleted(true);
          setIsIronReady(false);
        },
        onAdShowFailed: (error, adInfo) => {
          console.log({AdShowFailed: adInfo, error});
          setIsIronReady(false);
        },
      });

      await IronSource.loadInterstitial();
    } catch (e) {
      console.error(e);
      setIsIronLoading(false);
      await loadAdmobAd();
    }
  };

  const initAds = async () => {
    if (coin % 2 === 1) {
      setShowIronSourceAd(true);
      await loadIronSourceAd();
    } else {
      setShowIronSourceAd(false);
      await loadAdmobAd();
    }
  };

  useEffect(() => {
    const fetchLanguageData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error fetching language data:', err);
      }
    };

    fetchLanguageData();
    initAds();
  }, []);

  useEffect(() => {
    if (adCompleted) {
      const coinAcquiring = async () => {
        try {
          const response = await fetch(
            `${URL_API}&act=app3100-01&advertisement=${advertisement}&coin=${coin}&member=${member}`,
          );
          const data = await response.json();
          console.log(
            'Coin acquisition response:',
            JSON.stringify(data.data[0]),
          );

          if (data && parseInt(data.data[0].count) === 1) {
            setModalText(lang?.screen_showad?.success);
          } else {
            setModalText(lang?.screen_showad?.failed);
          }

          setModalVisible(true);
          setModalTextOK(lang.screen_showad.textOK);
        } catch (err) {
          crashlytics().recordError(new Error(err));
          crashlytics().log(err);
          console.error('Error in coin acquisition:', err);
        }
      };

      coinAcquiring();
    }
  }, [adCompleted, navigation]);

  useEffect(() => {
    if (interstitialAd) {
      interstitialAd.show();
      setIsLoading(false);
    }
  }, [interstitialAd]);

  return (
    <View
      style={[
        styles.root,
        {backgroundColor: modalVisible ? '#000000A5' : 'white'},
      ]}>
      {isLoading && (
        <View style={{alignItems: 'center'}}>
          <FastImage
            style={{width: 150, height: 150}}
            source={{
              uri: 'https://www.xrun.run/assets/video/gif_loader.gif',
              priority: FastImage.priority.high,
            }}
          />
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              color: 'grey',
              textAlign: 'center',
            }}>
            Loading
          </Text>
          {/* <Text>
            Interstitial status:{' '}
            {showIronSourceAd
              ? isIronReady
                ? 'Ready'
                : 'Not Ready'
              : interstitialAd
              ? 'Ready'
              : 'Not Ready'}
          </Text> */}
        </View>
      )}

      <CustomModal
        visible={modalVisible}
        text={modalText}
        onOK={handleOKPress}
        textOK={modalTextOK}
      />
    </View>
  );
};

export default ShowAdScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000A5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    position: 'absolute',
    width: '85%',
    paddingTop: 24,
    marginHorizontal: 'auto',
  },
  modalText: {
    fontSize: fontSize('subtitle'),
    fontFamily: getFontFam() + 'Regular',
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#388Dc8',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    width: 110,
    alignSelf: 'center',
    marginTop: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  okButtonText: {
    fontSize: fontSize('body'),
    fontFamily: getFontFam() + 'Bold',
    color: 'white',
    textAlign: 'center',
  },
});
