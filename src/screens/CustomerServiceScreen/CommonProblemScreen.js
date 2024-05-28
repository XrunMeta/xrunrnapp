import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API, getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const CommonProblemScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [commonProblem, setCommonProblem] = useState([]);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState({});

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    // Get Language
    const fetchDataLang = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    const fetchCommonProblem = async () => {
      try {
        const response = await fetch(`${URL_API}&act=app7310-01`);
        const data = await response.json();

        if (data && data.data.length > 0) {
          const initialDescriptionState = {};

          data.data.forEach(item => {
            initialDescriptionState[item.board] = false;
          });

          setCommonProblem(data.data);
          setIsDescriptionOpen(initialDescriptionState);
        }
      } catch (error) {
        console.error('Error fetching commonProblem:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    };

    fetchDataLang();
    fetchCommonProblem();
  }, []);

  const toggleDescription = board => {
    // Toggle the description state for the clicked item
    setIsDescriptionOpen({
      ...isDescriptionOpen,
      [board]: !isDescriptionOpen[board],
    });
  };

  return (
    <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={handleBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_cs ? lang.screen_cs.common.title : ''}
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
          {commonProblem.map(item => (
            <TouchableOpacity
              key={item.board}
              onPress={() => toggleDescription(item.board)}
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
                  onPress={() => toggleDescription(item.board)}
                  style={{
                    fontFamily: getFontFam() + 'Regular',
                    fontSize: fontSize('body'),
                    color: 'black',
                    paddingVertical: 18,
                  }}>
                  {item.title}
                </Text>
              </View>

              {/* Description */}
              {isDescriptionOpen[item.board] && (
                <View style={styles.collapseWrapper}>
                  <Text style={styles.normalText}>{item.contents}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
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
  normalText: {
    color: 'grey',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
  },
  collapseWrapper: {
    paddingHorizontal: 5,
    paddingBottom: 10,
    marginTop: -15,
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
    fontSize: fontSize('body'),
    fontWeight: 'bold',
    marginTop: -1,
  },
});

export default CommonProblemScreen;
