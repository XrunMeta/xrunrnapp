import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import ButtonBack from '../ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const langData = require('../../../lang.json');

const CustomInputEdit = ({
  title,
  label,
  value,
  content,
  isDisable,
  onSaveChange,
  onBack,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  let ScreenHeight = Dimensions.get('window').height;
  const [lang, setLang] = useState({});
  const [langCode, setLangCode] = useState('');

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');

        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);
        setLangCode(selectedLanguage);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage(); // Get Language
  }, []);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    onBack();
  };

  // Logika untuk menyimpan perubahan nilai
  const saveChanges = () => {
    const saveResult = onSaveChange();
    console.log(saveResult);
    if (saveResult === 1) {
      closeModal();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={openModal} disabled={isDisable}>
        <View
          style={[
            styles.inputContainer,
            isDisable
              ? {backgroundColor: '#e5e5e56e', height: 30, marginTop: 10}
              : '',
          ]}>
          <Text style={[styles.input, isDisable ? {color: '#a8a8a7'} : '']}>
            {value}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Edited Field Content */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View
            style={[
              {alignItems: 'center', flex: 1, backgroundColor: 'white'},
              {height: ScreenHeight},
            ]}>
            {/* Title */}
            <View style={{flexDirection: 'row'}}>
              <View style={{position: 'absolute', zIndex: 1}}>
                <ButtonBack onClick={closeModal} />
              </View>
              <View
                style={{
                  paddingVertical: 9,
                  alignItems: 'center',
                  backgroundColor: 'white',
                  justifyContent: 'center',
                  flex: 1,
                  elevation: 5,
                  zIndex: 0,
                }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: 'Poppins-Bold',
                    color: '#051C60',
                    margin: 10,
                  }}>
                  {langCode === 'id' ? 'Ubah ' + title : title + ' Modify'}
                </Text>
              </View>
            </View>

            {/* Content Here */}
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
              }}>
              {content}
            </View>

            <View
              style={{
                padding: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                flex: 1,
                width: '100%',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  height: 100,
                  flex: 1,
                }}></View>
              <Pressable
                onPress={saveChanges}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-end',
                  flexDirection: 'column-reverse',
                  height: 100,
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                <Image
                  source={require('../../../assets/images/icon_check.png')}
                  resizeMode="contain"
                  style={{height: 80, width: 80}}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    marginBottom: -10,
    color: '#343a59',
    zIndex: 1,
  },
  inputContainer: {
    height: 40,
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
    paddingRight: 30,
    paddingLeft: -10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomInputEdit;
