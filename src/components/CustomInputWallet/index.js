import {StyleSheet, Text, View, TextInput, Platform} from 'react-native';
import React from 'react';
import {getFontFam} from '../../../utils';

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
    fontFamily: getFontFam() + 'Regular',
  },
  input: customFontSize => ({
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'ios' ? 14 : 0,
    paddingBottom: 10,
    paddingLeft: 10,
    borderBottomColor: '#ddd',
    fontFamily: getFontFam() + 'Regular',
    color: '#000',
    fontSize: customFontSize,
  }),
});
