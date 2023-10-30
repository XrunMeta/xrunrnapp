import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import React, {useState} from 'react';

const CustomInput = ({
  label,
  value,
  setValue,
  placeholder,
  isPassword = false,
}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  const toggleSecureEntry = () => {
    if (isPassword) {
      setSecureTextEntry(!secureTextEntry);
    }
  };

  const clearInput = () => {
    setValue('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#a8a8a7"
        style={styles.input}
        secureTextEntry={secureTextEntry}
      />
      {isPassword && (
        <Pressable onPress={toggleSecureEntry} style={styles.toggleButton}>
          {secureTextEntry ? (
            <Image
              source={require('../../../assets/images/icon_hidePassword.png')}
              resizeMode="contain"
              style={styles.toggleButtonImage}
            />
          ) : (
            <Image
              source={require('../../../assets/images/icon_showPassword.png')}
              resizeMode="contain"
              style={styles.toggleButtonImage}
            />
          )}
        </Pressable>
      )}
      {!isPassword && value !== '' && (
        <Pressable onPress={clearInput} style={styles.toggleButton}>
          <Image
            source={require('../../../assets/images/icon_close.png')}
            resizeMode="contain"
            style={styles.toggleButtonImage}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: 30,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    marginBottom: -10,
    color: '#343a59',
  },
  input: {
    height: 40,
    paddingBottom: -10,
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    paddingRight: 30,
    paddingLeft: -10,
  },
  toggleButton: {
    position: 'absolute',
    top: 25,
    right: 23,
  },
  toggleButtonImage: {
    height: 15,
  },
});

export default CustomInput;
