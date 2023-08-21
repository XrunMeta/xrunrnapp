import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

const CustomMultipleChecbox = ({
  texts,
  count = 1,
  singleCheck = false,
  defaultCheckedIndices = [],
  wrapperStyle,
}) => {
  const [checkedIndices, setCheckedIndices] = useState(defaultCheckedIndices);

  const checkBoxToggle = index => {
    if (singleCheck) {
      setCheckedIndices([index]);
    } else {
      if (checkedIndices.includes(index)) {
        setCheckedIndices(checkedIndices.filter(i => i !== index));
      } else {
        setCheckedIndices([...checkedIndices, index]);
      }
    }
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
    marginHorizontal: 10,
    marginBottom: 10,
  },
  checkbox: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
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
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  checkMark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomMultipleChecbox;
