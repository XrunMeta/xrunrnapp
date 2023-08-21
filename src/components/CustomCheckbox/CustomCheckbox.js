import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

const CustomCheckbox = ({text, isDisable = false}) => {
  const [isChecked, setIsChecked] = useState(true);

  const checkBoxToggle = () => {
    setIsChecked(!isChecked);
    console.log(isChecked);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={checkBoxToggle}>
      <View
        style={[
          styles.checkbox,
          isChecked ? styles.checkedBox : styles.uncheckedBox,
        ]}>
        {isChecked && <Text style={styles.checkMark}>✔</Text>}
      </View>
      <Text style={styles.text} onPress={checkBoxToggle}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: 5,
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

export default CustomCheckbox;
