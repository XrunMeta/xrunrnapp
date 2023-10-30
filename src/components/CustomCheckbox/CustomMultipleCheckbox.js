import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

const CustomMultipleChecbox = ({
  texts,
  count = 1,
  singleCheck = false,
  defaultCheckedIndices = [],
  wrapperStyle,
  onCheckChange,
}) => {
  const [checkedIndices, setCheckedIndices] = useState(defaultCheckedIndices);

  const checkBoxToggle = index => {
    let newCheckedIndices;
    if (singleCheck) {
      newCheckedIndices = [index];
    } else {
      if (checkedIndices.includes(index)) {
        newCheckedIndices = checkedIndices.filter(i => i !== index);
      } else {
        newCheckedIndices = [...checkedIndices, index];
      }
    }
    setCheckedIndices(newCheckedIndices);
    onCheckChange(newCheckedIndices); // Memanggil callback dengan status terbaru
  };

  return (
    <View style={wrapperStyle}>
      {Array.from({length: count}).map((_, index) => (
        <TouchableOpacity
          key={index}
          style={styles.container}
          onPress={() => checkBoxToggle(index)}>
          <View
            style={[
              styles.checkbox,
              checkedIndices.includes(index)
                ? styles.checkedBox
                : styles.uncheckedBox,
            ]}>
            {checkedIndices.includes(index) && (
              <Text style={styles.checkMark}>✔</Text>
            )}
          </View>
          <Text style={styles.text}>{texts[index]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginRight: 10,
    marginBottom: 10,
  },
  checkbox: {
    width: 15,
    height: 15,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#343a59',
    borderColor: '#343a59',
  },
  uncheckedBox: {
    backgroundColor: 'transparent',
    borderColor: '#343a59',
  },
  text: {
    fontWeight: '500',
    color: '#343a59',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    marginTop: 2,
  },
  checkMark: {
    color: 'white',
    fontSize: 11,
    marginTop: -2,
    fontWeight: 'bold',
  },
});

export default CustomMultipleChecbox;
