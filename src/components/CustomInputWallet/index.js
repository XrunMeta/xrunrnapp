import {StyleSheet, Text, View, TextInput} from 'react-native';
import React from 'react';

const CustomInputWallet = ({label, value, setValue, placeholder, isNumber}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#a8a8a7"
        style={styles.input}
        keyboardType={isNumber ? 'numeric' : 'default'}
      />
    </View>
  );
};

export default CustomInputWallet;
const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  label: {
    color: '#505050',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    borderBottomWidth: 1,
    paddingLeft: 10,
    borderBottomColor: '#ddd',
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
});
