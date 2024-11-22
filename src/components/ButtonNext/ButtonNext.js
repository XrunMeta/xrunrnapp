import {StyleSheet, Image, View, TouchableOpacity} from 'react-native';

const ButtonNext = ({children, onClick, isDisabled}) => {
  return (
    <View style={styles.bottomSection}>
      <View style={styles.content(children)}>
        {children}

        <TouchableOpacity
          onPress={onClick}
          disabled={isDisabled}
          activeOpacity={0.7}>
          <Image
            source={
              isDisabled
                ? require('../../../assets/images/icon_nextDisable.png')
                : require('../../../assets/images/icon_next.png')
            }
            resizeMode="contain"
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>
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
    flex: 1,
  },
  content: children => ({
    flexDirection: 'row',
    justifyContent: children ? 'space-between' : 'flex-end',
    alignItems: 'center',
    width: '100%',
  }),
  buttonImage: {
    height: 80,
    width: 80,
  },
});

export default ButtonNext;
