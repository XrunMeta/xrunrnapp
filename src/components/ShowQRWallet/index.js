import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';

const ShowQRWallet = ({cardDataQR, setIsShowQRCodeWallet}) => {
  const qrCodeRef = useRef();
  const [qrCodeURL, setQRCodeURL] = useState('');

  useEffect(() => {
    qrCodeRef.current.toDataURL(dataURL => {
      setQRCodeURL(dataURL);
    });
  }, []);

  // Animated notification in QR
  const [fadeAnim] = useState(new Animated.Value(0));

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
        url: `data:image/png;base64,${qrCodeURL}`,
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

  const fileUrl =
    'https://www.techup.co.in/wp-content/uploads/2020/01/techup_logo_72-scaled.jpg';

  const checkPermission = async () => {
    // Function to check the platform
    // If Platform is Android then check for permissions.

    if (Platform.OS === 'ios') {
      downloadFile();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'Application needs access to your storage to download File',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          downloadFile();
          console.log('Storage Permission Granted.');
        } else {
          // If permission denied then show alert
          Alert.alert('Error', 'Storage Permission Not Granted');
        }
      } catch (err) {
        // To handle permission related exception
        console.log('++++' + err);
      }
    }
  };

  const downloadFile = () => {
    // Get today's date to add the time suffix in filename
    let date = new Date();
    // File URL which we want to download
    let FILE_URL = fileUrl;
    // Function to get extention of the file url
    let file_ext = getFileExtention(FILE_URL);

    file_ext = '.' + file_ext[0];

    // config: To get response by passing the downloading related options
    // fs: Root directory path to download
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          '/file_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          file_ext,
        description: 'downloading file...',
        notification: true,
        // useDownloadManager works with Android only
        useDownloadManager: true,
      },
    };
    config(options)
      .fetch('GET', FILE_URL)
      .then(res => {
        // Alert after successful downloading
        console.log('res -> ', JSON.stringify(res));
        alert('File Downloaded Successfully.');
      });
  };

  const getFileExtention = fileUrl => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
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
            <QRCode
              value={cardDataQR.address}
              logoSize={50}
              size={118}
              logoBackgroundColor="transparent"
              quietZone={18}
              getRef={c => (qrCodeRef.current = c)}
            />
          </View>

          <View style={styles.actionQRCode}>
            {/* Share */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.wrapperActionIconQR}
              onPress={() => shareQRWallet(cardDataQR.address)}>
              <Image
                source={require('../../../assets/images/icon_share.png')}
                style={styles.iconAction}
              />
            </TouchableOpacity>

            {/* Download */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.wrapperActionIconQR}
              onPress={checkPermission}>
              <Image
                source={require('../../../assets/images/download-2-line.png')}
                style={styles.iconAction}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          position: 'absolute',
          bottom: 40,
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
    fontSize: 16,
    margin: 0,
  },
});
