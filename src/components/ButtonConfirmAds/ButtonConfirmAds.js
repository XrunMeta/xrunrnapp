import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {fontSize, getFontFam} from '../../../utils';

const ButtonConfirmAds = ({label, onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ButtonConfirmAds;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fedc00',
    marginTop: 48,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
    borderRadius: 50,
    minWidth: 110,
  },
  text: {
    color: 'black',
    fontFamily: getFontFam() + 'Bold',
    fontSize: fontSize('subtitle'),
    textAlign: 'center',
  },
});
