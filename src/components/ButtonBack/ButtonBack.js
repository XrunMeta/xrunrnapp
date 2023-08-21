import {StyleSheet, Pressable, Image} from 'react-native';
import React from 'react';

const ButtonBack = ({onClick}) => {
  return (
    <Pressable onPress={onClick} style={styles.btnBack}>
      <Image
        source={require('../../../assets/images/icon_back.png')}
        resizeMode="contain"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btnBack: {
    alignSelf: 'flex-start',
    paddingVertical: 20,
    paddingLeft: 25,
    paddingRight: 30,
  },
});

export default ButtonBack;
