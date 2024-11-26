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
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import ButtonBack from '../ButtonBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  BottomComponentFixer,
} from '../../../utils';

const CustomInputEdit = ({
  title,
  label,
  value,
  tempValue,
  content,
  isDisable,
  onSaveChange,
  onBack,
  onModalOpen,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  let ScreenHeight = Dimensions.get('window').height;
  const [lang, setLang] = useState({});

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchData(); // Get Language
  }, []);

  const openModal = () => {
    setModalVisible(true);
    if (onModalOpen) onModalOpen();
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
              ? {
                  backgroundColor: '#e5e5e56e',
                  height: 38,
                  marginTop: 10,
                  paddingBottom: 8,
                }
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
        <KeyboardAvoidingView
          style={[styles.modalContainer, {height: ScreenHeight}]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SafeAreaView style={styles.modalContainer}>
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
                      fontSize: fontSize('title'),
                      fontFamily: getFontFam() + 'Bold',
                      color: '#051C60',
                      margin: 10,
                    }}>
                    {lang && lang.screen_modify_information
                      ? lang.screen_modify_information.modify
                      : 'Modify'}{' '}
                    {title}
                  </Text>
                </View>
              </View>

              {/* Content Here */}
              <View
                style={{
                  flexDirection: 'row',
                }}>
                {content}
              </View>
              <BottomComponentFixer count={6} />

              <View
                style={{
                  paddingBottom: 30,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
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
                  }}
                  disabled={value == tempValue ? true : false}>
                  <Image
                    source={
                      value == tempValue
                        ? require('../../../assets/images/icon_nextDisable.png')
                        : require('../../../assets/images/icon_next.png')
                    }
                    resizeMode="contain"
                    style={{height: 80, width: 80}}
                  />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
    paddingRight: 30,
    paddingLeft: -10,
    paddingTop: 7,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomInputEdit;
