import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {Picker} from '@react-native-picker/picker';

const CustomDropdownWallet = ({
  label,
  onSelectedExchange,
  selectedExchange,
}) => {
  const dropdownProducts = [
    'Binance',
    'Bithumb',
    'Bitmarket',
    'Indodax',
    'Upbit',
    'KuCoin',
    'DigiFinex',
    'TokoCrypto',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.containerInput}>
        <Picker
          selectedValue={selectedExchange}
          onValueChange={itemValue => onSelectedExchange(itemValue)}
          style={styles.input}
          dropdownIconColor={'#292D32'}>
          {dropdownProducts.map((dropdownProduct, index) => {
            const value = dropdownProduct.toLowerCase().split(' ').join('-');

            return (
              <Picker.Item
                style={styles.input}
                label={dropdownProduct}
                key={index}
                value={value}
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
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
  },
  containerInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 152,
  },
  input: {
    fontFamily: 'Poppins-Regular',
    color: '#555',
    fontSize: 16,
  },
});
