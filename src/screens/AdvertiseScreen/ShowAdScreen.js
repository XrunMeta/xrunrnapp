// import {
//   Modal,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Platform,
//   Button,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import {
//   AdEventType,
//   InterstitialAd,
//   TestIds,
// } from 'react-native-google-mobile-ads';
// import {IronSource} from 'ironsource-mediation';
// import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {useNavigation} from '@react-navigation/native';
// import crashlytics from '@react-native-firebase/crashlytics';
// import FastImage from 'react-native-fast-image';

// const android_admobAdunit = process.env.ADMOB_ADUNIT_ANDROID;
// const ios_admobAdunit = process.env.ADMOB_ADUNIT_IOS;

// const android_ironAdunit = process.env.IRON_ADUNIT_ANDROID;
// const ios_ironAdunit = process.env.IRON_ADUNIT_IOS;

// // Ads AD UNIT
// const admobAdunit = Platform.select({
//   android: android_admobAdunit,
//   ios: ios_admobAdunit,
// });
// const ironAdunit = Platform.select({
//   android: android_ironAdunit,
//   ios: ios_ironAdunit,
// });

// const CustomModal = ({visible, text, onOK, textOK}) => {
//   return (
//     <Modal transparent animationType="slide" visible={visible}>
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalText}>{text}</Text>
//           <TouchableOpacity onPress={onOK} style={styles.okButton}>
//             <Text style={styles.okButtonText}>{textOK}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const ShowAdScreen = ({route}) => {
//   const {screenName, member, advertisement, coin, coinScreen} = route.params;
//   const [modalVisible, setModalVisible] = useState(false);
//   const [adCompleted, setAdCompleted] = useState(false);
//   const [modalText, setModalText] = useState('');
//   const [modalTextOK, setModalTextOK] = useState('');
//   const [lang, setLang] = useState({});
//   const [interstitialAds, setInterstitialAds] = useState(null);
//   const [isIronReady, setIsIronReady] = useState(false);
//   const [showIronSourceAd, setShowIronSourceAd] = useState(false);
//   const navigation = useNavigation();

//   const handleOKPress = () => {
//     setModalVisible(false);

//     setTimeout(() => {
//       if (coinScreen == true) {
//         navigation.replace(screenName, {
//           sendActiveTab: 'Camera',
//         });
//       } else {
//         navigation.replace(screenName);
//       }
//     }, 600);
//   };

//   const initAdmob = async () => {
//     const interstitialAd = InterstitialAd.createForAdRequest(
//       TestIds.INTERSTITIAL,
//       // admobAdunit,
//     );

//     interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
//       setInterstitialAds(interstitialAd);
//       console.log('Interstitial has loaded!');
//     });

//     interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
//       setAdCompleted(true);
//       console.log('Interstitial has closed!');
//     });

//     interstitialAd.load();
//   };

//   const initIronSource = async () => {
//     try {
//       // This API can be called in parallel
//       IronSource.validateIntegration().catch(e => console.error(e));

//       // Set adapters and network SDKs to debug
//       await IronSource.setAdaptersDebug(true);

//       // This should be enabled to detect network condition errors
//       await IronSource.shouldTrackNetworkState(true);

//       // GDPR Consent
//       await IronSource.setConsent(true);

//       // COPPA
//       await IronSource.setMetaData('is_child_directed', ['false']);

//       // Do not use advertiserId for this.
//       // Use an application user id.
//       // await IronSource.setUserId(APP_USER_ID)
//       await IronSource.setUserId('userTest');

//       // To init with all ad units
//       await IronSource.init(ironAdunit);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const ironListener = {
//     onAdReady: adInfo => {
//       console.log({AdReady: adInfo});
//       setIsIronReady(true);
//     },
//     onAdLoadFailed: error => {
//       console.log({AdLoadFailed: error});
//       setIsIronReady(false);
//     },
//     onAdOpened: adInfo => {
//       console.log({AdOpened: adInfo});
//     },
//     onAdClosed: adInfo => {
//       console.log({AdClosed: adInfo});
//       setIsIronReady(false);
//     },
//     onAdShowFailed: (error, adInfo) => {
//       console.log({AdShowFailed: adInfo, error});
//       setIsIronReady(false);
//     },
//     onAdClicked: adInfo => {
//       console.log({AdClicked: adInfo});
//     },
//     onAdShowSucceeded: adInfo => {
//       console.log({AdShowSucceeded: adInfo});
//       setIsIronReady(false);
//     },
//   };

//   useEffect(() => {
//     // Get Language Data
//     const fetchData = async () => {
//       try {
//         const currentLanguage = await AsyncStorage.getItem('currentLanguage');
//         const screenLang = await getLanguage2(currentLanguage);

//         // Set your language state
//         setLang(screenLang);
//       } catch (err) {
//         crashlytics().recordError(new Error(err));
//         crashlytics().log(err);
//         console.error('Error in fetchData:', err);
//       }
//     };

//     const determineAdProvider = async () => {
//       if (coin % 2 === 1) {
//         await initIronSource();
//         await IronSource.loadInterstitial();
//         IronSource.setLevelPlayInterstitialListener(ironListener);

//         if (await IronSource.isInterstitialReady()) {
//           IronSource.showInterstitial();
//         } else {
//           console.log('Interstitial ad is not ready.');
//         }

//         setShowIronSourceAd(true);
//       } else {
//         setShowIronSourceAd(false);
//         initAdmob();
//       }
//     };

//     determineAdProvider();
//     fetchData();
//   }, []);

//   useEffect(() => {
//     // Cek apakah iklan selesai
//     if (adCompleted) {
//       console.log(`
//         Member : ${member}
//         Adver  : ${advertisement}
//         Coin   : ${coin}
//       `);
//       // Coin Acquired
//       const coinAcquiring = async () => {
//         try {
//           const response = await fetch(
//             `${URL_API}&act=app3100-01&advertisement=${advertisement}&coin=${coin}&member=${member}`,
//           );
//           const data = await response.json();
//           console.log('Coin Acq Response -> ' + JSON.stringify(data.data[0]));

//           // If Success
//           if (data && parseInt(data.data[0].count) == 1) {
//             setModalText(lang?.screen_showad?.success);
//             setModalVisible(true);
//           } else {
//             setModalText(lang?.screen_showad?.failed);
//             setModalVisible(true);
//           }

//           setModalTextOK(lang.screen_showad.textOK);
//         } catch (err) {
//           crashlytics().recordError(new Error(err));
//           crashlytics().log(err);
//           console.error(
//             'Error retrieving selfCoordinate from AsyncStorage:',
//             err,
//           );
//         }
//       };

//       coinAcquiring();
//     }
//   }, [adCompleted, navigation]);

//   useEffect(() => {
//     if (interstitialAds) {
//       interstitialAds.show();
//     }
//   }, [interstitialAds]);

//   return (
//     <View
//       style={[
//         styles.root,
//         {backgroundColor: modalVisible ? '#000000A5' : 'white'},
//       ]}>
//       {!interstitialAds && (
//         <View style={{alignItems: 'center'}}>
//           <FastImage
//             style={{width: 150, height: 150}}
//             source={{
//               uri: 'https://www.xrun.run/assets/video/gif_loader.gif',
//               priority: FastImage.priority.high,
//             }}
//           />
//           <Text
//             style={{
//               fontFamily: getFontFam() + 'Regular',
//               fontSize: fontSize('body'),
//               color: 'grey',
//               textAlign: 'center',
//             }}>
//             Loading
//           </Text>
//           <Text>
//             Interstitial status:{' '}
//             {showIronSourceAd
//               ? isIronReady
//                 ? 'Ready'
//                 : 'Not Ready'
//               : interstitialAds
//               ? 'Ready'
//               : 'Not Ready'}
//           </Text>
//         </View>
//       )}

//       <CustomModal
//         visible={modalVisible}
//         text={modalText}
//         onOK={handleOKPress}
//         textOK={modalTextOK}
//       />
//     </View>
//   );
// };

// export default ShowAdScreen;

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: '#000000A5',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 12,
//     elevation: 5,
//     position: 'absolute',
//     width: '85%',
//     paddingTop: 24,
//     marginHorizontal: 'auto',
//   },
//   modalText: {
//     fontSize: fontSize('subtitle'),
//     fontFamily: getFontFam() + 'Regular',
//     marginBottom: 10,
//     color: 'black',
//     textAlign: 'center',
//   },
//   okButton: {
//     backgroundColor: '#388Dc8',
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     borderRadius: 8,
//     width: 110,
//     alignSelf: 'center',
//     marginTop: 2,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 6,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   okButtonText: {
//     color: 'white',
//     fontFamily: getFontFam() + 'Regular',
//     textAlign: 'center',
//   },
// });
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

const android_admobAdunit = process.env.ADMOB_ADUNIT_ANDROID;
const ios_admobAdunit = process.env.ADMOB_ADUNIT_IOS;

const android_ironAdunit = process.env.IRON_ADUNIT_ANDROID;
const ios_ironAdunit = process.env.IRON_ADUNIT_IOS;

// Ads AD UNIT
const admobAdunit = Platform.select({
  android: android_admobAdunit,
  ios: ios_admobAdunit,
});
const ironAdunit = Platform.select({
  android: android_ironAdunit,
  ios: ios_ironAdunit,
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
  const [interstitialAds, setInterstitialAds] = useState(null);
  const [isIronReady, setIsIronReady] = useState(false);
  const [showIronSourceAd, setShowIronSourceAd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const handleOKPress = () => {
    setModalVisible(false);

    setTimeout(() => {
      if (coinScreen === true) {
        navigation.replace(screenName, {
          sendActiveTab: 'Camera',
        });
      } else {
        navigation.replace(screenName);
      }
    }, 600);
  };

  const initAdmob = async () => {
    const interstitialAd = InterstitialAd.createForAdRequest(
      TestIds.INTERSTITIAL,
      // admobAdunit,
    );

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialAds(interstitialAd);
      console.log('Interstitial has loaded!');
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      setAdCompleted(true);
      console.log('Interstitial has closed!');
    });

    interstitialAd.load();
  };

  const initIronSource = async () => {
    try {
      // This API can be called in parallel
      IronSource.validateIntegration().catch(e => console.error(e));

      // Set adapters and network SDKs to debug
      await IronSource.setAdaptersDebug(true);

      // This should be enabled to detect network condition errors
      await IronSource.shouldTrackNetworkState(true);

      // GDPR Consent
      await IronSource.setConsent(true);

      // COPPA
      await IronSource.setMetaData('is_child_directed', ['false']);

      // Do not use advertiserId for this.
      // Use an application user id.
      // await IronSource.setUserId(APP_USER_ID)
      await IronSource.setUserId('userTest');

      // To init with all ad units
      await IronSource.init(ironAdunit);

      // Set the listener
      IronSource.setLevelPlayInterstitialListener(ironListener);

      // Load the interstitial ad
      await IronSource.loadInterstitial();
    } catch (e) {
      console.error(e);
    }
  };

  const ironListener = {
    onAdReady: adInfo => {
      console.log({AdReady: adInfo});
      setIsIronReady(true);
      setIsLoading(false); // Stop loading when ad is ready
      IronSource.showInterstitial(); // Show the ad when ready
    },
    onAdLoadFailed: error => {
      console.log({AdLoadFailed: error});
      setIsIronReady(false);
      setIsLoading(false); // Stop loading if ad failed to load
    },
    onAdOpened: adInfo => {
      console.log({AdOpened: adInfo});
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
    onAdClicked: adInfo => {
      console.log({AdClicked: adInfo});
    },
    onAdShowSucceeded: adInfo => {
      console.log({AdShowSucceeded: adInfo});
    },
  };

  useEffect(() => {
    // Get Language Data
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        // Set your language state
        setLang(screenLang);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error in fetchData:', err);
      }
    };

    const determineAdProvider = async () => {
      if (coin % 2 === 1) {
        setShowIronSourceAd(true);
        await initIronSource();
      } else {
        setShowIronSourceAd(false);
        await initAdmob();
      }
    };

    determineAdProvider();
    fetchData();
  }, []);

  useEffect(() => {
    // Cek apakah iklan selesai
    if (adCompleted) {
      console.log(`
        Member : ${member}
        Adver  : ${advertisement}
        Coin   : ${coin}
      `);
      // Coin Acquired
      const coinAcquiring = async () => {
        try {
          const response = await fetch(
            `${URL_API}&act=app3100-01&advertisement=${advertisement}&coin=${coin}&member=${member}`,
          );
          const data = await response.json();
          console.log('Coin Acq Response -> ' + JSON.stringify(data.data[0]));

          // If Success
          if (data && parseInt(data.data[0].count) === 1) {
            setModalText(lang?.screen_showad?.success);
            setModalVisible(true);
          } else {
            setModalText(lang?.screen_showad?.failed);
            setModalVisible(true);
          }

          setModalTextOK(lang.screen_showad.textOK);
        } catch (err) {
          crashlytics().recordError(new Error(err));
          crashlytics().log(err);
          console.error(
            'Error retrieving selfCoordinate from AsyncStorage:',
            err,
          );
        }
      };

      coinAcquiring();
    }
  }, [adCompleted, navigation]);

  useEffect(() => {
    if (interstitialAds) {
      interstitialAds.show();
      setIsLoading(false); // Stop loading when ad is shown
    }
  }, [interstitialAds]);

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
          <Text>
            Interstitial status:{' '}
            {showIronSourceAd
              ? isIronReady
                ? 'Ready'
                : 'Not Ready'
              : interstitialAds
              ? 'Ready'
              : 'Not Ready'}
          </Text>
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
    color: 'white',
    fontFamily: getFontFam() + 'Regular',
    textAlign: 'center',
  },
});
