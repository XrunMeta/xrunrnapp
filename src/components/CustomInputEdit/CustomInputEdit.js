import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TemplateScreen from '../../screens/TemplateScreen';

const CustomInputEdit = ({
  title,
  label,
  value,
  setValue,
  placeholder,
  content,
  isDisable,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const navigation = useNavigation();

  const openModal = () => {
    setTempValue(value); // Set nilai sementara sesuai dengan nilai awal
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const saveChanges = () => {
    // Logika untuk menyimpan perubahan nilai
    setValue(tempValue);
    closeModal();
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
          {/* <Text style={styles.input}>{value}</Text> */}
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
          <TemplateScreen
            title={title}
            content={content}
            onBack={closeModal}
            onSave={saveChanges}
          />
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalInput: {
    height: 40,
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#051C60',
  },
});

export default CustomInputEdit;
