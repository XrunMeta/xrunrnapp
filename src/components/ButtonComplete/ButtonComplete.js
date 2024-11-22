import {Pressable, StyleSheet, Image, View} from 'react-native';

const ButtonComplete = ({onClick}) => {
  return (
    <View style={styles.bottomSection}>
      <Pressable onPress={onClick}>
        <Image
          source={require('../../../assets/images/icon_check.png')}
          resizeMode="contain"
          style={styles.buttonImage}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 1,
  },
  buttonImage: {
    height: 80,
    width: 80,
  },
});

export default ButtonComplete;
