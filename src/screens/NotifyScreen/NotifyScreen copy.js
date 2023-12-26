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
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {URL_API} from '../../../utils';

const langData = require('../../../lang.json');

const NotifyScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [notify, setNotify] = useState([]);
  const [userData, setUserData] = useState({});
  const [chatText, setChatText] = useState('');
  const [loading, setLoading] = useState(true);

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
          `${URL_API}&act=ap6000-01&member=${getData.member}&start=0`,
        );
        const data = await response.json();

        if (data && data.data.length > 0) {
          const reversedNotify = data.data.reverse();
          setNotify(reversedNotify);
        }

        setLoading(false);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage();
  }, []);

  const sendChat = async text => {
    setChatText('');
    if (text.trim() === '') {
      Alert.alert(
        lang && lang.alert ? lang.alert.title.error : '',
        lang && lang.screen_confirm_password
          ? lang.screen_confirm_password.condition.empty
          : '-',
      );
    } else {
      try {
        const response = await fetch(
          `${URL_API}&act=ap6000-02&member=${userData.member}&title=${text}`,
        );
        const data = await response.json();

        if (data.data[0].count == 1) {
          const now = new Date();
          const date = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
          const formattedDate = `${now
            .getHours()
            .toString()
            .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

          const newBubble = {
            board: Date.now().toString(),
            datetime: date,
            title: chatText,
            contents: chatText,
            type: 9303,
            image: null,
            time: `${date}\n ${formattedDate}`,
          };

          // Perbarui state notify dengan bubble chat baru
          setNotify(prevNotify => [...prevNotify, newBubble]);
        }
      } catch (error) {
        console.error('Error sending chat:', error);
      }
    }
  };

  // Fungsi tambahan untuk mengecek apakah pesan berasal dari pengguna saat ini
  const isMyMessage = type => {
    if (type == 9303) {
      return true;
    } else {
      return false;
    }
  };

  const formatDate = timestamp => {
    const options = {
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    };

    const dateObject = new Date(timestamp);
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(
      dateObject,
    );

    // MM/DD Date Format
    const [monthDay, shortDay] = formattedDate.split(', ');
    const day = shortDay.substring(0, 2);
    const month = shortDay.substring(3);

    return `${day + '.' + month} (${monthDay})`;
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
              console.log('Delete Boy -> ');
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#343a59" />
            <Text
              style={{
                color: 'grey',
                fontFamily: 'Poppins-Regular',
                fontSize: 13,
              }}>
              {lang && lang.screen_map && lang.screen_map.section_marker
                ? lang.screen_map.section_marker.loader
                : ''}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContainer}
            ref={scrollView => {
              this.scrollView = scrollView;
            }}>
            {notify.map((item, idx) => (
              <View key={item.board}>
                {(() => {
                  var beforeDate =
                    idx > 0 ? JSON.stringify(notify[idx - 1].datetime) : '';

                  var nowDate = item.datetime;

                  var inThisDay = `"${nowDate}"` === beforeDate ? true : false;

                  console.log(` 
                  Index : ${idx} 
                      Before : ${beforeDate} 
                      Now    : ${nowDate}
                      Status : ${inThisDay}
                `);

                  if (inThisDay) {
                    return '';
                  } else {
                    return (
                      <Text
                        style={{
                          color: 'white',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 11,
                          backgroundColor: '#89919d73',
                          borderRadius: 115,
                          alignSelf: 'center',
                          paddingTop: 3,
                          paddingBottom: 1,
                          paddingHorizontal: 8,
                          marginBottom: 8,
                        }}>
                        {formatDate(new Date(item.datetime).toISOString())}
                      </Text>
                    );
                  }
                })()}

                <View
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
                        {item.type == 9301 ? (
                          <Text
                            style={[
                              styles.chatText,
                              {
                                color: 'grey',
                                marginTop: 5,
                              },
                            ]}
                            numberOfLines={3}
                            ellipsizeMode="tail">
                            {item.contents}
                          </Text>
                        ) : (
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
                        )}

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

                        {item.guid == '' ||
                        (item.guid == null && item.type == 9302) ? (
                          ''
                        ) : (
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#051C60',
                              marginTop: 15,
                              marginBottom: 5,
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingVertical: 10,
                              borderRadius: 6,
                            }}
                            onPress={() => {
                              const url =
                                item.type == 9301
                                  ? `https://app.xrun.run/user/notice.php?id=${item.board}`
                                  : item.type == 9302
                                  ? item.guid
                                  : '';

                              Linking.openURL(url).catch(err =>
                                console.error('Error opening URL : ', err),
                              );
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
                        )}
                      </View>
                    )}

                    <Text style={styles.timestampText}>{item.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Chat Input */}
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type your question..."
          placeholderTextColor="grey"
          value={chatText}
          onChangeText={setChatText}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => {
            sendChat(chatText);
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
    maxWidth: '80%',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  myChatBubble: {
    alignSelf: 'flex-end', // Right Bubble Chat
  },
  otherChatBubble: {
    alignSelf: 'flex-start', // Left Bubble Chat
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
    textAlign: 'right',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default NotifyScreen;
