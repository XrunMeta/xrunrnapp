import React from 'react';
import {View, Text, Pressable} from 'react-native';
import {useAuth} from '../../context/AuthContext/AuthContext';

export default function Home() {
  const {isLoggedIn, logout} = useAuth();

  const handleLogout = () => {
    // Lakukan logout dan set state isLoggedIn menjadi false
    logout();
  };

  return (
    <View>
      {isLoggedIn ? (
        <Pressable onPress={handleLogout}>
          <Text>Logout</Text>
        </Pressable>
      ) : (
        <Text>You are not logged in.</Text>
      )}
    </View>
  );
}
