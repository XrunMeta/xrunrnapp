import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import ButtonBack from '../../components/ButtonBack';
import RNFS from 'react-native-fs';
import {
  getFontFam,
  fontSize,
  getLanguage2,
  URL_API_NODEJS,
  authcode,
} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import {useNavigation} from '@react-navigation/native';

const KeyShowDownload = () => {
  const [lang, setLang] = useState('');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const privateKey =
    '8c8148ff0219e4c77b2c2f2957f53073464ed14e64ea3792a243304395a534c06d2f51f5255b08088679125f56cdda3a033b4ef9d8dffe2de4427982b1b358543c4168d30878b463415392e24329e35a';

  useEffect(() => {
    // Get Language Data
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const userData = await AsyncStorage.getItem('userData');

        const screenLang = await getLanguage2(currentLanguage);
        const getUserData = JSON.parse(userData);

        // Set your language state
        setLang(screenLang);
        setUserData(getUserData);
      } catch (err) {
        console.error('Error in fetchData:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        navigation.replace('Home');
      }
    };

    fetchData();
  }, []);

  const onBack = () => {
    navigation.replace('WalletHome');
  };

  const copyToClipboard = text => {
    Clipboard.setString(text);
    Alert.alert('Success', 'Text copied to clipboard!');
  };

  const checkPermissionAndDownload = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download files',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          downloadFile();
        } else {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          downloadFile();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      downloadFile();
    }
  };

  const downloadFile = async () => {
    const path = `${RNFS.DownloadDirectoryPath}/privateKey.txt`;
    try {
      await RNFS.writeFile(path, privateKey, 'utf8');
      Alert.alert(
        'Success',
        'File downloaded successfully to your Downloads folder!',
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to download the file.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_keyDownload
              ? lang.screen_keyDownload.title
              : ''}{' '}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{paddingHorizontal: 20, paddingVertical: 20, flex: 1}}>
        <View
          style={{
            backgroundColor: 'white',
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: '#cccccc',
          }}>
          <Text style={[styles.text, {marginBottom: 15}]}>{privateKey}</Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              gap: 10,
            }}>
            {/* <TouchableOpacity
              activeOpacity={0.7}
              style={styles.wrapperActionIconQR}
              onPress={checkPermissionAndDownload}>
              <Image
                source={require('../../../assets/images/download-2-line.png')}
                style={[styles.iconAction]}
              />
            </TouchableOpacity> */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.wrapperActionIconQR}
              onPress={() => copyToClipboard(privateKey)}>
              <Image
                source={require('../../../assets/images/icon_copy.png')}
                style={[styles.iconAction, {tintColor: 'black'}]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KeyShowDownload;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  titleWrapper: {
    paddingVertical: 9,
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
  text: {
    fontFamily: getFontFam() + 'Regular',
    textAlign: 'left',
    fontSize: fontSize('body'),
    lineHeight: 19,
    color: '#343a59',
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
});
