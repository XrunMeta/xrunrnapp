import {StyleSheet, Text, View, ScrollView, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';
import {getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const RecommendScreen = () => {
  const navigation = useNavigation();
  const [lang, setLang] = useState('');

  //   Call API
  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchData();
  }, []);

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  const onRegist = () => {
    navigation.navigate('RegistRecommend');
  };

  const onRandom = () => {
    navigation.navigate('RandomRecommend');
  };

  const onRecombyMe = () => {
    navigation.navigate('RecommendByMe');
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
      {/* <Modal
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
                    Deleted Member
                  </Text>
                  <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>  */}
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
});
