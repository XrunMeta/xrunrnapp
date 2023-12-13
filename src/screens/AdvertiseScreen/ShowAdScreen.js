import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const ShowAdScreen = ({route}) => {
  const {txid} = route.params;

  return (
    <View style={styles.root}>
      <Text
        style={{
          fontFamily: 'Poppins-Regular',
          fontSize: 13,
          color: 'grey',
        }}>
        Loading Ads... {txid}
      </Text>
    </View>
  );
};

export default ShowAdScreen;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
