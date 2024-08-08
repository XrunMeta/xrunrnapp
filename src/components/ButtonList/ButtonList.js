import {StyleSheet, Text, View, TouchableOpacity, Switch} from 'react-native';
import React from 'react';
import {fontSize, getFontFam} from '../../../utils';

const ButtonList = ({
  label,
  onPress,
  isHaveSubText,
  isStatusOtherChains,
  statusOtherChains = 'off',
  changeStatusOtherChains,
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
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Switch
              trackColor={{false: 'grey', true: 'tomato'}}
              thumbColor={'#f4f3f4'}
              ios_backgroundColor={'grey'}
              onValueChange={changeStatusOtherChains}
              value={isStatusOtherChains}
            />
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('body'),
                color: 'black',
                paddingVertical: 18,
                textTransform: 'capitalize',
              }}>
              {statusOtherChains}
            </Text>
          </View>
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
