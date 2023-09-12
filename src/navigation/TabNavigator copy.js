// import React from 'react';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import {AntDesign, FontAwesome, Ionicons} from '@expo/vector-icons'; // Anda dapat mengganti ini dengan ikon-ikon yang Anda inginkan
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

// const Tab = createBottomTabNavigator();

// const TabNavigator = () => {
//   return (
//     <Tab.Navigator
//       tabBarOptions={{
//         activeTintColor: 'blue', // Warna ikon dan teks untuk tab aktif
//         inactiveTintColor: 'gray', // Warna ikon dan teks untuk tab non-aktif
//         labelStyle: {
//           fontSize: 12, // Ukuran teks tab
//         },
//         style: {
//           backgroundColor: 'white', // Warna latar belakang tab bar
//           height: 500,
//           zIndex: 10,
//         },
//       }}>
//       <Tab.Screen
//         name="Home"
//         component={HomeScreen}
//         options={{
//           tabBarLabel: 'Home',
//           tabBarIcon: ({color, size}) => (
//             <AntDesign name="home" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="First"
//         component={FirstScreen}
//         options={{
//           tabBarLabel: 'Screen 2',
//           tabBarIcon: ({color, size}) => (
//             // <FontAwesome name="second" color={color} size={size} />
//             <AntDesign name="home" color={color} size={size} />
//           ),
//         }}
//       />
//       {/* <Tab.Screen
//         name="Screen3"
//         component={Screen3}
//         options={{
//           tabBarLabel: 'Screen 3',
//           tabBarIcon: ({color, size}) => (
//             <Ionicons name="ios-settings" color={color} size={size} />
//           ),
//         }}
//       /> */}
//       {/* Tambahkan lebih banyak tab di sini sesuai kebutuhan Anda */}
//     </Tab.Navigator>
//   );
// };

// export default TabNavigator;

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AntDesign} from '@expo/vector-icons'; // Anda dapat mengganti ini dengan ikon-ikon yang Anda inginkan
import HomeScreen from '../screens/HomeScreen/';
import FirstScreen from '../screens/FirstScreen/';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: 'blue', // Warna ikon dan teks untuk tab aktif
        inactiveTintColor: 'gray', // Warna ikon dan teks untuk tab non-aktif
        labelStyle: {
          fontSize: 12, // Ukuran teks tab
        },
        style: {
          backgroundColor: 'white', // Warna latar belakang tab bar
          height: 500,
          zIndex: 10,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="First"
        component={FirstScreen}
        options={{
          tabBarLabel: 'Screen 2',
          tabBarIcon: ({color, size}) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
