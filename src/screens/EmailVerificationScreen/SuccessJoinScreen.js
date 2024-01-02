import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';

// ########## Main Function ##########
const SuccessJoinScreen = () => {
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;

  const onSignIn = async () => {
    navigation.replace('Home');
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Content Section */}
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 50,
        }}>
        <Image
          source={require('../../../assets/images/icon_successjoin.png')}
          resizeMode="contain"
          style={{
            height: 200,
            width: 200,
          }}
        />
        <View style={{alignItems: 'center'}}>
          <Text style={styles.normalText}>Welcome to the membership.</Text>
          <Text style={styles.normalText}>
            Your subscription has{' '}
            <Text style={{color: '#da7750', fontFamily: 'Poppins-SemiBold'}}>
              Finished
            </Text>
          </Text>
        </View>
      </View>

      {/* Bottom Section*/}
      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSignIn} style={styles.buttonSignIn}>
          <Image
            source={require('../../../assets/images/icon_check.png')}
            resizeMode="contain"
            style={styles.buttonSignInImage}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
  normalText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
  },
  bottomSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
  },
});

export default SuccessJoinScreen;
