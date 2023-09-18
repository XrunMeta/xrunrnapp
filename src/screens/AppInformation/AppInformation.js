import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';

const AppInformation = () => {
  const [version, setVersion] = useState('0');

  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://app.xrun.run/gateway.php?act=version`,
        );
        const data = await response.json();

        if (data) {
          setVersion({
            version: data.version,
            url: data.url,
          });
        }
      } catch (err) {
        console.error('Error fetching user data: ', err);
      }
    };

    fetchData();
  });

  const onBack = () => {
    navigation.navigate('InfoHome');
  };

  return (
    <View style={styles.root}>
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>App Information</Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 18,
            paddingVertical: 20,
          }}>
          Latest version {version ? version.version : '...'}
        </Text>
      </View>
    </View>
  );
};

export default AppInformation;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
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
