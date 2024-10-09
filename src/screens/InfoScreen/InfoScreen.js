import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const InfoScreen = () => {
  const [lang, setLang] = useState({});
  const {isLoggedIn, logout} = useAuth();
  const [userDetails, setUserDetails] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [refEmail, setRefEmail] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  let ScreenHeight = Dimensions.get('window').height;

  const navigation = useNavigation();

  //   Call API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        const AsyncUserData = await AsyncStorage.getItem('userData');
        const data = JSON.parse(AsyncUserData);

        const userResponse = await fetch(
          `${URL_API}&act=app7110-01&member=${data.member}`,
        );
        const userJsonData = await userResponse.json();
        const userData = userJsonData.data[0];

        console.log('Info Screen -> ' + JSON.stringify(userData));
        setIsLoading(false);

        setUserDetails({
          email: userData.email,
          firstname: userData.firstname,
          member: userData.member,
          lastname: userData.lastname,
          gender: userData.gender,
          extrastr: userData.extrastr,
          country: userData.country,
          countrycode: userData.countrycode,
          region: userData.region,
          ages: userData.ages,
        });
      } catch (err) {
        console.error('Error fetching user data: ', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check login status and navigate to SignIn if not logged in
  if (!isLoggedIn) {
    navigation.replace('SignIn');
  }

  const onLogout = () => {
    Alert.alert(
      `${
        lang && lang.alert && lang.alert.title ? lang.alert.title.warning : ''
      }`,
      `${
        lang && lang.screen_info && lang.screen_info.button
          ? lang.screen_info.button.logout
          : ''
      }`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            logout();
            // Go to SignIn Screen
            navigation.reset({
              index: 0,
              routes: [{name: 'SignIn'}],
            });
          },
        },
      ],
    );
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `
Let's join XRUN!!!
Referral me!
Email : ${userDetails.email}
https://play.google.com/store/apps/details?id=run.xrun.xrunapp`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Berhasil berbagi dengan aktivitas tertentu
          console.log(`Berhasil berbagi dengan ${result.activityType}`);
        } else {
          // Berhasil berbagi
          console.log('Berhasil berbagi');
        }
      } else if (result.action === Share.dismissedAction) {
        // Berbagi dibatalkan
        console.log('Berbagi dibatalkan');
      }
    } catch (error) {
      Alert.alert(error.message);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      navigation.replace('Home');
    }
  };

  const onModify = () => {
    navigation.navigate('ConfirmPassword');
  };

  const onSetting = () => {
    navigation.navigate('Setting');
  };

  const onClause = () => {
    navigation.navigate('Clause');
  };

  const onAppInfo = () => {
    navigation.navigate('AppInformation');
  };

  const onRecommend = async () => {
    // Check is Member has recommended
    const response = await fetch(
      `${URL_API}&act=app7420-03&member=${userDetails.member}`,
    );
    const data = await response.json();

    console.log(data);

    setRefEmail(data.email);

    if (data.data === 'ok') {
      navigation.navigate('Recommend');
    } else if (data.data === 'over') {
      setModalVisible(true);
    }
  };

  const onCustomerService = () => {
    navigation.navigate('CustomerService');
  };

  const onBack = () => {
    navigation.navigate('Home');
  };

  const closeModal = () => {
    // Fungsi untuk menutup modal
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
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
            {lang && lang.screen_info ? lang.screen_info.title : ''}
          </Text>
        </View>
      </View>

      {/* User Info */}
      <View
        style={{
          backgroundColor: 'white',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 20,
          marginTop: 10,
        }}>
        <View
          style={{
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              color: 'black',
            }}>
            {userDetails && !isLoading
              ? `${userDetails.firstname}${userDetails.lastname}`
              : 'Loading...'}
          </Text>
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('note'),
              color: 'grey',
              marginTop: -3,
            }}>
            {userDetails && userDetails.email ? userDetails.email : ''}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
          <TouchableOpacity
            onPress={onShare}
            style={{
              padding: 10,
              borderRadius: 35,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'grey',
            }}>
            <Image
              source={require('../../../assets/images/icon_share.png')}
              resizeMode="contain"
              style={{
                height: 15,
                width: 15,
                marginLeft: -1,
                marginRight: 1,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLogout}
            style={{
              padding: 12,
              borderRadius: 35,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'grey',
            }}>
            <Image
              source={require('../../../assets/images/icon_logout.png')}
              resizeMode="contain"
              style={{
                height: 12,
                width: 12,
                marginLeft: 1,
                marginRight: -1,
                opacity: 0.5,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* List Button */}
      <View
        style={{
          paddingVertical: 10,
          flex: 1,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list
                ? lang.screen_info.list.modify
                : ''
            }
            onPress={onModify}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list
                ? lang.screen_info.list.setting
                : ''
            }
            onPress={onSetting}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list
                ? lang.screen_info.list.clause
                : ''
            }
            onPress={onClause}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list
                ? lang.screen_info.list.cs
                : ''
            }
            onPress={onCustomerService}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list
                ? lang.screen_info.list.app_info
                : ''
            }
            onPress={onAppInfo}
          />
          <ButtonList
            label={
              lang && lang.screen_info && lang.screen_info.list
                ? lang.screen_info.list.recommend
                : ''
            }
            onPress={onRecommend}
          />
        </ScrollView>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {lang && lang.screen_info && lang.screen_info.list
                ? lang.screen_info.list.already
                : ''}
            </Text>
            <Text
              style={[
                styles.modalText,
                {fontFamily: getFontFam() + 'Medium', marginBottom: 20},
              ]}>
              {refEmail}
            </Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2f5f6',
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

  // Modal styles
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  modalText: {
    fontSize: fontSize('body'),
    textAlign: 'left',
    color: '#051C60',
    fontFamily: getFontFam() + 'Regular',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: -20,
    marginRight: -18,
    alignSelf: 'flex-end',
  },
  modalButtonText: {
    textAlign: 'center',
    fontSize: fontSize('body'),
    color: '#051C60',
    fontFamily: getFontFam() + 'Bold',
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
});
