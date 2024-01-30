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
import React, {useEffect, useState} from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import {URL_API} from '../../../utils';
import RNFS from 'react-native-fs';

const ShowQRWallet = ({cardDataQR, setIsShowQRCodeWallet, lang}) => {
  const [downloadDisable, setDownloadDisable] = useState(true);
  const [shareDisable, setShareDisable] = useState(true);
  const apiQRCode = 'https://api.qrserver.com/v1/create-qr-code/';
  const [qrCodeData, setQrCodeData] = useState(null);

  // Animated notification in QR
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const addressWallet = await AsyncStorage.getItem('addressWallet');
        const qrWallet = await AsyncStorage.getItem('qrWallet');

        if (JSON.parse(addressWallet) != cardDataQR.address) {
          console.log(
            `New address: ${JSON.parse(addressWallet)} | Old: ${
              cardDataQR.address
            }`,
          );
          // Convert image qr code to base64
          const response = await fetch(
            `${apiQRCode}?size=200x200&data=${cardDataQR.address}&margin=10`,
          );
          const data = await response.blob();
          const base64Data = await convertBlobToBase64(data);
          await AsyncStorage.setItem(
            'addressWallet',
            JSON.stringify(cardDataQR.address),
          );
          await AsyncStorage.setItem('qrWallet', base64Data);
          setQrCodeData(base64Data);
          setDownloadDisable(false);
          setShareDisable(false);
        } else {
          setQrCodeData(qrWallet);
          setDownloadDisable(false);
          setShareDisable(false);
        }
      } catch (error) {
        Alert.alert('', 'Error fetching QR code data');
        console.error('Error fetching QR code data:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    };

    fetchData();
  }, []);

  const convertBlobToBase64 = blob => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  };

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
        url: `data:image/png;base64,${qrCodeData}`,
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
      console.log('Error sharing QR Code:', error.message);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
    }
  };

  const checkPermission = async () => {
    setDownloadDisable(true);

    // Function to check the platform
    // If Platform is Android then check for permissions.
    if (Platform.OS === 'android' && Platform.Version < 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          downloadFile();
          console.log('Storage Permission Granted.');
        } else {
          setDownloadDisable(false);
        }
      } catch (err) {
        // To handle permission related exception
        console.log('++++' + err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    } else {
      downloadFile();
    }
  };

  const downloadFile = async () => {
    try {
      let currentDate = new Date();
      let year = currentDate.getFullYear();
      let month = String(currentDate.getMonth() + 1).padStart(2, '0');
      let day = String(currentDate.getDate()).padStart(2, '0');
      let hour = String(currentDate.getHours()).padStart(2, '0');
      let minute = String(currentDate.getMinutes()).padStart(2, '0');
      let second = String(currentDate.getSeconds()).padStart(2, '0');

      let fileName = `xrun.qrcode.${year}-${month}-${day}${hour}${minute}${second}.png`;

      // Create the download options
      const {config, fs} = RNFetchBlob;
      let RootDir = fs.dirs.PictureDir;
      let options = {
        fileCache: true,
        addAndroidDownloads: {
          path: `${RootDir}/${fileName}`,
          description: 'Downloading file...',
          notification: true,
          useDownloadManager: true,
        },
      };

      // Start downloading
      const res = await config(options).fetch(
        'GET',
        `${apiQRCode}?size=200x200&data=${cardDataQR.address}&margin=10`,
      );

      // Alert after successful downloading
      console.log('res -> ', JSON.stringify(res));
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
    } catch (error) {
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      console.error('Error downloading qr code:', error);
      Alert.alert(
        '',
        `${
          lang && lang.screen_wallet.failed_download_qrcode_alert
            ? lang.screen_wallet.failed_download_qrcode_alert
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
            },
          },
        ],
      );
    }
  };

  const tokener = async () => {
    try {
      const requestTokener = await fetch(
        `${URL_API}&act=app4000-tokener&address=${cardDataQR.address}`,
        {
          method: 'POST',
        },
      );
      const response = await requestTokener.text();
      console.log(`Response app4000-tokener: ${response}`);
      await saveTxtFile(response);
    } catch (err) {
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      console.error('Error request app4000-tokener:', err);
      Alert.alert('Error request app4000-tokener:', err);
    }
  };

  const passwd = async () => {
    try {
      const requestPasswd = await fetch(
        `${URL_API}&act=app4000-passwd&address=${cardDataQR.address}`,
        {
          method: 'POST',
        },
      );
      const response = await requestPasswd.text();
      console.log(`Response app4000-passwd: ${response}`);
      await saveTxtFile(response, true);
    } catch (err) {
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      console.error('Error request app4000-passwd:', err);
      Alert.alert('Error request app4000-passwd:', err);
    }
  };

  const saveTxtFile = async (response, isPassword = false) => {
    try {
      const address =
        cardDataQR.address.substring(0, 10) +
        '...' +
        cardDataQR.address.substring(cardDataQR.address.length - 10);
      const filePath =
        RNFS.DownloadDirectoryPath +
        `/${address}${isPassword ? '-password' : ''}.txt`;
      await RNFS.writeFile(filePath, response, 'utf8');
      console.log('File saved successfully at:', filePath);
    } catch (err) {
      console.log(`Failed saved file: ${err}`);
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
                uri: `data:image/jpeg;base64,${cardDataQR.symbolimg}`,
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
            {/* <QRCode
                value={cardDataQR.address}
                logoSize={50}
                size={118}
                logoBackgroundColor="transparent"
                quietZone={18}
                getRef={c => (qrCodeRef.current = c)}
              /> */}
            {qrCodeData && (
              <Image
                source={{uri: `data:image/png;base64,${qrCodeData}`}}
                style={{width: 110, height: 110}}
              />
            )}
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
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  titleQR: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    color: '#fff',
    fontSize: 24,
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
    position: 'absolute',
    right: 20,
    top: 10,
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
    fontFamily: 'Poppins-Regular',
    margin: 0,
    maxWidth: 240,
  },
});
