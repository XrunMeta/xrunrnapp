// import React, {useState} from 'react';
// import {
//   Text,
//   Image,
//   SafeAreaView,
//   StyleSheet,
//   View,
//   TouchableOpacity,
// } from 'react-native';
// import {useAuth} from '../../context/AuthContext/AuthContext';
// import ARScreen from '../ARScreen/ARScreen';
// import MapParent from './MapParentScreen';

// const langData = require('../../../lang.json');

// // ########## Main Component ##########
// export default function Home() {
//   const {isLoggedIn} = useAuth(); // Login Checker
//   const [activeTab, setActiveTab] = useState('Map');

//   const handleTabChange = tabName => {
//     setActiveTab(tabName);
//     console.log(tabName);
//     // if (tabName === 'Home') {
//     //   navigation.navigate('MapHome');
//     // } else if (tabName === 'Camera') {
//     //   navigation.navigate('AR');
//     // }
//   };

//   return (
//     <SafeAreaView style={{flex: 1}}>
//       {isLoggedIn ? (
//         <View style={styles.root}>
//           {activeTab === 'Map' ? <MapParent /> : <ARScreen />}

//           {/* Bottom Tab Navigator */}
//           <View
//             style={{
//               backgroundColor: 'white',
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               gap: 5,
//               paddingVertical: 12,
//               bottom: 0,
//             }}>
//             {/* Wallet */}
//             <TouchableOpacity style={{flex: 1}}>
//               <View style={styles.buttonTabItem}>
//                 <Image
//                   source={require('../../../assets/images/icon_wallet.png')}
//                   resizeMode="contain"
//                   style={{
//                     width: 25,
//                     // tintColor: focused ? 'black' : '#343a59',
//                     tintColor: '#343a59',
//                   }}
//                 />
//                 <Text
//                   style={{
//                     // fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Medium',
//                     fontFamily: 'Poppins-Medium',
//                     color: 'black',
//                     fontSize: 10.5,
//                     marginTop: -15,
//                   }}>
//                   Wallet
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             {/* Advertise */}
//             <TouchableOpacity style={{flex: 1}}>
//               <View style={styles.buttonTabItem}>
//                 <Image
//                   source={require('../../../assets/images/icon_advertisement.png')}
//                   resizeMode="contain"
//                   style={{
//                     width: 25,
//                     // tintColor: focused ? 'black' : '#343a59',
//                     tintColor: '#343a59',
//                   }}
//                 />
//                 <Text
//                   style={{
//                     // fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Medium',
//                     fontFamily: 'Poppins-Medium',
//                     color: 'black',
//                     fontSize: 10.5,
//                     marginTop: -15,
//                   }}>
//                   Advertise
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <View
//               style={{
//                 flexDirection: 'row',
//                 backgroundColor: '#343a59',
//                 borderRadius: 50,
//                 height: 50,
//                 width: 100,
//                 marginHorizontal: -5,
//                 alignSelf: 'center',
//                 shadowColor: '#000',
//                 shadowOffset: {
//                   width: 0,
//                   height: 3,
//                 },
//                 shadowOpacity: 0.5,
//                 shadowRadius: 5,
//                 elevation: 2,
//               }}>
//               {/* Map Button */}
//               <TouchableOpacity
//                 style={[
//                   {
//                     flex: 1,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     padding: 5,
//                   },
//                   activeTab === 'Map'
//                     ? {
//                         backgroundColor: '#ffdc04',
//                         borderRadius: 50,
//                       }
//                     : {},
//                 ]}
//                 onPress={() => handleTabChange('Map')}>
//                 <Image
//                   source={
//                     activeTab === 'Map'
//                       ? require('../../../assets/images/icon_map.png')
//                       : require('../../../assets/images/icon_map_white.png')
//                   }
//                   resizeMode="contain"
//                   style={{
//                     width: 25,
//                     height: 25,
//                   }}
//                 />
//               </TouchableOpacity>

//               {/* Camera Button */}
//               <TouchableOpacity
//                 style={[
//                   {
//                     flex: 1,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     padding: 5,
//                   },
//                   activeTab === 'Camera'
//                     ? {
//                         backgroundColor: '#ffdc04',
//                         borderRadius: 50,
//                       }
//                     : {},
//                 ]}
//                 onPress={() => handleTabChange('Camera')}>
//                 <Image
//                   source={
//                     activeTab === 'Camera'
//                       ? require('../../../assets/images/icon_camera.png')
//                       : require('../../../assets/images/icon_camera_white.png')
//                   }
//                   resizeMode="contain"
//                   style={{
//                     width: 25,
//                     height: 25,
//                   }}
//                 />
//               </TouchableOpacity>
//             </View>

//             {/* Notify */}
//             <TouchableOpacity style={{flex: 1}}>
//               <View style={styles.buttonTabItem}>
//                 <Image
//                   source={require('../../../assets/images/icon_bell.png')}
//                   resizeMode="contain"
//                   style={{
//                     width: 25,
//                     // tintColor: focused ? 'black' : '#343a59',
//                     tintColor: '#343a59',
//                   }}
//                 />
//                 <Text
//                   style={{
//                     // fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Medium',
//                     fontFamily: 'Poppins-Medium',
//                     color: 'black',
//                     fontSize: 10.5,
//                     marginTop: -15,
//                   }}>
//                   Notify
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             {/* Info */}
//             <TouchableOpacity style={{flex: 1}}>
//               <View style={styles.buttonTabItem}>
//                 <Image
//                   source={require('../../../assets/images/icon_user.png')}
//                   resizeMode="contain"
//                   style={{
//                     width: 25,
//                     // tintColor: focused ? 'black' : '#343a59',
//                     tintColor: '#343a59',
//                   }}
//                 />
//                 <Text
//                   style={{
//                     // fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Medium',
//                     fontFamily: 'Poppins-Medium',
//                     color: 'black',
//                     fontSize: 10.5,
//                     marginTop: -15,
//                   }}>
//                   Info
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         <Text>You are not logged in.</Text>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//   },
//   title: {
//     fontFamily: 'Poppins-Bold',
//     fontSize: 22,
//     color: '#343a59',
//   },
//   subTitle: {
//     fontFamily: 'Poppins-SemiBold',
//     fontSize: 22,
//     color: '#343a59',
//     marginBottom: -9,
//   },
//   desc: {
//     fontFamily: 'Poppins-Medium',
//     fontSize: 13,
//     color: '#343a59',
//   },
//   navWrapper: {
//     position: 'relative',
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     paddingHorizontal: 20,
//     paddingVertical: 5,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     height: 50,
//     zIndex: 1,
//     backgroundColor: 'pink',
//   },
//   mapPointButton: {
//     alignItems: 'center',
//     position: 'absolute',
//     width: 60,
//     height: 35,
//     zIndex: 1,
//     padding: 10,
//     marginVertical: 5,
//     right: 0,
//   },
//   container: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//   },
//   buttonTabItem: {
//     backgroundColor: 'red',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//   },
// });

import React, {useState} from 'react';
import {
  Text,
  Image,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '../../context/AuthContext/AuthContext';
import ARScreen from '../ARScreen/ARScreen';
import MapParent from './MapParentScreen';

const langData = require('../../../lang.json');

export default function Home() {
  const {isLoggedIn} = useAuth();
  const [activeTab, setActiveTab] = useState('Map');

  const handleTabChange = tabName => {
    setActiveTab(tabName);
  };

  const renderTabButton = (tabName, icon, text) => (
    <TouchableOpacity
      style={[
        styles.buttonTabItem,
        {backgroundColor: activeTab === tabName ? '#ffdc04' : 'transparent'},
      ]}
      onPress={() => handleTabChange(tabName)}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{
          width: 25,
          height: 25,
          tintColor: activeTab === tabName ? 'black' : '#343a59',
        }}
      />
      <Text style={styles.tabText}>{text}</Text>
    </TouchableOpacity>
  );

  // Halo selamat malam semua, hari ini saya merombak logic dan kode untuk bottom tab navigator sebab itu bermasalah ketika user ingin logout dan berpindah pindah halaman, maka saya mengubah alurnya. Terimakasih

  return (
    <SafeAreaView style={{flex: 1}}>
      {isLoggedIn ? (
        <View style={styles.root}>
          {activeTab === 'Map' ? <MapParent /> : <ARScreen />}

          {/* Bottom Tab Navigator */}
          <View style={styles.bottomTabContainer}>
            {renderTabButton(
              'Wallet',
              require('../../../assets/images/icon_wallet.png'),
              'Wallet',
            )}
            {renderTabButton(
              'Advertise',
              require('../../../assets/images/icon_advertisement.png'),
              'Advertise',
            )}

            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#343a59',
                borderRadius: 50,
                height: 50,
                width: 100,
                marginHorizontal: -5,
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
                        backgroundColor: '#ffdc04',
                        borderRadius: 50,
                      }
                    : {},
                ]}
                onPress={() => handleTabChange('Map')}>
                <Image
                  source={
                    activeTab === 'Map'
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

            {renderTabButton(
              'Notify',
              require('../../../assets/images/icon_bell.png'),
              'Notify',
            )}
            {renderTabButton(
              'Info',
              require('../../../assets/images/icon_user.png'),
              'Info',
            )}
          </View>
        </View>
      ) : (
        <Text>You are not logged in.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  buttonTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  bottomTabContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  middleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#343a59',
    borderRadius: 50,
    height: 50,
    width: 100,
    marginHorizontal: -5,
    alignSelf: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
    }),
  },
  tabText: {
    fontFamily: 'Poppins-Medium',
    color: 'black',
    fontSize: 10.5,
    marginBottom: -15,
  },
});
