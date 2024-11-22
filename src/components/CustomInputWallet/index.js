import {StyleSheet, Text, View, TextInput, Platform} from 'react-native';
import React from 'react';
import {fontSize, getFontFam} from '../../../utils';

const CustomInputWallet = ({
  label,
  value,
  setValue,
  placeholder,
  isNumber,
  labelVisible = true,
  customFontSize = fontSize('body'),
  readonly = false,
}) => {
  return (
    <View style={styles.container}>
      {labelVisible && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        readOnly={readonly}
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
  input: customFontSize => ({
    marginTop: Platform.OS === 'ios' ? 14 : 0,
    paddingBottom: 10,
    paddingLeft: 10,
    marginTop: Platform.OS === 'ios' ? 14 : 0,
    paddingBottom: 10,
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    fontFamily: getFontFam() + 'Regular',
    color: '#000',
    fontSize: customFontSize,
  }),
});
