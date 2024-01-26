import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import Logo from '../../../assets/images/logoMain_XRUN.png';
import CustomButton from '../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import CustomCheckbox from '../../components/CustomCheckbox';

const FirstScreen = () => {
  const {height} = useWindowDimensions();
  const navigation = useNavigation();

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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.root}>
        <View style={[styles.imageContainer, {height: height / 2.2}]}>
          <Image
            source={Logo}
            style={[styles.image, {height: height / 15}]}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.containContainer, {height: height / 2}]}>
          <Text style={styles.title}>Let's Login Quickly "Catch Me"</Text>

          <View style={styles.additionalLogin}>
            <CustomCheckbox text="Remember User"></CustomCheckbox>

            <Pressable onPress={onResetPressed} style={styles.resetPassword}>
              <Text
                style={{
                  fontWeight: '500',
                  color: '#343a59',
                  fontSize: 16,
                  fontFamily: 'Poppins-Medium',
                }}>
                RESET PASSWORD
              </Text>
            </Pressable>
          </View>

          <CustomButton text="LOGIN" onPress={onSignIn} />
          <CustomButton text="JOIN" type="SECONDARY" onPress={onJoin} />

          <CustomButton
            text="LOGIN BY MOBILE"
            onPress={onJoinMobile}
            type="TERTIARY"
          />
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
  image: {
    width: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#343a59',
    fontFamily: 'Poppins-Medium',
    marginTop: 10,
    marginBottom: 30,
  },
  resetPassword: {
    flexDirection: 'row',
    marginHorizontal: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  additionalLogin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default FirstScreen;
