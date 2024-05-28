import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import IconGroup from '../components/IconGroup';
import {fontSize, getFontFam} from '../../utils';

// Daftar nama ikon
const iconNames = [
  'icon_wallet',
  'icon_advertisement',
  'icon_map',
  'icon_camera',
  'icon_bell',
  'icon_user',
];

// Objek require dengan string literal
const icons = {
  icon_wallet: require('../../assets/images/icon_wallet.png'),
  icon_advertisement: require('../../assets/images/icon_advertisement.png'),
  icon_map: require('../../assets/images/icon_map.png'),
  icon_camera: require('../../assets/images/icon_camera.png'),
  icon_bell: require('../../assets/images/icon_bell.png'),
  icon_user: require('../../assets/images/icon_user.png'),
};

// function TabNavigator({state, descriptors, navigation}) {
//   return (
//     <View
//       style={{
//         flexDirection: 'row',
//         backgroundColor: 'white',
//         zIndex: 1,
//         paddingHorizontal: 20,
//         paddingVertical: 15,
//       }}>
//       {state.routes.map((route, index) => {
//         const {options} = descriptors[route.key];
//         const label =
//           options.tabBarLabel !== undefined
//             ? options.tabBarLabel
//             : options.title !== undefined
//             ? options.title
//             : route.name;

//         const isFocused = state.index === index;

//         const onPress = () => {
//           const event = navigation.emit({
//             type: 'tabPress',
//             target: route.key,
//             canPreventDefault: true,
//           });

//           if (!isFocused && !event.defaultPrevented) {
//             // The `merge: true` option makes sure that the params inside the tab screen are preserved
//             navigation.navigate({name: route.name, merge: true});
//           }
//         };

//         const onLongPress = () => {
//           navigation.emit({
//             type: 'tabLongPress',
//             target: route.key,
//           });
//         };

//         // Ambil nama ikon berdasarkan index
//         const iconName = iconNames[index];

//         return (
//           <TouchableOpacity
//             accessibilityRole="button"
//             accessibilityState={isFocused ? {selected: true} : {}}
//             accessibilityLabel={options.tabBarAccessibilityLabel}
//             testID={options.tabBarTestID}
//             onPress={onPress}
//             onLongPress={onLongPress}
//             style={{flex: 1}}
//             key={route.key} // Pastikan setiap tab memiliki key yang unik
//           >
//             <Image
//               source={icons[iconName]} // Gunakan objek require
//               resizeMode="contain"
//               style={{
//                 height: 30,
//                 backgroundColor: 'pink',
//                 marginVertical: 8,
//               }}
//             />
//             <Text
//               style={[
//                 {
//                   textAlign: 'center',
//                 },
//                 styles.normalText,
//               ]}>
//               {label}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }

// export default TabNavigator;

function TabNavigator({state, descriptors, navigation}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        zIndex: 1,
        paddingHorizontal: 20,
        paddingVertical: 15,
      }}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({name: route.name, merge: true});
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconName = iconNames[index];

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{flex: 1}}
            key={route.key}>
            {iconName === 'icon_map' || iconName === 'icon_camera' ? (
              <IconGroup>
                {/* Ganti sumber gambar sesuai dengan ikon "map" dan "camera" */}
                <Image
                  source={icons['icon_map']}
                  resizeMode="contain"
                  style={{
                    height: 30,
                    marginVertical: 8,
                  }}
                />
                <Image
                  source={icons['icon_camera']}
                  resizeMode="contain"
                  style={{
                    height: 30,
                    marginVertical: 8,
                  }}
                />
                <Image
                  source={icons[iconName]}
                  resizeMode="contain"
                  style={{
                    height: 30,
                    marginVertical: 8,
                  }}
                />
              </IconGroup>
            ) : (
              <View>
                <Image
                  source={icons[iconName]}
                  resizeMode="contain"
                  style={{
                    height: 30,
                    marginVertical: 8,
                  }}
                />
                <Text
                  style={[
                    {
                      textAlign: 'center',
                    },
                    styles.normalText,
                  ]}>
                  {label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default TabNavigator;

const styles = StyleSheet.create({
  normalText: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
    color: '#343a59',
  },
});
