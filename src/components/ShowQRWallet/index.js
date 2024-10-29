import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import {fontSize, gatewayNodeJS, getFontFam} from '../../../utils';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';

const ShowQRWallet = ({cardDataQR, setIsShowQRCodeWallet, lang}) => {
  const [downloadDisable, setDownloadDisable] = useState(true);
  const [shareDisable, setShareDisable] = useState(true);
  const refQR = useRef(null);
  const [QRImage, setQRImage] = useState(null);
  // Animated notification in QR
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const addressWallet = await AsyncStorage.getItem('addressWallet');

        if (JSON.parse(addressWallet) != cardDataQR.address) {
          console.log(
            `New address: ${JSON.parse(addressWallet)} | Old: ${
              cardDataQR.address
            }`,
          );
        }
      } catch (error) {
        Alert.alert('', 'Error fetching QR code data');
        console.error('Error fetching QR code data:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
        navigation.replace('Home');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    refQR.current.toDataURL(data => {
      setQRImage('data:image/png;base64,' + data);
    });
    setDownloadDisable(false);
    setShareDisable(false);
  }, [cardDataQR]);

  // Animation
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      fadeOut();
    });
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 4000,
      useNativeDriver: true,
    }).start();
  };

  const copiedHashInQR = hash => {
    Clipboard.setString(hash);
    fadeIn();
  };

  // Share QR
  const shareQRWallet = async hash => {
    setShareDisable(true);

    try {
      const options = {
        message: hash,
        url: QRImage,
      };

      const result = await Share.open(options);

      if (result.app) {
        console.log(`Successfully shared with ${result.app}`);
      } else {
        console.log('Successfully shared');
      }

      setShareDisable(false);
    } catch (error) {
      setShareDisable(false);
      console.log('Sharing QR Code:', error.message);
      navigation.replace('Home');
    }
  };

  const checkPermission = async () => {
    setDownloadDisable(true);

    // Function to check the platform
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        console.log(granted);
        downloadFile();
      } catch (err) {
        // To handle permission related exception
        console.log('++++' + err);
      }
    } else {
      downloadFile();
    }
  };

  const downloadFile = async () => {
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let hour = String(currentDate.getHours()).padStart(2, '0');
    let minute = String(currentDate.getMinutes()).padStart(2, '0');
    let second = String(currentDate.getSeconds()).padStart(2, '0');

    let fileName = `xrun.qrcode.${year}-${month}-${day}${hour}${minute}${second}.png`;
    const dirs = RNFetchBlob.fs.dirs;
    const qrcodeData = QRImage.split('data:image/png;base64,');
    const filepath = `${dirs.DownloadDir}/${fileName}`;

    if (Platform.OS === 'android') {
      RNFetchBlob.fs
        .writeFile(filepath, qrcodeData[1], 'base64')
        .then(() => {
          Alert.alert(
            '',
            `${fileName} ${
              lang && lang.screen_wallet.download_qrcode_show
                ? lang.screen_wallet.download_qrcode_show
                : ''
            }`,
            [
              {
                text:
                  lang && lang.screen_wallet.confirm_alert
                    ? lang.screen_wallet.confirm_alert
                    : '',
                onPress: () => {
                  setDownloadDisable(false);
                  tokener();
                  passwd();
                },
              },
            ],
          );

          console.log('Successfully saved QR Image');
        })
        .catch(errorMessage => console.log(errorMessage));
    } else if (Platform.OS === 'ios') {
      try {
        const options = {
          title: fileName,
          url: QRImage,
          message: fileName,
        };

        const result = await Share.open(options);

        if (result.message == 'com.apple.UIKit.activity.SaveToCameraRoll') {
          console.log(`Successfully saved QR Image on ios`);

          Alert.alert(
            '',
            `${fileName} ${
              lang && lang.screen_wallet.download_qrcode_show
                ? lang.screen_wallet.download_qrcode_show
                : ''
            }`,
            [
              {
                text:
                  lang && lang.screen_wallet.confirm_alert
                    ? lang.screen_wallet.confirm_alert
                    : '',
                onPress: () => {
                  tokener();
                  passwd();
                  setDownloadDisable(false);
                },
              },
            ],
          );
        }

        setDownloadDisable(false);
      } catch (error) {
        setDownloadDisable(false);
        navigation.replace('Home');
        console.log('Failed saved QR Image on ios:', error.message);
      }
    }
  };

  const tokener = async () => {
    try {
      const body = {
        address: cardDataQR.address,
      };

      const result = await gatewayNodeJS('app4000-tokener', 'POST', body);
      const value = result.data[0].value;
      console.log(`Response app4000-tokener: ${value}`);
      await saveTxtFile(value);
    } catch (err) {
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      console.error('Error request app4000-tokener:', err);
      Alert.alert('Error request app4000-tokener:', err);
      navigation.replace('Home');
    }
  };

  const passwd = async () => {
    try {
      const body = {
        address: cardDataQR.address,
      };

      const result = await gatewayNodeJS('app4000-passwd', 'POST', body);
      const value = result.data[0].value;
      console.log(`Response app4000-tokener: ${value}`);
      await saveTxtFile(value, true);
    } catch (err) {
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      console.error('Error request app4000-passwd:', err);
      Alert.alert('Error request app4000-passwd:', err);
      navigation.replace('Home');
    }
  };

  const saveTxtFile = async (response, isPassword = false) => {
    try {
      let downloadDir =
        RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath;

      const address =
        cardDataQR.address.substring(0, 10) +
        '...' +
        cardDataQR.address.substring(cardDataQR.address.length - 10);
      const filePath = `${downloadDir}/${address}${
        isPassword ? '-password' : ''
      }.txt`;

      await RNFS.writeFile(filePath, response, 'utf8');
      console.log('File saved successfully at:', filePath);
    } catch (err) {
      console.log(`Failed to save file: ${err.message}`);
    }
  };

  return (
    <View style={styles.wrapperShowQRWallet}>
      <View style={styles.showQRWallet}>
        <View style={styles.partTopShowQR}>
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.iconCloseQR}
            onPress={() => setIsShowQRCodeWallet(false)}>
            <Image source={require('../../../assets/images/close-fill.png')} />
          </TouchableOpacity>
          <View style={styles.wrapperImageCurrencyQR}>
            <Image
              source={{
                uri: `data:image/jpeg;base64,${cardDataQR.symbolimg.replace(
                  /(\r\n|\n|\r)/gm,
                  '',
                )}`,
              }}
              style={styles.imageCurrencyQR}
            />
          </View>
          <Text style={styles.titleQR}>{cardDataQR.currencyname}</Text>
          <View style={styles.wrapperCopiedHashQR}>
            <Text style={styles.showQRHash}>
              {cardDataQR.address.substring(0, 20) + '...'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => copiedHashInQR(cardDataQR.address)}>
              <Image source={require('../../../assets/images/clipboard.png')} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.partBottomShowQR}>
          <View style={styles.wrapperImageQRCode}>
            <QRCode
              value={cardDataQR.address}
              getRef={refQR}
              quietZone={8}
              size={120}
            />
          </View>

          <View style={styles.actionQRCode}>
            {/* Share */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.wrapperActionIconQR}
              disabled={shareDisable ? true : false}
              onPress={() => shareQRWallet(cardDataQR.address)}>
              <Image
                source={require('../../../assets/images/icon_share.png')}
                style={[styles.iconAction, shareDisable && {opacity: 0.2}]}
              />
            </TouchableOpacity>

            {/* Download */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.wrapperActionIconQR}
              onPress={checkPermission}
              disabled={downloadDisable ? true : false}>
              <Image
                source={require('../../../assets/images/download-2-line.png')}
                style={[styles.iconAction, downloadDisable && {opacity: 0.2}]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.View
        style={{
          alignItems: 'center',
          opacity: fadeAnim,
          position: 'absolute',
          bottom: 40,
          right: 0,
          left: 0,
        }}>
        <View
          style={{
            backgroundColor: 'rgb(65, 65, 65)',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            maxWidth: 300,
          }}>
          <Image
            source={require('../../../assets/images/xrun_round.png')}
            style={{width: 28, height: 28}}
          />
          <Text style={styles.notificationTextInQR}>
            {lang && lang.screen_wallet.copy_qrcode_show
              ? lang.screen_wallet.copy_qrcode_show
              : ''}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default ShowQRWallet;
const styles = StyleSheet.create({
  wrapperShowQRWallet: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 28,
  },
  showQRWallet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    width: '100%',
  },
  partTopShowQR: {
    backgroundColor: '#343b58',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingHorizontal: 20,
    paddingBottom: 10,
    position: 'relative',
  },
  wrapperCopiedHashQR: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  showQRHash: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: '#fff',
  },
  titleQR: {
    fontFamily: getFontFam() + 'Medium',
    textAlign: 'center',
    color: '#fff',
    fontSize: fontSize('title'),
    marginTop: 10,
  },
  wrapperImageCurrencyQR: {
    alignItems: 'center',
    marginTop: -24,
  },
  imageCurrencyQR: {
    borderRadius: 6,
    backgroundColor: '#fff',
    height: 48,
    width: 48,
    marginTop: -20,
  },
  partBottomShowQR: {
    padding: 20,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  wrapperImageQRCode: {
    alignItems: 'center',
    height: 110,
  },
  iconCloseQR: {
    marginLeft: 'auto',
    transform: [
      {
        translateY: 20,
      },
    ],
  },
  actionQRCode: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  wrapperActionIconQR: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    width: 42,
    height: 42,
    borderRadius: 42,
    backgroundColor: '#f5f5f5',
  },
  iconAction: {
    width: 22,
    height: 22,
  },
  notificationTextInQR: {
    color: '#fff',
    fontFamily: getFontFam() + 'Regular',
    margin: 0,
    maxWidth: 240,
  },
});
