import React, {useState, useEffect, useRef} from 'react';
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
import {URL_API, getLanguage2} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const NotifyScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [notify, setNotify] = useState([]);
  const [userData, setUserData] = useState({});
  const [chatText, setChatText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDelete, setIsDelete] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

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
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    fetchData();
  }, []);

  // Back
  const handleBack = () => {
    navigation.goBack();
  };

  // Date Formatting
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

  // Message Status Checker
  const isMyMessage = type => {
    if (type == 9303) {
      return true;
    } else {
      return false;
    }
  };

  // Send Chat
  const sendChat = async text => {
    setChatText('');
    scrollViewRef.current.scrollToEnd({animated: true});
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
          refreshChatView();
        }
      } catch (error) {
        console.error('Error sending chat:', error);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    }
  };

  // Fungsi untuk memperbarui tampilan chat
  const refreshChatView = async () => {
    try {
      const response = await fetch(
        `${URL_API}&act=ap6000-01&member=${userData.member}&start=0`,
      );
      const data = await response.json();

      if (data && data.data.length > 0) {
        const reversedNotify = data.data.reverse();
        setNotify(reversedNotify);
      }
    } catch (err) {
      console.error('Error retrieving chat data:', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
    }
  };

  // Delete Chat
  const deleteChat = async data => {
    try {
      const response = await fetch(
        `${URL_API}&act=ap6000-03&member=${userData.member}&board=${data.board}`,
      );
      const jsonData = await response.json();

      console.log(jsonData);

      if (jsonData.data[0].count == 1) {
        // Remove clicked Chat
        setNotify(prevNotify =>
          prevNotify.filter(item => item.board !== data.board),
        );
      } else {
        console.log('GHagal coy -> ' + data.board);
      }
    } catch (error) {
      console.error('Error sending chat:', error);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
    }
  };

  // Delete All Chat
  const deleteAllChat = async () => {
    try {
      // Show a confirmation alert
      Alert.alert(
        'Confirmation',
        lang.screen_notify.surely,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              setIsDelete(false);

              const response = await fetch(
                `${URL_API}&act=ap6000-04delete&member=${userData.member}`,
              );
              const jsonData = await response.json();

              if (jsonData.data[0].count > 0) {
                // Remove All Inquiry Chat
                setNotify(prevNotify =>
                  prevNotify.filter(item => item.type !== 9303),
                );
              }
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error sending chat:', error);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          {isDelete ? (
            <TouchableOpacity
              onPress={() => setIsDelete(false)}
              style={{
                alignSelf: 'flex-start',
                paddingVertical: 20,
                paddingLeft: 25,
                paddingRight: 30,
                marginTop: 5,
              }}>
              <Image
                source={require('../../../assets/images/icon_close_2.png')}
                resizeMode="contain"
                style={{
                  height: 25,
                  width: 25,
                }}
              />
            </TouchableOpacity>
          ) : (
            <ButtonBack onClick={handleBack} />
          )}
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>
            {lang && lang.screen_notify && lang.screen_notify.title
              ? lang.screen_notify.title
              : ''}
          </Text>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 0,
              padding: 15,
            }}
            onPress={() => {
              if (isDelete) {
                return deleteAllChat();
              } else {
                return setIsDelete(true);
              }
            }}>
            <Text
              style={{
                color: '#ffdc04',
                fontFamily: 'Roboto-Medium',
                fontSize: 16,
              }}>
              {isDelete
                ? lang && lang.screen_notify && lang.screen_notify.deleteAll
                  ? lang.screen_notify.deleteAll
                  : ''
                : lang && lang.screen_notify && lang.screen_notify.delete
                ? lang.screen_notify.delete
                : ''}
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
                fontFamily: 'Roboto-Regular',
                fontSize: 13,
              }}>
              {lang && lang.screen_notify && lang.screen_notify.loader
                ? lang.screen_notify.loader
                : ''}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContainer}
            ref={scrollViewRef}>
            {notify.map((item, idx) => (
              <View key={item.board}>
                {(() => {
                  var beforeDate =
                    idx > 0 ? JSON.stringify(notify[idx - 1].datetime) : '';

                  var nowDate = item.datetime;

                  var inThisDay = `"${nowDate}"` === beforeDate ? true : false;

                  if (!inThisDay) {
                    return (
                      <Text
                        style={{
                          color: 'white',
                          fontFamily: 'Roboto-Regular',
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

                              Linking.openURL(url).catch(err => {
                                crashlytics().recordError(new Error(err));
                                crashlytics().log(err);
                                console.error('Error opening URL : ', err);
                              });
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Roboto-Medium',
                                fontSize: 13,
                                color: 'white',
                              }}>
                              {/* Bilal ganteng :D */}
                              {item.type == 9301
                                ? lang &&
                                  lang.screen_notify &&
                                  lang.screen_notify.look
                                  ? lang.screen_notify.look
                                  : ''
                                : item.type == 9302
                                ? lang &&
                                  lang.screen_notify &&
                                  lang.screen_notify.visit
                                  ? lang.screen_notify.visit
                                  : ''
                                : ''}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    <Text style={styles.timestampText}>{item.time}</Text>
                  </View>
                  {item.type == 9303 && isDelete && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: 'white',
                        height: 32,
                        padding: 8,
                        borderRadius: 25,
                        marginLeft: 5,
                        borderWidth: 1,
                        borderColor: '#ebebeb',
                      }}
                      onPress={() => {
                        deleteChat(item);
                      }}>
                      <Image
                        source={require('../../../assets/images/icon_delete.png')}
                        style={{
                          height: 15,
                          width: 15,
                          resizeMode: 'contain',
                        }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Chat Input */}
      {!isDelete && (
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder={
              lang && lang.screen_notify && lang.screen_notify.placeholder
                ? lang.screen_notify.placeholder
                : ''
            }
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
            <Text style={styles.sendButtonText}>
              {lang && lang.screen_notify && lang.screen_notify.send
                ? lang.screen_notify.send
                : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontFamily: 'Roboto-Bold',
    color: '#051C60',
    margin: 10,
  },
  normalText: {
    color: 'grey',
    fontFamily: 'Roboto-Regular',
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
    fontFamily: 'Roboto-Regular',
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
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    color: 'black',
  },
  timestampText: {
    fontFamily: 'Roboto-Regular',
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
