import {StyleSheet, TextInput} from 'react-native';
import React from 'react';
import {fontSize, getFontFam} from '../../../utils';

const InputIndAds = ({
  value,
  setValue,
  placeholder,
  isEditable = true,
  keyboardType = 'default',
}) => {
  return (
    <TextInput
      style={{
        backgroundColor: 'white',
        paddingHorizontal: 12,
        marginHorizontal: 8,
        borderRadius: 10,
        marginVertical: 4,
        ...styles.shadow,
        fontFamily: getFontFam() + 'Regular',
        fontSize: fontSize('body'),
        color: 'black',
        minHeight: 50,
      }}
      value={value}
      placeholder={placeholder}
      placeholderTextColor="gray"
      onChangeText={valueText => {
        setValue(valueText);
      }}
      keyboardType={keyboardType}
      editable={isEditable}
    />
  );
};

export default InputIndAds;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.51,
    elevation: 1,
  },
});
