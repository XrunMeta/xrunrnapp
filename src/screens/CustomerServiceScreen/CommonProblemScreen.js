import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

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
    const getLanguage = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const selectedLanguage = currentLanguage === 'id' ? 'id' : 'eng';
        const language = langData[selectedLanguage];
        setLang(language);
      } catch (err) {
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
      }
    };

    getLanguage();
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
    <View style={[styles.root, {height: ScreenHeight}]}>
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
                    fontFamily: 'Poppins-Regular',
                    fontSize: 13,
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
  normalText: {
    color: 'grey',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
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

export default CommonProblemScreen;
