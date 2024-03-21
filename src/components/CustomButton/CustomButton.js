import {Text, StyleSheet, Pressable, Platform} from 'react-native';
import React from 'react';
import {getFontFam} from '../../../utils';

const CustomButton = ({
  onPress,
  text,
  type = 'PRIMARY',
  bgColor,
  fgColor,
  firstScreen,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={styles.container(type, bgColor, firstScreen)}
      // style={[
      //   [styles.container, styles[`container_${type}`]],
      //   bgColor ? {backgroundColor: bgColor} : {},
      // ]}
    >
      <Text
        style={[
          styles.text,
          styles[`text_${type}`],
          fgColor ? {color: fgColor} : {},
        ]}>
        {text}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: (type, bgColor, firstScreen) => ({
    width: '100%',
    padding: 15,
    paddingVertical: firstScreen ? (Platform.OS == 'ios' ? 12 : 8) : 8,
    marginTop: 15,
    alignItems: 'center',
    borderRadius: 35,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    backgroundColor: type
      ? type === 'PRIMARY'
        ? '#343a59'
        : '#ffdc04'
      : bgColor,
  }),

  container_PRIMARY: {
    backgroundColor: '#343a59',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },

  container_SECONDARY: {
    backgroundColor: '#ffdc04',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },

  container_TERTIARY: {
    alignItems: 'flex-start',
    padding: 10,
    paddingVertical: 0,
  },

  text_PRIMARY: {
    fontFamily: getFontFam() + 'Bold',
    color: 'white',
  },

  text: {
    color: '#45494c',
    fontSize: 16,
    fontFamily: getFontFam() + 'Medium',
  },

  text_SECONDARY: {
    color: '#45494c',
    fontFamily: getFontFam() + 'Bold',
  },

  text_TERTIARY: {
    fontWeight: 'bold',
    color: '#343a59',
    fontFamily: getFontFam() + 'Medium',
  },
});

export default CustomButton;
