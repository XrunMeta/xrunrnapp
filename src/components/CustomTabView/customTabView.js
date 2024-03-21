import React from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {getFontFam} from '../../../utils';

const CustomTabView = ({state, descriptors, navigation, position}) => {
  console.log(`
        State : ${state}
        Desc : ${descriptors}
        Nav : ${navigation}
        Position : ${position}
    `);
  return (
    <View style={styles.tabBarContainer}>
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
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabBarItem}
            key={index}>
            <Text
              style={isFocused ? styles.tabBarTextFocused : styles.tabBarText}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#051C60', // Background color of the tab bar
    height: 50,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarText: {
    fontFamily: getFontFam() + 'Regular', // Font family of the tab text
    fontSize: 16,
    color: 'white', // Font color of the tab text
  },
  tabBarTextFocused: {
    fontFamily: getFontFam() + 'Bold', // Font family of the focused tab text
    fontSize: 16,
    color: '#ffdc04', // Font color of the focused tab text
  },
});

export default CustomTabView;
