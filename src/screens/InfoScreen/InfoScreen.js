import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonBack from '../../components/ButtonBack';

const InfoScreen = () => {
  const {isLoggedIn, logout} = useAuth();
  const [userName, setUserName] = useState(null);
  const [userDetails, setUserDetails] = useState([]);

  let ScreenHeight = Dimensions.get('window').height;

  const navigation = useNavigation();

  //   Call API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        const response = await fetch(
          `https://app.xrun.run/gateway.php?act=login-04-email&email=${userEmail}`,
        );
        const data = await response.json();

        if (data.data === 'true') {
          const fullName = `${data.firstname}${data.lastname}`;
          setUserName(fullName);

          setUserDetails({
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            gender: data.gender,
            extrastr: data.extrastr,
            country: data.country,
            countrycode: data.countrycode,
            region: data.region,
            ages: data.ages,
          });

          await AsyncStorage.setItem(
            'userDetails',
            JSON.stringify(userDetails),
          );
        }
      } catch (err) {
        console.error('Error fetching user data: ', err);
      }
    };

    fetchData();
  }, []);

  const onLogout = () => {
    Alert.alert('Warning', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          logout();
          // Go to First Screen
          // navigation.navigate('First');
        },
      },
    ]);
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `
Let's join XRUN!!!
Referral me!
Email : ${userDetails.email}
https://play.google.com/store/apps/details?id=run.xrun.xrunapp`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Berhasil berbagi dengan aktivitas tertentu
          console.log(`Berhasil berbagi dengan ${result.activityType}`);
        } else {
          // Berhasil berbagi
          console.log('Berhasil berbagi');
        }
      } else if (result.action === Share.dismissedAction) {
        // Berbagi dibatalkan
        console.log('Berbagi dibatalkan');
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const onModify = () => {
    console.warn('Modify');
  };

  const onSetting = () => {
    Alert.alert('Alert Title', 'My Alert Msg', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  };

  const onClause = () => {
    navigation.navigate('Clause');
  };

  const onAppInfo = () => {
    navigation.navigate('AppInformation');
  };

  const onBack = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>My Info</Text>
        </View>
      </View>

      {/* User Info */}
      <View
        style={{
          backgroundColor: 'white',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 20,
          marginTop: 10,
        }}>
        <View
          style={{
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 18,
              color: 'black',
            }}>
            {userDetails
              ? `${userDetails.firstname}${userDetails.lastname}`
              : 'Loading...'}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 16,
              color: 'grey',
            }}>
            {userDetails ? userDetails.email : 'Loading...'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
          <TouchableOpacity
            onPress={onShare}
            style={{
              padding: 10,
              borderRadius: 35,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'grey',
            }}>
            <Image
              source={require('../../../assets/images/icon_share.png')}
              resizeMode="contain"
              style={{
                height: 25,
                width: 25,
                marginLeft: -1,
                marginRight: 1,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLogout}
            style={{
              padding: 12,
              borderRadius: 35,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'grey',
            }}>
            <Image
              source={require('../../../assets/images/icon_logout.png')}
              resizeMode="contain"
              style={{
                height: 23,
                width: 23,
                marginLeft: 1,
                marginRight: -1,
                opacity: 0.5,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* List Button */}
      <View
        style={{
          paddingVertical: 10,
          flex: 1,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ButtonList label="Modify Information" onPress={onModify} />
          <ButtonList label="Setting" onPress={onSetting} />
          <ButtonList label="Clause" onPress={onClause} />
          <ButtonList label="Customer Service" />
          <ButtonList label="App Information" onPress={onAppInfo} />
          <ButtonList label="Recommend" />
        </ScrollView>
      </View>
    </View>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2f5f6',
  },
  titleWrapper: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#051C60',
    margin: 10,
  },
});
