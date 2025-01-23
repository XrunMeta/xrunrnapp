import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  FlatList,
  TouchableWithoutFeedback,
  Pressable,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import jsonData from '../../../testAds';
import {
  URL_API_NODEJS,
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
  formatISODate,
  dateFormatter,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import RadioGroup from 'react-native-radio-buttons-group';

const AdvertiseScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});
  const [completedAds, setCompletedAds] = useState([]);
  const [completedAdsLoading, setCompletedAdsLoading] = useState(true);
  const [storageAds, setStorageAds] = useState([]);
  const [storageAdsLoading, setStorageAdsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: 'first',
    },
    {
      key: 'second',
    },
    {
      key: 'third',
    },
  ]);
  const layout = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState({});
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [checkedRecommendations, setCheckedRecommendations] = useState({});
  const [isDelete, setIsDelete] = useState(false);
  const [selectedAds, setSelectedAds] = useState([]);
  const [isShowPopupFloating, setIsShowPopupFloating] = useState(false);

  // Select floating radio button
  const radioButtons = useMemo(
    () => [
      {
        id: '1',
        label:
          lang && lang.screen_advertise && lang.screen_advertise.newest
            ? lang.screen_advertise.newest
            : '',
        value: 0,
        db: 'datetime',
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () =>
          selectFilter(
            lang && lang.screen_advertise && lang.screen_advertise.newest
              ? lang.screen_advertise.newest
              : 'Newest',
            0,
            'datetime',
          ),
      },
      {
        id: '2',
        label:
          lang && lang.screen_advertise && lang.screen_advertise.deadline
            ? lang.screen_advertise.deadline
            : '',
        value: 1,
        db: 'dateleft',
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () =>
          selectFilter(
            lang && lang.screen_advertise && lang.screen_advertise.deadline
              ? lang.screen_advertise.deadline
              : 'Deadline',
            1,
            'dateleft',
          ),
      },
      {
        id: '3',
        label:
          lang && lang.screen_advertise && lang.screen_advertise.order
            ? lang.screen_advertise.order
            : '',
        value: 2,
        db: 'amount',
        borderColor: '#009484',
        color: '#009484',
        labelStyle: {
          color: 'black',
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('subtitle'),
          width: 200,
        },
        onPress: () =>
          selectFilter(
            lang && lang.screen_advertise && lang.screen_advertise.order
              ? lang.screen_advertise.order
              : 'Coin Order',
            2,
            'amount',
          ),
      },
    ],
    [lang],
  );
  const [selectedId, setSelectedId] = useState('1');

  // Back
  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        console.log('Dapetin API di awal nih bray');
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
        setSelectedFilter({
          desc:
            screenLang &&
            screenLang.screen_advertise &&
            screenLang.screen_advertise.newest
              ? screenLang.screen_advertise.newest
              : 'Newest',
          value: 0,
          db: 'datetime',
        });

        // Get User Data
        const userData = await AsyncStorage.getItem('userData');
        const getData = JSON.parse(userData);

        setUserData(getData);

        const response = await fetch(`${URL_API_NODEJS}/app5010-02`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authcode}`,
          },
          body: JSON.stringify({
            member: getData?.member,
          }),
        });

        const data = await response.json();

        if (data && data.data.length > 0) {
          const filteredAds = data.data.map(ad => {
            const localizedDatetime = dateFormatter(ad.datetime);

            return {
              transaction: ad.transaction,
              title: ad.title,
              coin: ad.amount + ' ' + ad.symbol,
              extracode: ad.extracode,
              datetime: localizedDatetime,
              statusSuccess:
                lang && lang.screen_advertise && lang.screen_advertise.completed
                  ? lang.screen_advertise.completed
                  : 'Coin acquisition completed',
              statusPending:
                lang && lang.screen_advertise && lang.screen_advertise.pending
                  ? lang.screen_advertise.pending
                  : 'Waiting for Coin Acquisition',
            };
          });

          setCompletedAds(filteredAds);

          fetchAdsData('datetime', getData.member);
          // setStorageAds(jsonData.data);
        }

        setCompletedAdsLoading(false);
        setStorageAdsLoading(false);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        navigation.replace('Home');
      }
    };

    fetchData();
  }, []);

  const completedKeyExtractor = (item, index) => item.transaction.toString();
  const storageKeyExtractor = (item, index) => item.transaction.toString();

  const fetchAdsData = async (orderField, member) => {
    console.log('Call API nih bray');
    try {
      const response = await fetch(`${URL_API_NODEJS}/app5010-01`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          member,
          orderField,
        }),
      });

      const data = await response.json();

      if (data) {
        setStorageAds(data.data);
      }

      setStorageAdsLoading(false);
    } catch (err) {
      console.error('Error fetching ads data:', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      navigation.replace('Home');
    }
  };

  const selectFilter = (desc, value, db) => {
    setSelectedFilter({
      desc: desc,
      value: value,
      db: db,
    });

    setFilterModalVisible(false);
    setIsShowPopupFloating(false);
    setCheckedRecommendations({});
    setSelectedAds([]);

    // Memanggil API berdasarkan filter yang dipilih
    if (value == 0) {
      fetchAdsData('datetime', userData.member);
      // setStorageAds(jsonData.data);
    } else if (value == 1) {
      fetchAdsData('dateleft', userData.member);
    } else if (value == 2) {
      fetchAdsData('amount', userData.member);
    }
  };

  const onStorage = (memberID, advertisement, coin) => {
    navigation.replace('ShowAd', {
      screenName: 'AdvertiseHome',
      member: memberID,
      advertisement: advertisement,
      coin: coin,
      coinScreen: false,
    });
  };

  const completedRenderItem = ({item}) => (
    <View style={styles.list} key={item.transaction}>
      <View style={styles.listUpWrapper}>
        <Text
          style={[styles.mediumText, {width: 160}]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.smallText, {marginTop: -4}]}>
          {item.extracode === '9416' ? item.statusPending : item.statusSuccess}
        </Text>
      </View>
      <View style={[styles.listUpWrapper, {marginTop: -5, marginBottom: 8}]}>
        <Text style={[styles.smallText, {marginTop: -1}]}>{item.datetime}</Text>
        <Text style={styles.mediumText}>{item.coin}</Text>
      </View>
    </View>
  );

  const toggleCheckbox = txid => {
    const updatedCheckedAds = {...checkedRecommendations};
    updatedCheckedAds[txid] = !updatedCheckedAds[txid];

    const selectedAdsSet = new Set(selectedAds);
    if (updatedCheckedAds[txid]) {
      selectedAdsSet.add(txid);
    } else {
      selectedAdsSet.delete(txid);
    }

    setSelectedAds(Array.from(selectedAdsSet));
    setCheckedRecommendations(updatedCheckedAds);
  };

  const deleteAllChat = async () => {
    Alert.alert(
      'Warning',
      lang.screen_advertise.surely,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await fetch(
                `${URL_API_NODEJS}/app5010-03-deleteall`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authcode}`,
                  },
                  body: JSON.stringify({
                    member: userData?.member,
                  }),
                },
              );

              const data = await response.json();

              if (data && data.data && data.data.length > 0) {
                const count = data.data[0].count;

                // Tampilkan alert sesuai dengan nilai count
                if (count > 0) {
                  // Sukses, tampilkan alert sukses
                  Alert.alert('Success', lang.screen_advertise.deleted, [
                    {text: 'Ok'},
                  ]);

                  // Exit from Delete Mode and back to normal mode
                  setIsDelete(false);
                  setFilterModalVisible(false);
                  setIsShowPopupFloating(false);
                  setCheckedRecommendations({});
                  setSelectedAds([]);
                  fetchAdsData('datetime', userData.member);

                  setSelectedFilter({
                    desc:
                      lang &&
                      lang.screen_advertise &&
                      lang.screen_advertise.newest
                        ? lang.screen_advertise.newest
                        : 'Newest',
                    value: 0,
                    db: 'datetime',
                  });
                } else {
                  // Gagal, tampilkan alert gagal
                  Alert.alert('Failed', lang.screen_advertise.failedDelete, [
                    {text: 'Ok'},
                  ]);
                }
              } else {
                // Tangani kondisi tidak ada data
                Alert.alert('Failed', lang.screen_advertise.failedDelete, [
                  {text: 'Ok'},
                ]);
              }
            } catch (err) {
              console.error('Error delete all chat:', err);
              crashlytics().recordError(new Error(err));
              crashlytics().log(err);
              navigation.replace('Home');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const deleteSelectedAds = async selectedItems => {
    console.log('Hapus ID => ' + selectedItems);

    try {
      const response = await fetch(`${URL_API_NODEJS}/app5010-03-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          transaction: selectedItems,
        }),
      });
      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        const count = data.data[0].count;

        // Tampilkan alert sesuai dengan nilai count
        if (count > 0) {
          // Sukses, tampilkan alert sukses
          Alert.alert('Success', lang.screen_advertise.deleted, [{text: 'Ok'}]);

          // Exit from Delete Mode and back to normal mode
          setIsDelete(false);
          setFilterModalVisible(false);
          setIsShowPopupFloating(false);
          setCheckedRecommendations({});
          setSelectedAds([]);
          fetchAdsData('datetime', userData.member);

          setSelectedFilter({
            desc:
              lang && lang.screen_advertise && lang.screen_advertise.newest
                ? lang.screen_advertise.newest
                : 'Newest',
            value: 0,
            db: 'datetime',
          });
        } else {
          // Gagal, tampilkan alert gagal
          Alert.alert('Failed', lang.screen_advertise.failedDelete, [
            {text: 'Ok'},
          ]);
        }
      } else {
        // Tangani kondisi tidak ada data
        Alert.alert('Failed', lang.screen_advertise.failedDelete, [
          {text: 'Ok'},
        ]);
      }
    } catch (err) {
      console.error('Error delete Selected Ads:', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      navigation.replace('Home');
    }
  };

  const storageRenderItem = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        isDelete
          ? toggleCheckbox(item.transaction)
          : onStorage(userData.member, item.advertisement, item.coin)
      }
      style={styles.storageList}
      activeOpacity={0.9}
      key={item.transaction}>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
        }}>
        {isDelete && (
          <View
            style={[
              styles.checkbox,
              checkedRecommendations[item.transaction]
                ? styles.checkedBox
                : styles.uncheckedBox,
            ]}>
            {checkedRecommendations[item.transaction] && (
              <Text style={styles.checkMark}>✔</Text>
            )}
          </View>
        )}
        <Image
          source={{
            uri: `data:image/jpeg;base64,${item.symbolimg}`,
          }}
          style={{
            height: 35,
            width: 35,
            resizeMode: 'contain',
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <Text
            numberOfLines={1}
            style={[styles.listBigText, {marginBottom: -3}]}>
            {item.symbol}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}>
              <Text
                style={[
                  styles.listBigText,
                  {
                    marginBottom: -8,
                    marginTop: -9,
                  },
                ]}>
                {item.amount}
              </Text>
              <Text style={styles.listNormalText}> {item.symbol}</Text>
            </View>
            <Text style={styles.listNormalText}>
              {item.dateends}{' '}
              {lang && lang.screen_advertise && lang.screen_advertise.until
                ? lang.screen_advertise.until
                : ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const storageRoute = (deleteMode, selectedItems) => {
    return (
      <View style={{flex: 1}}>
        {/* Tab Info */}
        <View
          style={{
            backgroundColor: '#f4f4f4',
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}>
          <Text
            style={{
              color: 'black',
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
            }}>
            {lang && lang.screen_advertise && lang.screen_advertise.total
              ? lang.screen_advertise.total
              : 'Total'}{' '}
            <Text style={{color: 'orange'}}>{storageAds.length}</Text>
            XRUN.
          </Text>
          <TouchableOpacity
            // onPress={() => setFilterModalVisible(true)}
            onPress={() => setIsShowPopupFloating(true)}
            style={{
              backgroundColor: 'white',
              paddingVertical: 10,
              paddingHorizontal: 10,
              borderRadius: 5,
              elevation: 1,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'black',
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('body'),
                marginBottom: -2,
              }}>
              {selectedFilter.desc}
            </Text>
            {/* <Image
              source={require('../../../assets/images/icon_dropdown.png')}
              style={{
                tintColor: '#acb5bb',
                height: 15,
                width: 10,
                marginLeft: 10,
              }}
            /> */}
          </TouchableOpacity>
        </View>

        {/* List Storage Ads */}
        {storageAdsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#343a59" />
            <Text style={[styles.normalText, {color: 'grey'}]}>
              {lang && lang.screen_advertise && lang.screen_advertise.loading
                ? lang.screen_advertise.loading
                : ''}
            </Text>
          </View>
        ) : storageAds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {lang && lang.screen_advertise && lang.screen_advertise.nodata
                ? lang.screen_advertise.nodata
                : ''}
            </Text>
          </View>
        ) : (
          <View>
            <FlatList
              data={storageAds}
              keyExtractor={storageKeyExtractor}
              renderItem={storageRenderItem}
            />
            {deleteMode && (
              <TouchableOpacity
                onPress={() => deleteSelectedAds(selectedItems)}
                style={{
                  backgroundColor: '#051C60',
                  paddingVertical: 20,
                  position: 'absolute',
                  bottom: 45,
                  right: 0,
                  left: 0,
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: getFontFam() + 'Medium',
                    textAlign: 'center',
                  }}>
                  {lang && lang.screen_advertise && lang.screen_advertise.delete
                    ? lang.screen_advertise.delete
                    : ''}{' '}
                  {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isFilterModalVisible && (
          <TouchableWithoutFeedback
            onPress={() => {
              setFilterModalVisible(false);
            }}
            style={{
              flex: 1,
            }}>
            <View
              style={{
                flex: 1,
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                bottom: 0,
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  position: 'absolute',
                  right: 20,
                  top: 42,
                  elevation: 5,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}>
                <Pressable
                  onPress={() =>
                    selectFilter(
                      lang &&
                        lang.screen_advertise &&
                        lang.screen_advertise.newest
                        ? lang.screen_advertise.newest
                        : 'Newest',
                      0,
                      'datetime',
                    )
                  }
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    borderBottomColor: '#acb5bb',
                    borderBottomWidth: 1,
                  }}>
                  <Text style={styles.normalText}>
                    {lang &&
                    lang.screen_advertise &&
                    lang.screen_advertise.newest
                      ? lang.screen_advertise.newest
                      : ''}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    selectFilter(
                      lang &&
                        lang.screen_advertise &&
                        lang.screen_advertise.deadline
                        ? lang.screen_advertise.deadline
                        : 'Deadline',
                      1,
                      'dateleft',
                    )
                  }
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    borderBottomColor: '#acb5bb',
                    borderBottomWidth: 1,
                  }}>
                  <Text style={styles.normalText}>
                    {lang &&
                    lang.screen_advertise &&
                    lang.screen_advertise.deadline
                      ? lang.screen_advertise.deadline
                      : ''}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    selectFilter(
                      lang &&
                        lang.screen_advertise &&
                        lang.screen_advertise.order
                        ? lang.screen_advertise.order
                        : 'Coin Order',
                      2,
                      'amount',
                    )
                  }
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    borderBottomColor: '#acb5bb',
                  }}>
                  <Text style={styles.normalText}>
                    {lang &&
                    lang.screen_advertise &&
                    lang.screen_advertise.order
                      ? lang.screen_advertise.order
                      : ''}
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  };

  const completedRoute = () => (
    <View
      style={{
        flex: 1,
      }}>
      {completedAdsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#343a59" />
          <Text style={[styles.normalText, {color: 'grey'}]}>
            {lang && lang.screen_advertise && lang.screen_advertise.loading
              ? lang.screen_advertise.loading
              : ''}
          </Text>
        </View>
      ) : completedAds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {lang && lang.screen_advertise && lang.screen_advertise.nodata
              ? lang.screen_advertise.nodata
              : ''}
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedAds}
          keyExtractor={completedKeyExtractor}
          renderItem={completedRenderItem}
        />
      )}
    </View>
  );

  const itemShop = () => (
    <View
      style={{
        flex: 1,
      }}>
      {completedAdsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#343a59" />
          <Text style={[styles.normalText, {color: 'grey'}]}>
            {lang && lang.screen_advertise && lang.screen_advertise.loading
              ? lang.screen_advertise.loading
              : ''}
          </Text>
        </View>
      ) : completedAds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {lang && lang.screen_advertise && lang.screen_advertise.nodata
              ? lang.screen_advertise.nodata
              : ''}
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedAds}
          keyExtractor={completedKeyExtractor}
          renderItem={completedRenderItem}
        />
      )}
    </View>
  );

  const renderScene = SceneMap({
    first: () => storageRoute(isDelete, selectedAds),
    second: completedRoute,
    third: itemShop,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: '#051C60', height: 3}}
      style={{backgroundColor: 'white', elevation: 0}}
      renderLabel={({route, focused, color}) => (
        <Text
          style={{
            color: focused ? 'black' : 'grey',
            fontFamily: focused
              ? getFontFam() + 'Medium'
              : getFontFam() + 'Regular',
            fontSize: fontSize('body'),
            textAlign: 'center',
          }}>
          {route.key === 'first'
            ? lang && lang.screen_advertise && lang.screen_advertise.tab1
              ? lang.screen_advertise.tab1
              : 'Storage'
            : route.key === 'second'
            ? lang && lang.screen_advertise && lang.screen_advertise.tab2
              ? lang.screen_advertise.tab2
              : 'Completed'
            : route.key === 'third'
            ? 'Item Shop'
            : ''}
        </Text>
      )}
    />
  );

  return (
    <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row', zIndex: 1}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          {isDelete && index == 0 ? (
            <TouchableOpacity
              onPress={() => {
                setIsDelete(false);
                setCheckedRecommendations({});
                setSelectedAds([]);
              }}
              style={{
                alignSelf: 'flex-start',
                paddingVertical: 20,
                paddingLeft: 25,
                paddingRight: 30,
                marginTop: 4,
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
            {lang && lang.screen_advertise && lang.screen_advertise.title
              ? lang.screen_advertise.title
              : ''}
          </Text>
          {index == 0 ? (
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 10,
                backgroundColor: 'white',
                height: 35,
                width: 35,
                padding: 8,
                borderRadius: 25,
                marginLeft: 5,
                borderWidth: 1,
                borderColor: '#ebebeb',
              }}
              onPress={() => {
                if (isDelete) {
                  return deleteAllChat();
                } else {
                  return setIsDelete(true);
                }
              }}>
              <Image
                source={require('../../../assets/images/icon_delete.png')}
                style={{
                  height: 18,
                  width: 18,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          ) : (
            ''
          )}
        </View>
      </View>

      {/* Popup Floating */}
      {isShowPopupFloating && (
        <View style={styles.popupFloating}>
          <TouchableOpacity
            style={styles.fullScreenOverlay}
            onPress={() => setIsShowPopupFloating(false)}
            activeOpacity={1}
          />
          <ScrollView style={styles.subPopupFloating}>
            <Text style={styles.titleRadioButton}>
              {lang &&
              lang.screen_advertise &&
              lang.screen_advertise.title_floating_popup
                ? lang.screen_advertise.title_floating_popup
                : ''}
            </Text>

            <RadioGroup
              radioButtons={radioButtons}
              onPress={setSelectedId}
              selectedId={selectedId}
              containerStyle={{
                alignItems: 'flex-start',
                rowGap: 10,
              }}
            />
          </ScrollView>
        </View>
      )}

      <View
        style={{
          flex: 1,
          width: '100%',
        }}>
        <View style={{backgroundColor: 'white', flex: 1}}>
          <TabView
            renderTabBar={renderTabBar}
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{width: layout.width}}
          />
        </View>
      </View>

      {/* {isFilterModalVisible && <ListWrapper />} */}
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
    elevation: 2,
    zIndex: 0,
  },
  title: {
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
  normalText: {
    color: 'black',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  smallText: {
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('note'),
    color: 'grey',
    paddingTop: 7,
  },
  mediumText: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('subtitle'),
    color: 'black',
  },
  list: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 2,
  },
  listUpWrapper: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  storageList: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomColor: 'red',
    borderBottomWidth: 1.5,
  },
  listBigText: {
    color: 'grey',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('title'),
  },
  listNormalText: {
    color: 'grey',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    marginBottom: -3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'grey',
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
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
    fontSize: fontSize('note'),
    marginTop: -2,
    fontWeight: 'bold',
  },
  popupFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  subPopupFloating: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    width: 320,
    overflow: 'hidden',
    zIndex: 2,
    maxHeight: 200,
  },
  titleRadioButton: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('subtitle'),
    marginBottom: 16,
    color: 'black',
    marginLeft: 10,
  },
});

export default AdvertiseScreen;
