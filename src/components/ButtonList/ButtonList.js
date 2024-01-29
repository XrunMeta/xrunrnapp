import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';

const ButtonList = ({label, onPress}) => {
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
      <View>
        <Text
          style={{
            fontFamily: 'Roboto-Regular',
            fontSize: 13,
            color: 'black',
            paddingVertical: 18,
          }}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ButtonList;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 3.5,
  },
});
