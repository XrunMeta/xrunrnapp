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
  ActivityIndicator,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {Link, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const langData = require('../../../lang.json');

const NotifyScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [notify, setNotify] = useState([]);
  const [userData, setUserData] = useState({});
  const [prevDate, setPrevDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatText, setChatText] = useState('');

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

          setPrevDate(reversedNotify[0].datetime);

          let prevDates =
            reversedNotify.length > 0
              ? reversedNotify[0].datetime
              : new Date().toISOString().split('T')[0];

          reversedNotify.forEach(item => {
            const currentDate = new Date(item.datetime)
              .toISOString()
              .split('T')[0];

            let bgst =
              prevDates === item.datetime ? 'Samaaaaaaaaaaaaaaaa' : 'Beda';
            // console.log(prevDates + ' - ' + currentDate + ' = ' + bgst);
            prevDates = item.datetime;

            // if (prevDates !== item.datetime) {
            //   // Tanggal berbeda, update state dan tampilkan teks perbedaan tanggal
            //   setPrevDate(item.datetime);
            // }
          });

          setLoading(false);
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#343a59" />
            <Text
              style={{
                color: 'grey',
                fontFamily: 'Poppins-Regular',
                fontSize: 13,
                alignSelf: 'center',
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
            {notify.map(item => (
              <View key={item.board}>
                {/* Tampilkan teks perbedaan tanggal jika tanggal berbeda */}
                {/* {prevDate !== item.datetime && ( */}
                {item.datetime && (
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
                    {(() => {
                      let isSame =
                        prevDate === item.datetime
                          ? 'Samaaaaaaaaaaaaaaaa'
                          : 'Beda';

                      console.log(
                        prevDate + ' - ' + item.datetime + ' = ' + isSame,
                      );
                      setPrevDate(item.datetime);

                      // if (prevDates !== item.datetime) {
                      //   // Tanggal berbeda, update state dan tampilkan teks perbedaan tanggal
                      //   setPrevDate(item.datetime);
                      // }
                    })()}

                    {formatDate(new Date(item.datetime).toISOString())}
                  </Text>
                )}
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
                            numberOfLines={3} // Set jumlah baris maksimum
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
            console.log('Send button pressed -> ' + chatText);
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
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
