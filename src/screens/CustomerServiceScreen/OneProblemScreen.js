import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2, getFontFam} from '../../../utils';
// import crashlytics from '@react-native-firebase/crashlytics';

const OneProblemScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Get Language
    const fetchLangData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        // Get User Data from Asyncstorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);

        // Get List of 1:1 Inquiry
        const response = await fetch(
          `${URL_API}&act=app7330-01&member=${astorJsonData.member}`,
        );
        const data = await response.json();
        setRecommendations(data.data);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchLangData();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={handleBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_cs ? lang.screen_cs.one.title : ''}
          </Text>
        </View>
      </View>

      <View
        style={{
          paddingVertical: 10,
          flex: 1,
          width: '100%',
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {recommendations.map(item => (
            <TouchableOpacity
              activeOpacity={1}
              key={item.board}
              style={{
                backgroundColor: 'white',
                paddingHorizontal: 12,
                marginHorizontal: 8,
                borderRadius: 10,
                marginVertical: 4,
                ...styles.shadow,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  marginHorizontal: 5,
                }}>
                <Image
                  source={require('../../../assets/images/icon_logout.png')}
                  resizeMode="contain"
                  style={{
                    height: 15,
                    width: 15,
                    marginRight: 15,
                    tintColor: '#2d739e',
                    transform: [{rotate: '180deg'}],
                  }}
                />
                <View
                  style={{
                    paddingVertical: 15,
                  }}>
                  <View
                    style={{flexDirection: 'row', gap: 10, marginBottom: -3}}>
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Regular',
                        fontSize: 11,
                        color: 'grey',
                      }}>
                      {item.datetime}
                    </Text>
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Regular',
                        fontSize: 11,
                        color: 'grey',
                      }}>
                      {item.time}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: getFontFam() + 'Regular',
                      fontSize: 13,
                      color: 'black',
                    }}>
                    {item.title}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
  },
  titleWrapper: {
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontSize: 22,
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
  bottomSection: {
    padding: 5,
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.51,
    elevation: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -2,
  },
  checkedBox: {
    backgroundColor: '#343a59',
    borderColor: '#343a59',
  },
  uncheckedBox: {
    backgroundColor: 'transparent',
    borderColor: '#343a59',
  },
  checkMark: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: -1,
  },
});

export default OneProblemScreen;
