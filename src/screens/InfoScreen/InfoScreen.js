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
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import ButtonList from '../../components/ButtonList/ButtonList';
import {useAuth} from '../../context/AuthContext/AuthContext';

const InfoScreen = () => {
  const {isLoggedIn, logout} = useAuth();

  let ScreenHeight = Dimensions.get('window').height;
  const navigation = useNavigation();

  const onLogout = () => {
    Alert.alert('Warning', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => logout()},
    ]);
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: 'Im sharing with u :)',
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

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <Text style={styles.title}>My Info</Text>

      {/* User Info */}
      <View
        style={{
          backgroundColor: 'white',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 20,
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
            ggg@hhh.comchbaffff
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 16,
              color: 'grey',
            }}>
            ggg@hhh.com
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
          <ButtonList label="Clause" />
          <ButtonList label="Customer Service" />
          <ButtonList label="App Information" />
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
    paddingVertical: 20,
    backgroundColor: '#f2f5f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#051C60',
    margin: 10,
    marginBottom: 30,
    textAlign: 'center',
  },
});
