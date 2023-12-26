import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Picker} from '@react-native-picker/picker';

const CustomDropdownWallet = ({
  label,
  onSelectedExchange,
  selectedExchange,
  cointrace,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.containerInput}>
        <Picker
          selectedValue={selectedExchange}
          onValueChange={itemValue => onSelectedExchange(itemValue)}
          dropdownIconColor={'#555'}
          mode="dropdown"
          selectionColor={'#555'}>
          {cointrace.map(coin => {
            return (
              <Picker.Item
                style={styles.input}
                label={coin.description}
                key={coin.code}
                value={coin.code}
              />
            );
          })}
        </Picker>
      </View>
    </View>
  );
};

export default CustomDropdownWallet;
const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  label: {
    color: '#505050',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  containerInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    color: '#555',
    backgroundColor: '#fff',
  },
});
