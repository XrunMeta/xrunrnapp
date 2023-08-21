import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import CustomListItem from '../../components/CustomButton/CustomListItem';

const ChooseRegionScreen = ({route}) => {
  const navigation = useNavigation();
  const {flag, countryCode, country} = route.params || {};

  const onBack = (flag, cCountryCode, cCountry) => {
    navigation.navigate('SignUp', {
      flag: flag,
      countryCode: cCountryCode,
      country: cCountry,
    });
  };

  // ########## Looping Region List
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://app.xrun.run/gateway.php?act=countries')
      .then(response => response.json())
      .then(jsonData => {
        setData(jsonData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // ########## Choose Region
  const chooseRegion = item => {
    navigation.navigate('SignUp', {
      flag: item.lcode,
      countryCode: item.callnumber,
      country: item.country,
    });
  };

  // ########## Search Function
  const [searchText, setSearchText] = useState('');

  return (
    <View style={[styles.root]}>
      <ButtonBack onClick={() => onBack(flag, countryCode, country)} />

      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Pemilihan Negara</Text>
      </View>

      {/* Selected Region */}
      <View style={[styles.formGroup, {marginTop: 25}]}>
        <Text
          style={[styles.mediumText, {alignSelf: 'flex-start', marginTop: 20}]}>
          Lokasi Sekarang
        </Text>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
          }}>
          <Image
            resizeMode="contain"
            style={{height: 50, width: 45, marginRight: 10}}
            source={
              flag == undefined
                ? {
                    uri: 'https://app.xrun.run/flags/id.png',
                  }
                : {
                    uri: flag,
                  }
            }
          />
          <Text style={styles.mediumText}>
            {country == undefined ? 'Indonesia' : country}
          </Text>
          <Text style={styles.mediumText}>
            (+{countryCode == undefined ? '62' : countryCode})
          </Text>
        </View>
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Silakan cari negara anda"
          style={[styles.mediumText, {flex: 1}]}
          value={searchText}
          onChangeText={text => setSearchText(text)}
        />
        <Pressable style={{justifyContent: 'center'}}>
          <Image
            source={require('../../../assets/images/icon_search.png')}
            resizeMode="contain"
            style={{
              height: 35,
            }}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          width: '100%',
          paddingHorizontal: 20,
          marginVertical: 20,
        }}>
        {data
          .filter(item => {
            if (searchText === '') {
              return true; // Tampilkan semua data jika tidak ada pencarian
            }
            return item.country
              .toLowerCase()
              .includes(searchText.toLowerCase());
          })
          .map((item, index) => (
            <CustomListItem
              key={item.code + '-' + item.subcode}
              text={'+' + item.callnumber + ') ' + item.country}
              image={{uri: item.lcode}}
              onPress={() => chooseRegion(item)}
            />
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
  },
  titleWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: -20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    color: '#343a59',
  },
  subTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#343a59',
  },
  bottomSection: {
    padding: 20,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#343a59',
  },
  emailAuth: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#343a59',
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    height: 100,
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
  horizontalChecbox: {
    flexDirection: 'row',
    paddingTop: 5,
    alignSelf: 'flex-start',
  },
  formGroup: {
    width: '100%',
    paddingHorizontal: 25,
  },
  input: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#343a59',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    flex: 1,
  },

  mediumText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#343a59',
    alignSelf: 'center',
    paddingRight: 10,
  },
  searchBox: {
    backgroundColor: 'white',
    marginTop: 20,
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    shadowColor: '#b8b8b8',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    shadowRadius: 2,
    elevation: 15,
  },
  selectItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 15,
    shadowColor: '#969493',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 1,
    marginVertical: 3,
  },
});

export default ChooseRegionScreen;
