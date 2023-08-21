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
    fontSize: 18,
    marginBottom: -5,
    color: '#343a59',
  },
  input: {
    height: 50,
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#343a59',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    paddingRight: 48,
    paddingLeft: 10,
  },
  toggleButton: {
    position: 'absolute',
    top: 30,
    right: 35,
  },
  toggleButtonImage: {
    height: 25,
  },
});

export default CustomInput;
