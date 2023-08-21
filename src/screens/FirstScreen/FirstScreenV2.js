import {
  Alert,
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Pressable,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useCallback} from 'react';

const FirstScreenV2 = () => {
  const {height} = useWindowDimensions();
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);

  const onSignIn = () => {
    navigation.navigate('SignIn');
  };

  const onJoin = () => {
    navigation.navigate('SignUp');
  };

  const onJoinMobile = () => {
    navigation.navigate('SignUp');
  };

  const onResetPressed = () => {
    navigation.navigate('ForgotPassword');
  };

  const images = [
    require('../../../assets/images/image_firstSlider1.png'),
    require('../../../assets/images/image_firstSlider2.png'),
    require('../../../assets/images/image_firstSlider3.png'),
  ];

  const renderImage = ({item}) => (
    <Image source={item} style={styles.sliderImage} resizeMode="cover" />
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.root}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Dapatkan Rewardnya</Text>
          <Text style={styles.title}>Dan Ciptakan Momenmu!</Text>
        </View>

        <View style={styles.sliderWrapper}>
          <FlatList
            data={images}
            renderItem={renderImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={event => {
              // Menghitung indeks gambar yang sedang aktif
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x /
                  event.nativeEvent.layoutMeasurement.width,
              );
              setActiveIndex(newIndex); // Set indeks gambar aktif
            }}
          />
          <View style={styles.sliderNavigator}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.sliderDot,
                  {
                    backgroundColor:
                      activeIndex === index ? '#343a59' : '#dcdcdc',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <CustomButton text="Log in" onPress={onSignIn} />
        <CustomButton
          text="Let's XRUN, Sign me up"
          type="SECONDARY"
          onPress={onJoin}
        />

        <View style={styles.descWrapper}>
          <Text style={styles.text}>
            Silakan baca{' '}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL('https://app.xrun.run/7011.html');
              }}>
              syarat & ketentuan
            </Text>{' '}
            serta{'\n'}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL('https://app.xrun.run/7013.html');
              }}>
              kebijakan privasi
            </Text>{' '}
            di bawah ini untuk mengetahui tentang fitur dan{' '}
            <Text
              style={styles.link}
              onPress={() => {
                Linking.openURL('https://app.xrun.run/7012.html');
              }}>
              penggunaan informasi
            </Text>{' '}
            yang disediakan oleh aplikasi ini.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },

  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f4f5',
  },
  containContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },

  titleWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 25,
  },
  title: {
    fontSize: 23,
    color: '#343a59',
    fontFamily: 'Poppins-Bold',
  },
  sliderWrapper: {
    width: '100%',
  },
  sliderImage: {
    width: 351,
    height: 200,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  sliderNavigator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  sliderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  descWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
  },

  text: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 19,
  },

  link: {
    color: '#343a59',
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'underline',
    fontSize: 15,
    position: 'relative',
  },
});

export default FirstScreenV2;
