import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cek status login di AsyncStorage saat aplikasi dimulai
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Fungsi untuk check status login
  const checkLoginStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('isLoggedIn');
      if (value === 'true') {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  // Fungsi untuk login
  const login = async () => {
    try {
      // Simpan status login ke AsyncStorage
      setIsLoggedIn(true);
      await AsyncStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  // Fungsi untuk logout
  const logout = async () => {
    try {
      // Hapus status login dari AsyncStorage
      await AsyncStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{isLoggedIn, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
