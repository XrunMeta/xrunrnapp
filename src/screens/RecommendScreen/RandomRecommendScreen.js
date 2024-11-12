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
  SafeAreaView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  gatewayNodeJS,
  URL_API_NODEJS,
  authcode,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const RandomRecommendScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [checkedRecommendations, setCheckedRecommendations] = useState({});
  const [checkedID, setCheckedID] = useState(0);
  const [isDisable, setisDisable] = useState(false)

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        // Get User Data from Asyncstorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);
        setUserData(astorJsonData);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    const fetchRecommendations = async () => {
      try {
        const result = await gatewayNodeJS('app7420-01');
        const data = result.data;

        if (result.status === 'success' && data.length > 0) {
          const initialCheckedState = {};
          data.forEach(item => {
            initialCheckedState[item.email] = false;
          });

          setRecommendations(data);
          setCheckedRecommendations(initialCheckedState);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    };

    fetchData();
    fetchRecommendations();
  }, []);

  const onSaveChange = () => {
    if (checkedID == 0) {
      Alert.alert(
        lang && lang.alert ? lang.alert.title.fail : '',
        lang && lang.screen_recommend && lang.screen_recommend.random_recommend
          ? lang.screen_recommend.random_recommend.empty
          : '',
      );
    } else {
      const registRecommend = async () => {
        try {
		  setisDisable(true)

          const body = {
            posed: checkedID,
            member: userData.member,
          };

          const result = await gatewayNodeJS('app7420-02', 'POST', body);
          const data = result.data[0].data;

          // Save/Update recommend
          await fetch(`${URL_API_NODEJS}/saveRecommend`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authcode}`,
            },
            body: JSON.stringify({
              member: userData.member,
              recommand: checkedID,
            }),
          });

          if (data === 'ok') {
            Alert.alert(
              lang && lang.alert ? lang.alert.title.success : '',
              lang &&
                lang.screen_recommend &&
                lang.screen_recommend.add_recommend
                ? lang.screen_recommend.add_recommend.recommended
                : '',
            );
            navigation.replace('InfoHome');
          } else {
            Alert.alert(
              lang && lang.alert ? lang.alert.title.warning : '',
              lang &&
                lang.screen_recommend &&
                lang.screen_recommend.add_recommend
                ? lang.screen_recommend.add_recommend.already
                : '',
            );
            navigation.replace('InfoHome');
          }
        } catch (error) {
          console.error('Terjadi kesalahan:', error.message);
          crashlytics().recordError(new Error(error));
          crashlytics().log(error);
        } finally {
		  setisDisable(false)
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
	<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={handleBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_recommend && lang.screen_recommend.category
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
                    fontFamily: getFontFam() + 'Regular',
                    fontSize: fontSize('body'),
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
		<Pressable
            onPress={onSaveChange}
            style={styles.buttonSignIn}
            disabled={!isDisable && checkedID == 0}>
            <Image
              source={
                !isDisable && checkedID == 0
                  ? require('../../../assets/images/icon_nextDisable.png')
                  : require('../../../assets/images/icon_next.png')
              }
              resizeMode="contain"
              style={styles.buttonSignInImage}
            />
          </Pressable>
      </View>
    </SafeAreaView>
	</TouchableWithoutFeedback>
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
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
  bottomSection: {
    padding: 5,
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 40,
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
    fontSize: fontSize('body'),
    backgroundColor: Platform.OS === 'ios' ? '#fff' : 'transparent',
    fontWeight: 'bold',
    marginTop: -1,
  },
});

export default RandomRecommendScreen;
