import {StyleSheet, Text, View, TextInput} from 'react-native';
import React from 'react';

const CustomInputWallet = ({
  label,
  value,
  setValue,
  placeholder,
  isNumber,
  labelVisible = true,
  customFontSize = 13,
}) => {
  return (
    <View style={styles.container}>
      {labelVisible && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#a8a8a7"
        style={styles.input(customFontSize)}
        keyboardType={isNumber ? 'numeric' : 'default'}
      />
    </View>
  );
};

export default CustomInputWallet;
const styles = StyleSheet.create({
  label: {
    color: '#000',
    fontFamily: 'Roboto-Regular',
  },
  input: customFontSize => ({
    borderBottomWidth: 1,
    paddingLeft: 10,
    borderBottomColor: '#ddd',
    fontFamily: 'Roboto-Regular',
    color: '#000',
    fontSize: customFontSize,
  }),
});
