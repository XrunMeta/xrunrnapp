// // const Navigation = () => {
// //   return (
// //     <NavigationContainer>
// //       <Stack.Navigator
// //         initialRouteName="First"
// //         screenOptions={{headerShown: false}}>
// //         <Stack.Screen name="First" component={FirstScreen} />
// //         <Stack.Screen name="SignIn" component={SignInScreen} />
// //         <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
// //         <Stack.Screen name="EmailVerif" component={EmailVerificationScreen} />
// //         <Stack.Screen name="SignUp" component={SignUpScreen} />
// //         <Stack.Screen name="ChooseRegion" component={ChooseRegionScreen} />
// //         <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
// //         <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
// //         <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
// //         <Stack.Screen name="Home" component={HomeScreen} />
// //         <Stack.Screen name="MainApp" component={MainApp} />
// //         <Stack.Screen name="ARScreen" component={ARScreen} />
// //       </Stack.Navigator>
// //     </NavigationContainer>
// //   );
// // };

// // export default Navigation;

// import React, {useState} from 'react';
// import {
//   Image,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
// } from 'react-native';

// import {NavigationContainer} from '@react-navigation/native';
// import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// import FirstScreen from '../screens/FirstScreen/';
// import SignInScreen from '../screens/SignInScreen/';
// import EmailAuthScreen from '../screens/EmailAuthScreen/';
// import EmailVerificationScreen from '../screens/EmailVerificationScreen/';
// import SignUpScreen from '../screens/SignUpScreen/';
// import ConfirmEmailScreen from '../screens/ConfirmEmailScreen/';
// import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/';
// import NewPasswordScreen from '../screens/NewPasswordScreen/';
// import HomeScreen from '../screens/HomeScreen/';
// import ChooseRegionScreen from '../screens/ChooseRegionScreen/ChooseRegionScreen';
// import ARScreen from '../screens/ARScreen/ARScreen';

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();

// const wrapTabButton = ({children, onPress}) => (
//   <TouchableOpacity
//     onPress={onPress}
//     style={{
//       backgroundColor: '#343a59',
//       top: -30,
//       justifyContent: 'center',
//       alignItems: 'center',
//       ...styles.shadow,
//     }}>
//     <View
//       style={{
//         width: 70,
//         height: 70,
//         borderRadius: 35,
//         backgroundColor: 'yellow',
//       }}>
//       {children}
//     </View>
//   </TouchableOpacity>
// );

// const CustomTabBar = ({state, descriptors, navigation}) => {
//   const [sliderAnimation] = useState(new Animated.Value(0));

//   const totalTabs = state.routes.length;
//   const tabWidth = 100; // Ganti dengan lebar yang Anda inginkan

//   const handleTabPress = index => {
//     Animated.spring(sliderAnimation, {
//       toValue: index * tabWidth,
//       useNativeDriver: false,
//     }).start();
//     navigation.navigate(state.routes[index].name);
//   };

//   return (
//     <View style={styles.tabBarContainer}>
//       <Animated.View
//         style={[
//           styles.slider,
//           {
//             width: tabWidth,
//             left: sliderAnimation,
//           },
//         ]}
//       />
//       {state.routes.map((route, index) => {
//         const isFocused = state.index === index;

//         return (
//           <TouchableOpacity
//             key={index}
//             style={[
//               styles.tabBarButton,
//               {backgroundColor: isFocused ? 'yellow' : 'blue'},
//             ]}
//             onPress={() => handleTabPress(index)}>
//             <Text style={styles.tabBarText}>{route.name}</Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// };

// // const WalletScreen = () => (
// //   <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
// //     <Text>Wallet Screen</Text>
// //   </View>
// // );

// // const AdsScreen = () => (
// //   <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
// //     <Text>Ads Screen</Text>
// //   </View>
// // );

// // const MapScreen = () => (
// //   <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
// //     <Text>Map Screen</Text>
// //   </View>
// // );

// // const CameraScreen = () => (
// //   <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
// //     <Text>Camera Screen</Text>
// //   </View>
// // );

// // const NotificationScreen = () => (
// //   <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
// //     <Text>Notification Screen</Text>
// //   </View>
// // );

// // const ProfileScreen = () => (
// //   <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
// //     <Text>Profile Screen</Text>
// //   </View>
// // );

// const Navigation = () => {
//   return (
//     <NavigationContainer>
//       <Tab.Navigator
//         tabBar={props => <CustomTabBar {...props} />}
//         screenOptions={{tabBarLabel: () => null}}>
//         <Tab.Screen name="Wallet" component={FirstScreen} />
//         <Tab.Screen name="Ads" component={EmailAuthScreen} />
//         <Tab.Screen
//           name="Map"
//           component={HomeScreen}
//           options={{
//             tabBarIcon: ({focused}) => (
//               <Image
//                 source={require('../../assets/images/icon_map.png')}
//                 resizeMode="contain"
//                 style={{
//                   width: 30,
//                   height: 30,
//                   tintColor: 'white',
//                 }}
//               />
//             ),
//             tabBarButton: props => <wrapTabButton {...props} />,
//           }}
//         />
//         <Tab.Screen name="Camera" component={ARScreen} />
//         <Tab.Screen name="Notif" component={NewPasswordScreen} />
//         <Tab.Screen name="Profile" component={ForgotPasswordScreen} />
//       </Tab.Navigator>
//     </NavigationContainer>
//   );
// };

// const styles = StyleSheet.create({
//   normalText: {
//     fontFamily: 'Poppins-Medium',
//     fontSize: 14,
//     color: '#343a59',
//   },
//   tabBarContainer: {
//     flexDirection: 'row',
//     backgroundColor: 'blue',
//   },
//   tabBarButton: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   tabBarText: {
//     color: 'white',
//   },
//   slider: {
//     position: 'absolute',
//     height: 20, // Ganti dengan tinggi slider yang Anda inginkan
//     backgroundColor: 'yellow', // Warna slider saat aktif
//     bottom: 0,
//   },
// });

// export default Navigation;

import React, {useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import FirstScreen from '../screens/FirstScreen/';
import SignInScreen from '../screens/SignInScreen/';
import EmailAuthScreen from '../screens/EmailAuthScreen/';
import EmailVerificationScreen from '../screens/EmailVerificationScreen/';
import SignUpScreen from '../screens/SignUpScreen/';
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen/';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/';
import NewPasswordScreen from '../screens/NewPasswordScreen/';
import HomeScreen from '../screens/HomeScreen/';
import ChooseRegionScreen from '../screens/ChooseRegionScreen/ChooseRegionScreen';
import ARScreen from '../screens/ARScreen/ARScreen';
import InfoScreen from '../screens/InfoScreen/InfoScreen';
import AppInformation from '../screens/AppInformation/AppInformation';
import PersonalPolicy from '../screens/PersonalPolicyScreen/PersonalPolicy';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="First"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="First" component={FirstScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
        <Stack.Screen name="EmailVerif" component={EmailVerificationScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ChooseRegion" component={ChooseRegionScreen} />
        <Stack.Screen name="ConfirmEmail" component={ConfirmEmailScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ARScreen" component={ARScreen} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Info" component={InfoScreen} />
        <Stack.Screen name="AppInformation" component={AppInformation} />
        <Stack.Screen name="PersonalPolicy" component={PersonalPolicy} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const CustomTabBarButton = () => {
  const [activeTab, setActiveTab] = useState('Map');
  const navigation = useNavigation();

  const handleTabChange = tabName => {
    setActiveTab(tabName);
    if (tabName === 'Map') {
      navigation.navigate('Home');
    } else if (tabName === 'Camera') {
      navigation.navigate('ARScreen');
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#343a59', // Ganti dengan warna latar belakang yang Anda inginkan
        borderRadius: 50,
        height: 70,
        width: 140,
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
          activeTab === 'Map'
            ? {
                backgroundColor: '#ffdc04', // Ganti dengan warna latar belakang yang Anda inginkan saat tombol aktif
                borderRadius: 50,
              }
            : {},
        ]}
        onPress={() => handleTabChange('Map')}>
        <Image
          source={
            activeTab === 'Map'
              ? require('../../assets/images/icon_map.png')
              : require('../../assets/images/icon_map_white.png')
          }
          resizeMode="contain"
          style={{
            width: 30,
            height: 30,
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
                backgroundColor: '#ffdc04', // Ganti dengan warna latar belakang yang Anda inginkan saat tombol aktif
                borderRadius: 50,
              }
            : {},
        ]}
        // onPress={() => handleTabChange('Camera')}>
        onPress={() => handleTabChange('Camera')}>
        <Image
          source={
            activeTab === 'Camera'
              ? require('../../assets/images/icon_camera.png')
              : require('../../assets/images/icon_camera_white.png')
          }
          resizeMode="contain"
          style={{
            width: 30,
            height: 30,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabel: () => null,
        tabBarStyle: {
          backgroundColor: 'white',
          ...styles.shadow,
          height: 100,
        },
      }}>
      <Tab.Screen
        name="Wallet"
        component={ConfirmEmailScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../../assets/images/icon_wallet.png')}
                resizeMode="contain"
                style={{
                  width: 35,
                  tintColor: focused ? 'black' : '#343a59',
                }}
              />
              <Text
                style={{
                  fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Medium',
                  color: 'black',
                  fontSize: 14,
                }}>
                Wallet
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Advertise"
        component={ForgotPasswordScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../../assets/images/icon_advertisement.png')}
                resizeMode="contain"
                style={{
                  width: 35,
                  tintColor: focused ? 'black' : '#343a59',
                }}
              />
              <Text
                style={{
                  fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Medium',
                  color: 'black',
                  fontSize: 14,
                }}>
                Adverti..
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../../assets/images/icon_map.png')}
              resizeMode="contain"
              style={{
                width: 35,
                // tintColor: focused ? '#343a59' : 'white',
                tintColor: '#343a59',
              }}
            />
          ),
          tabBarButton: props => <CustomTabBarButton {...props} />,
        }}
      />
      {/* <Tab.Screen
          name="AR"
          component={ARScreen}
          options={{
            tabBarIcon: ({focused}) => (
              <Image
                source={require('../../assets/images/icon_camera.png')}
                resizeMode="contain"
                style={{
                  width: 35,
                  // tintColor: focused ? '#343a59' : 'white',
                  tintColor: '#343a59',
                }}
              />
            ),
            tabBarButton: props => <CustomTabBarButton {...props} />,
          }}
        /> */}
      <Tab.Screen
        name="Notify"
        component={NewPasswordScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../../assets/images/icon_bell.png')}
                resizeMode="contain"
                style={{
                  width: 35,
                  tintColor: focused ? 'black' : '#343a59',
                }}
              />
              <Text
                style={{
                  fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Medium',
                  color: 'black',
                  fontSize: 14,
                }}>
                Notify
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Info"
        component={PersonalPolicy}
        options={{
          tabBarIcon: ({focused}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../../assets/images/icon_user.png')}
                resizeMode="contain"
                style={{
                  width: 35,
                  tintColor: focused ? 'black' : '#343a59',
                }}
              />
              <Text
                style={{
                  fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Medium',
                  color: 'black',
                  fontSize: 14,
                }}>
                Info
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
    elevation: 5,
  },
});
