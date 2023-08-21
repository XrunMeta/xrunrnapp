import {Text, StyleSheet, Pressable, Image} from 'react-native';
import React from 'react';

const CustomListItem = ({onPress, text, image}) => {
  return (
    <Pressable style={styles.selectItem} onPress={onPress}>
      <Image
        resizeMode="contain"
        style={{
          height: 50,
          width: 40,
          marginRight: 10,
        }}
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
    paddingVertical: 10,
    borderRadius: 15,
    shadowColor: '#969493',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 1,
    marginVertical: 3,
  },
  mediumText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#343a59',
    alignSelf: 'center',
    paddingRight: 10,
  },
});

export default CustomListItem;
