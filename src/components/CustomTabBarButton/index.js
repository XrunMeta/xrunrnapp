import React, {useState} from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const CustomTabBarButton = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const navigation = useNavigation();

  const handleTabChange = tabName => {
    setActiveTab(tabName);
    console.log(tabName);
    if (tabName === 'Home') {
      navigation.navigate('MapHome');
    } else if (tabName === 'Camera') {
      navigation.navigate('AR');
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#343a59',
        borderRadius: 50,
        height: 50,
        width: 100,
        marginHorizontal: 5,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 2,
      }}>
      {/* Map Button */}
      <TouchableOpacity
        style={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
          },
          activeTab === 'Home'
            ? {
                backgroundColor: '#ffdc04',
                borderRadius: 50,
              }
            : {},
        ]}
        onPress={() => handleTabChange('Home')}>
        <Image
          source={
            activeTab === 'Home'
              ? require('../../../assets/images/icon_map.png')
              : require('../../../assets/images/icon_map_white.png')
          }
          resizeMode="contain"
          style={{
            width: 25,
            height: 25,
          }}
        />
      </TouchableOpacity>

      {/* Camera Button */}
      <TouchableOpacity
        style={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
          },
          activeTab === 'Camera'
            ? {
                backgroundColor: '#ffdc04',
                borderRadius: 50,
              }
            : {},
        ]}
        onPress={() => handleTabChange('Camera')}>
        <Image
          source={
            activeTab === 'Camera'
              ? require('../../../assets/images/icon_camera.png')
              : require('../../../assets/images/icon_camera_white.png')
          }
          resizeMode="contain"
          style={{
            width: 25,
            height: 25,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CustomTabBarButton;
