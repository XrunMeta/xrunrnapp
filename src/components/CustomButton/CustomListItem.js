import {Text, StyleSheet, Pressable, Image} from 'react-native';
import React from 'react';
import {getFontFam} from '../../../utils';

const CustomListItem = ({onPress, text, image}) => {
  return (
    <Pressable style={styles.selectItem} onPress={onPress}>
      <Image
        resizeMode="contain"
        style={{height: 20, width: 45, marginRight: 10, marginVertical: 15}}
        source={image}
      />
      <Text style={styles.mediumText}>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  selectItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderRadius: 15,
    shadowColor: '#969493',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 1,
    marginVertical: 2,
  },
  mediumText: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: 13,
    color: '#343a59',
    alignSelf: 'center',
    paddingRight: 10,
    marginBottom: -2,
  },
});

export default CustomListItem;
