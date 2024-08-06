import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {fontSize, getFontFam} from '../../../utils';

const ButtonList = ({label, onPress, isHaveSubText, subText = 'off'}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isHaveSubText ? '#dfdfdf' : 'white',
        paddingHorizontal: 12,
        marginHorizontal: 8,
        borderRadius: 10,
        marginVertical: 4,
        ...styles.shadow,
      }}
      activeOpacity={isHaveSubText && 1}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: getFontFam() + 'Regular',
            fontSize: fontSize('body'),
            color: 'black',
            paddingVertical: 18,
          }}>
          {label}
        </Text>
        {isHaveSubText && (
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              color: 'black',
              paddingVertical: 18,
              textTransform: 'capitalize',
            }}>
            {subText}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ButtonList;

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
