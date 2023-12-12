import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const SendWalletScreen = ({route}) => {
  const {currentToken} = route.params;

  return (
    <View>
      <Text>SendWalletScreen dibagian {currentToken}</Text>
    </View>
  );
};

export default SendWalletScreen;
const styles = StyleSheet.create({});
