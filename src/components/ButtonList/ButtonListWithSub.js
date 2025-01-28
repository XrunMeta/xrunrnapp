import {StyleSheet, Text, View, TouchableOpacity, Switch} from 'react-native';
import React from 'react';
import {fontSize, getFontFam} from '../../../utils';

const ButtonListWithSub = ({
  label,
  onPress,
  textClicks = '',
  textExposes = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        paddingHorizontal: 12,
        marginHorizontal: 8,
        borderRadius: 10,
        marginVertical: 4,
        ...styles.shadow,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 18,
        }}>
        <Text
          style={{
            fontFamily: getFontFam() + 'Regular',
            fontSize: fontSize('body'),
            color: 'black',
            flex: 1,
          }}>
          {label}
        </Text>
        <View style={{flex: 1}}>
          {textClicks !== '' && (
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('body'),
                color: 'grey',
              }}>
              {textClicks} clicks
            </Text>
          )}

          {textExposes !== '' && (
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('body'),
                color: 'grey',
              }}>
              {textExposes} exposes
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ButtonListWithSub;

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
