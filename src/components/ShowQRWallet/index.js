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

const ShowQRWallet = ({cardDataQR, setIsShowQRCodeWallet}) => {
  const [downloadDisable, setDownloadDisable] = useState(true);
  const [shareDisable, setShareDisable] = useState(true);
  const apiQRCode = 'https://api.qrserver.com/v1/create-qr-code/';
  const [qrCodeData, setQrCodeData] = useState(null);

  // Animated notification in QR
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Convert image qr code to base64
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${apiQRCode}?size=110x110&data=${cardDataQR.address}&margin=10`,
        );
        const data = await response.blob();
        const base64Data = await convertBlobToBase64(data);
        setQrCodeData(base64Data);
        setDownloadDisable(false);
        setShareDisable(false);
      } catch (error) {
        console.error('Error fetching QR code data:', error);
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
      // Callback ini akan dijalankan setelah animasi selesai
      fadeOut(); // Panggil fungsi fadeOut untuk menghilangkan setelah fadeIn selesai
    });
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 6000,
      useNativeDriver: true,
    }).start();
  };

  const copiedHashInQR = hash => {
    Clipboard.setString(hash);
    fadeIn();
  };

  // Share QR
  const shareQRWallet = async hash => {
    try {
      const options = {
        message: hash,
        url: `data:image/png;base64,${qrCodeData}`,
      };

      const result = await Share.open(options);

      if (result.app) {
        console.log(`Berhasil berbagi dengan ${result.app}`);
      } else {
        console.log('Berhasil berbagi');
      }
    } catch (error) {
      console.log('Error sharing QR Code:', error.message);
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
          {
            // title: 'Storage Permission Required',
            // message:
            //   'Application needs access to your storage to download File',
          },
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
        `${apiQRCode}?size=110x110&data=${cardDataQR.address}&margin=10`,
      );

      // Alert after successful downloading
      console.log('res -> ', JSON.stringify(res));
      Alert.alert(
        'Success',
        `${fileName} Image is saved successfully. Please check the gallery`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDownloadDisable(false);
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error downloading qr code:', error);
      Alert.alert('Failed', 'Failed to download qr code.', [
        {
          text: 'OK',
          onPress: () => {
            setDownloadDisable(false);
          },
        },
      ]);
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
            The wallet address has been copied
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
