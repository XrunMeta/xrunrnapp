import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const langData = require('../../../lang.json');

const NotifyScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [commonProblem, setCommonProblem] = useState([]);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState({});
  const [userData, setUserData] = useState({});

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

        // Get User Data
        const userData = await AsyncStorage.getItem('userData');
        const getData = JSON.parse(userData);
        setUserData(getData);

        const response = await fetch(
          `https://app.xrun.run/gateway.php?act=ap6000-01&member=${getData.member}&start=0`,
        );
        const data = await response.json();

        if (data && data.data.length > 0) {
          const initialDescriptionState = {};

          data.data.forEach(item => {
            initialDescriptionState[item.board] = false;
          });

          setCommonProblem(data.data);
          setIsDescriptionOpen(initialDescriptionState);
        }
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage();
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
          <Text style={styles.title}>Notify</Text>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 0,
              padding: 15,
            }}
            onPress={() => {
              console.log('Delete Boy');
            }}>
            <Text
              style={{
                color: '#ffdc04',
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
              }}>
              DELETE
            </Text>
          </TouchableOpacity>
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Input */}
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type your question..."
          placeholderTextColor="grey"
          multiline
          // Handle onChangeText event to update the message state
          onChangeText={text => {
            // Implement your logic to update the message state
            console.log('Updated message:', text);
          }}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => {
            // Implement your logic to send the message
            console.log('Send button pressed');
          }}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
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
  chatInputContainer: {
    flexDirection: 'row',
    // paddingHorizontal: 10,
    paddingRight: 8,
    paddingLeft: 10,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    color: 'black',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    paddingBottom: 6,
  },
  sendButton: {
    backgroundColor: '#051C60',
    borderRadius: 10,
    paddingVertical: 7,
    elevation: 2,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    marginTop: 3,
  },
});

export default NotifyScreen;
