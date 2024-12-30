import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
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
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const RecommendByMeScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchDataAndRecommendations = async () => {
      try {
        // Get Language
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        // Get User Data from AsyncStorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);
        setUserData(astorJsonData);

        // Fetch Recommendations if userData is available
        if (astorJsonData?.member) {
          const body = {
            member: astorJsonData.member,
          };

          const result = await gatewayNodeJS(
            'getRecommendedToMe',
            'POST',
            body,
          );
          const data = result.data;

          console.log({data});

          if (result.status === 'success') {
            setRecommendations(data);
          }
        }
      } catch (error) {
        console.error('Error during fetching data and recommendations:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    };

    fetchDataAndRecommendations();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        {/* Title */}
        <View style={{flexDirection: 'row'}}>
          <View style={{position: 'absolute', zIndex: 1}}>
            <ButtonBack onClick={handleBack} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              {lang && lang.screen_recommend && lang.screen_recommend.category
                ? lang.screen_recommend.category.recomByMe
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
              <View
                key={item.email}
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
                  <Text
                    style={{
                      fontFamily: getFontFam() + 'Regular',
                      fontSize: fontSize('body'),
                      color: 'black',
                      paddingVertical: 18,
                    }}>
                    {/* {item.email.substring(0, 3) +
                      '*'.repeat(item.email.length - 3)} */}
                    {item.masked_email}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
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

export default RecommendByMeScreen;
