import React from 'react';
import {View, Image} from 'react-native';

const IconGroup = ({children}) => {
  return <View style={styles.iconGroup}>{children}</View>;
};

export default IconGroup;

const styles = {
  iconGroup: {
    flexDirection: 'row', // Untuk mengatur ikon secara horizontal
    alignItems: 'center', // Untuk mengatur ikon secara vertikal di tengah
    justifyContent: 'center', // Untuk mengatur ikon secara horizontal di tengah
    borderRadius: 20, // Untuk membuat tampilan seperti radio button
    padding: 8, // Atur sesuai kebutuhan Anda
    backgroundColor: 'pink', // Warna latar belakang
  },
};
