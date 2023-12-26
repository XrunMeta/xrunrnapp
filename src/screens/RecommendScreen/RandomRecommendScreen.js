import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

const RandomRecommendScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [checkedRecommendations, setCheckedRecommendations] = useState({});
  const [checkedID, setCheckedID] = useState(0);

  useEffect(() => {
    // Get Language
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);

        // Get User Data from Asyncstorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);
        setUserData(astorJsonData);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`${URL_API}&act=app7420-01`);
        const data = await response.json();

        if (data && data.data.length > 0) {
          const initialCheckedState = {};
          data.data.forEach(item => {
            initialCheckedState[item.email] = false;
          });

          setRecommendations(data.data);
          setCheckedRecommendations(initialCheckedState);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    getLanguage();
    fetchRecommendations();
  }, []);

  const onSaveChange = () => {
    if (checkedID == 0) {
      Alert.alert(
        lang && lang.alert ? lang.alert.title.fail : '',
        lang && lang.screen_recommend
          ? lang.screen_recommend.random_recommend.empty
          : '',
      );
    } else {
      const registRecommend = async () => {
        try {
          const response = await fetch(
            `${URL_API}&act=app7420-02&posed=${checkedID}&member=${userData.member}`,
          );
          const data = await response.json();

          if (data.data === 'ok') {
            Alert.alert(
              lang && lang.alert ? lang.alert.title.success : '',
              lang && lang.screen_recommend
                ? lang.screen_recommend.add_recommend.recommended
                : '',
            );
            navigation.replace('InfoHome');
          } else {
            Alert.alert(
              lang && lang.alert ? lang.alert.title.warning : '',
              lang && lang.screen_recommend
                ? lang.screen_recommend.add_recommend.already
                : '',
            );
            navigation.replace('InfoHome');
          }
        } catch (error) {
          console.error('Terjadi kesalahan:', error.message);
        }
      };

      registRecommend();
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const checkBoxToggle = (email, member) => {
    const updatedCheckedState = {...checkedRecommendations};
    const newCheckedState = !updatedCheckedState[email];

    // Uncheck all other recommendations
    for (const key in updatedCheckedState) {
      if (key !== email) {
        updatedCheckedState[key] = false;
      }
    }

    console.log(`
    Data Checked : 
        Email  : ${email}
        Member : ${member}
    `);

    // Check or uncheck the selected recommendation
    updatedCheckedState[email] = newCheckedState;
    setCheckedRecommendations(updatedCheckedState);

    if (updatedCheckedState[email] == true) {
      setCheckedID(member);
    } else {
      setCheckedID(0);
    }
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
            {lang && lang.screen_recommend
              ? lang.screen_recommend.category.random
              : ''}
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
              key={item.email}
              onPress={() => checkBoxToggle(item.email, item.member)}
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
                <View
                  style={[
                    styles.checkbox,
                    checkedRecommendations[item.email]
                      ? styles.checkedBox
                      : styles.uncheckedBox,
                  ]}>
                  {checkedRecommendations[item.email] && (
                    <Text style={styles.checkMark}>✔</Text>
                  )}
                </View>
                <Text
                  onPress={() => checkBoxToggle(item.email, item.member)}
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 13,
                    color: 'black',
                    paddingVertical: 18,
                  }}>
                  {item.email.substring(0, 3) +
                    '*'.repeat(item.email.length - 3)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSaveChange} style={styles.buttonSignIn}>
          <Image
            source={require('../../../assets/images/icon_check.png')}
            resizeMode="contain"
            style={styles.buttonSignInImage}
          />
        </Pressable>
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
    fontFamily: 'Poppins-Bold',
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
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 3.5,
    // elevation: 2,
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

export default RandomRecommendScreen;
