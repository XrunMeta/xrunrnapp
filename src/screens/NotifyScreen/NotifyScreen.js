import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const langData = require('../../../lang.json');

const NotifyScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [notify, setNotify] = useState([]);
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
          const reversedNotify = data.data.reverse();
          setNotify(reversedNotify);

          const initialDescriptionState = {};
          reversedNotify.forEach(item => {
            initialDescriptionState[item.board] = false;
          });
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

  // Fungsi tambahan untuk mengecek apakah pesan berasal dari pengguna saat ini
  const isMyMessage = type => {
    if (type == 9303) {
      return true;
    } else {
      return false;
    }
  };

  // Fungsi tambahan untuk memformat timestamp (disesuaikan dengan format yang sesuai)
  const formatTimestamp = timestamp => {
    // Implementasikan logika format timestamp sesuai kebutuhan
    // Misalnya, Anda dapat menggunakan library seperti moment.js untuk melakukan ini.
    return timestamp;
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatContainer}
          ref={scrollView => {
            this.scrollView = scrollView;
          }}>
          {notify.map(item => (
            <View
              key={item.board}
              style={[
                isMyMessage(item.type)
                  ? styles.myChatBubble
                  : styles.otherChatBubble,
                {
                  flexDirection: 'row',
                },
              ]}>
              {item.type == 9303 ? (
                ''
              ) : (
                <View
                  style={{
                    backgroundColor: 'white',
                    height: 32,
                    padding: 6,
                    borderRadius: 25,
                    marginRight: 5,
                    borderWidth: 1,
                    borderColor: '#ebebeb',
                  }}>
                  <Image
                    source={require('../../../assets/images/logo_xrun.png')}
                    style={{
                      height: 18,
                      width: 18,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              )}
              <View style={styles.chatBubble}>
                {item.image !== null && (
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${item.image}`,
                    }}
                    style={{
                      height: 150,
                      width: 'auto',
                      marginBottom: 15,
                      borderRadius: 6,
                    }}
                  />
                )}
                <Text style={styles.chatText}>{item.title}</Text>
                {item.contents !== null && item.type != 9303 && (
                  <View>
                    <Text
                      style={[
                        styles.chatText,
                        {
                          color: 'grey',
                          marginTop: 5,
                        },
                      ]}>
                      {item.contents}
                    </Text>

                    {item.type == 9302 && (
                      <View>
                        <Text
                          style={[
                            styles.chatText,
                            {
                              marginTop: 20,
                            },
                          ]}>
                          {item.datebegin} ~
                        </Text>
                        <Text
                          style={[
                            styles.chatText,
                            {
                              marginTop: -5,
                            },
                          ]}>
                          {item.dateends}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#051C60',
                        marginTop: 15,
                        marginBottom: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                        borderRadius: 6,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-SemiBold',
                          fontSize: 13,
                          color: 'white',
                        }}>
                        {/* Bilal ganteng :D */}
                        {item.type == 9301
                          ? 'TAKE A CLOSER LOOK'
                          : item.type == 9302
                          ? 'GO TO THE EVENT'
                          : ''}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.timestampText}>
                  {formatTimestamp(item.time)}
                </Text>
              </View>
            </View>
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
  chatContainer: {
    paddingHorizontal: 7,
    paddingVertical: 8,
  },
  chatBubble: {
    maxWidth: '80%', // Maksimum lebar bubel pesan
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  myChatBubble: {
    alignSelf: 'flex-end', // Bubel pesan saya ada di sebelah kanan
  },
  otherChatBubble: {
    alignSelf: 'flex-start', // Bubel pesan lain ada di sebelah kiri
  },
  chatText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: 'black',
  },
  timestampText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: 'grey',
    marginTop: 5,
    textAlign: 'right', // Teks timestamp diatur ke kanan
  },
});

export default NotifyScreen;
