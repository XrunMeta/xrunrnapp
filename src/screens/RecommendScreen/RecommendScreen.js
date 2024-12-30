import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  gatewayNodeJS,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const RecommendScreen = () => {
  const navigation = useNavigation();
  const [lang, setLang] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [refEmail, setRefEmail] = useState('');
  const [isRecommend, setIsRecommend] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  //   Call API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        const AsyncUserData = await AsyncStorage.getItem('userData');
        const data = JSON.parse(AsyncUserData);

        console.log({data});

        const body = {
          member: data?.member,
        };

        const result = await gatewayNodeJS('app7110-01', 'POST', body);
        const userData = result.data[0];
        setIsLoading(false);

        const bodyRecommend = {
          member: userData?.member,
        };

        const resultRecommend = await gatewayNodeJS(
          'app7420-03',
          'POST',
          bodyRecommend,
        );
        console.log('Recommend status -> ', resultRecommend?.data[0]);

        setRefEmail(
          resultRecommend?.data[0]?.email?.includes('deleted')
            ? 'Deleted User'
            : resultRecommend?.data[0]?.email || '',
        );

        setIsRecommend(
          resultRecommend?.data[0]?.data
            ? resultRecommend?.data[0]?.data
            : false,
        );
      } catch (err) {
        console.error('Error fetching user data: ', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  const onRegist = () => {
    isRecommend === 'ok'
      ? navigation.navigate('RegistRecommend')
      : setModalVisible(true);
  };

  const onRandom = () => {
    isRecommend === 'ok'
      ? navigation.navigate('RandomRecommend')
      : setModalVisible(true);
  };

  const onRecombyMe = () => {
    navigation.navigate('RecommendByMe');
  };

  const closeModal = () => {
    // Fungsi untuk menutup modal
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_recommend ? lang.screen_recommend.title : ''}
          </Text>
        </View>
      </View>

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

      {/* List Button */}
      <View
        style={{
          paddingVertical: 10,
          flex: 1,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ButtonList
            label={
              lang && lang.screen_recommend && lang.screen_recommend.category
                ? lang.screen_recommend.category.regist
                : ''
            }
            onPress={onRegist}
          />
          <ButtonList
            label={
              lang && lang.screen_recommend && lang.screen_recommend.category
                ? lang.screen_recommend.category.random
                : ''
            }
            onPress={onRandom}
          />
          <ButtonList
            label={
              lang && lang.screen_recommend && lang.screen_recommend.category
                ? lang.screen_recommend.category.recomByMe
                : ''
            }
            onPress={onRecombyMe}
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

export default RecommendScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2f5f6',
  },
  titleWrapper: {
    paddingVertical: 10,
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
