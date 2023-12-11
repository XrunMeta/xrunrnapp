import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const TableWalletCard = ({currentToken}) => {
  return (
    <View>
      <Text>{currentToken}</Text>
    </View>
  );
};

export default TableWalletCard;
const styles = StyleSheet.create({});
