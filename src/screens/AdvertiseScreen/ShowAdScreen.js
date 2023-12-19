import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useInterstitialAd, TestIds} from '@react-native-admob/admob';

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
  const {member, advertisement, coin} = route.params;
  const {adLoaded, adDismissed, show} = useInterstitialAd(
    // TestIds.INTERSTITIAL,
    realAD,
    {
      requestOptions: {
        requestNonPersonalizedAdsOnly: true,
      },
    },
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [modalText, setModalText] = useState('');

  const handleOKPress = () => {
    setModalVisible(false);
    navigation.replace('AdvertiseHome');
  };

  useEffect(() => {
    const loadAd = async () => {
      if (adLoaded) {
        console.log('Harusnya nampilin disini');
        show();
        setAdCompleted(true);
      }
    };

    loadAd();
  }, [adLoaded, show]);

  useEffect(() => {
    // Cek apakah iklan selesai
    if (adDismissed && adCompleted) {
      console.log(`
        Member : ${member}
        Adver  : ${advertisement}
        Coin   : ${coin}
      `);
      // Coin Acquired
      const coinAcquiring = async () => {
        try {
          const response = await fetch(
            `https://app.xrun.run/gateway.php?act=app3100-01&advertisement=${advertisement}&coin=${coin}&member=${coin}`,
          );
          const data = await response.json();
          console.log('bgst -> ' + JSON.stringify(data.data[0]));

          // If Success
          if (data && data.data[0].count > 0) {
            setModalText('Coin Acquired Successfully!');
            setModalVisible(true);
          } else {
            setModalText('Coin Acquisition Failed.');
            setModalVisible(true);
          }
        } catch (err) {
          console.error(
            'Error retrieving selfCoordinate from AsyncStorage:',
            err,
          );
        }
      };

      coinAcquiring();
    }
  }, [adDismissed, navigation]);

  return (
    <View
      style={[
        styles.root,
        {backgroundColor: modalVisible ? '#000000A5' : 'white'},
      ]}>
      {!adLoaded && (
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: 13,
            color: 'grey',
          }}>
          Loading ads...
        </Text>
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
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
  },
});
