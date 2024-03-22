import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import {URL_API, getLanguage2, getFontFam} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import crashlytics from '@react-native-firebase/crashlytics';

const realAD = 'ca-app-pub-9457909979646034/7873165988';

const CustomModal = ({visible, text, onOK}) => {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{text}</Text>
          <TouchableOpacity onPress={onOK} style={styles.okButton}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ShowAdScreen = ({route, navigation}) => {
  const {screenName, member, advertisement, coin, coinScreen} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [modalText, setModalText] = useState('');
  const [lang, setLang] = useState({});
  const [interstitialAds, setInterstitialAds] = useState(null);

  const handleOKPress = () => {
    setModalVisible(false);
    console.log('Apakah ini coin screen? ' + coinScreen);

    if (coinScreen == true) {
      navigation.replace(screenName, {
        sendActiveTab: 'Camera',
      });
    } else {
      navigation.replace(screenName);
    }
  };

  useEffect(() => {
    initInterstitial();
  }, []);

  const initInterstitial = async () => {
    const interstitialAd = InterstitialAd.createForAdRequest(
      // TestIds.INTERSTITIAL,
      realAD,
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
          if (data && parseInt(data.data[0].count) > 0) {
            setModalText(lang.screen_showad.success);
            setModalVisible(true);
          } else {
            setModalText(lang.screen_showad.failed);
            setModalVisible(true);
          }
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
    }
  }, [interstitialAds]);

  return (
    <View
      style={[
        styles.root,
        {backgroundColor: modalVisible ? '#000000A5' : 'white'},
      ]}>
      {/* {!adLoaded && ( */}
      {!interstitialAds && (
        <>
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
              fontSize: 13,
              color: 'grey',
            }}>
            Loading ads...
          </Text>
        </>
      )}

      <CustomModal
        visible={modalVisible}
        text={modalText}
        onOK={handleOKPress}
      />
    </View>
  );
};

export default ShowAdScreen;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
    borderRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 13,
    fontFamily: getFontFam() + 'Regular',
    marginBottom: 10,
    color: 'black',
  },
  okButton: {
    backgroundColor: '#343a59',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  okButtonText: {
    color: 'white',
    fontFamily: getFontFam() + 'Regular',
  },
});
