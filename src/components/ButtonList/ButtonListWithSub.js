import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import React from 'react';
import {fontSize, getFontFam} from '../../../utils';

const ButtonListWithSub = ({
  label,
  onPress,
  textClicks = '',
  textExposes = '',
  isTextColorGray = false,
  isDropdown = false,
  isNewScreen = false,
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
        minHeight: 50,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 18,
        }}>
        {label !== '' && (
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              color: isTextColorGray ? 'gray' : 'black',
              flex: 1,
            }}>
            {label}
          </Text>
        )}
        <View style={{flex: isDropdown ? 0 : 1}}>
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

          {isDropdown && (
            <Image
              source={require('../../../assets/images/icon_dropdown.png')}
              style={{
                tintColor: '#acb5bb',
                height: 10,
                width: 20,
                transform: [{rotate: isNewScreen ? '-90deg' : '0deg'}],
              }}
            />
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
