import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import jsonData from '../../../testAds';
import {URL_API, getLanguage} from '../../../utils';

const langData = require('../../../lang.json');

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
    {key: 'first', title: 'An Advertisement in Storage'},
    {key: 'second', title: 'Mission Completed Advertisement'},
  ]);
  const layout = useWindowDimensions();
  const [selectedFilter, setSelectedFilter] = useState({
    desc: 'Newest',
    value: 0,
    db: 'datetime',
  });
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [checkedRecommendations, setCheckedRecommendations] = useState({});
  const [isDelete, setIsDelete] = useState(false);
  const [selectedAds, setSelectedAds] = useState([]);

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
        const screenLang = await getLanguage(
          currentLanguage,
          'screen_advertise',
        );
        setLang(screenLang);

        // Get User Data
        const userData = await AsyncStorage.getItem('userData');
        const getData = JSON.parse(userData);

        setUserData(getData);

        const response = await fetch(
          `${URL_API}&act=app5010-02&member=${getData.member}`,
        );
        const data = await response.json();

        if (data && data.data.length > 0) {
          const filteredAds = data.data.map(ad => ({
            transaction: ad.transaction,
            title: ad.title,
            coin: ad.amount + ' ' + ad.symbol,
            extracode: ad.extracode,
            datetime: ad.datetime,
            statusSuccess: 'Coin acquisition completed',
            statusPending: 'Waiting for Coin Acquisition',
          }));

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
      }
    };

    fetchData();
  }, []);

  const completedKeyExtractor = (item, index) => item.transaction.toString();
  const storageKeyExtractor = (item, index) => item.transaction.toString();

  const fetchAdsData = async (orderField, member) => {
    console.log('Call API nih bray');
    try {
      const response = await fetch(
        `${URL_API}&act=app5010-01&orderField=${orderField}&member=${member}`,
      );
      const data = await response.json();

      console.log('Jumlah data Ads Storage -> ' + data.data.length);

      if (data) {
        setStorageAds(data.data);
      }

      setStorageAdsLoading(false);
    } catch (err) {
      console.error('Error fetching ads data:', err);
    }
  };

  const selectFilter = (desc, value, db) => {
    setSelectedFilter({
      desc: desc,
      value: value,
      db: db,
    });

    setFilterModalVisible(false);
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
        <Text style={styles.smallText}>
          {item.extracode === '9416' ? item.statusPending : item.statusSuccess}
        </Text>
      </View>
      <View style={[styles.listUpWrapper, {marginTop: -6}]}>
        <Text style={styles.smallText}>{item.datetime}</Text>
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
      lang.surely,
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
                `${URL_API}&act=app5010-03-deleteall&member=${userData.member}`,
              );
              const data = await response.json();

              if (data && data.data && data.data.length > 0) {
                const count = data.data[0].count;

                // Tampilkan alert sesuai dengan nilai count
                if (count > 0) {
                  // Sukses, tampilkan alert sukses
                  Alert.alert('Success', lang.deleted, [{text: 'Ok'}]);

                  // Exit from Delete Mode and back to normal mode
                  setIsDelete(false);
                  setFilterModalVisible(false);
                  setCheckedRecommendations({});
                  setSelectedAds([]);
                  fetchAdsData('datetime', userData.member);

                  setSelectedFilter({
                    desc: 'Newest',
                    value: 0,
                    db: 'datetime',
                  });
                } else {
                  // Gagal, tampilkan alert gagal
                  Alert.alert('Failed', lang.failedDelete, [{text: 'Ok'}]);
                }
              } else {
                // Tangani kondisi tidak ada data
                Alert.alert('Failed', lang.failedDelete, [{text: 'Ok'}]);
              }
            } catch (err) {
              console.error('Error fetching ads data:', err);
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
      const response = await fetch(
        `${URL_API}&act=app5010-03-delete&transaction=${selectedItems}`,
      );
      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        const count = data.data[0].count;

        // Tampilkan alert sesuai dengan nilai count
        if (count > 0) {
          // Sukses, tampilkan alert sukses
          Alert.alert('Success', lang.deleted, [{text: 'Ok'}]);

          // Exit from Delete Mode and back to normal mode
          setIsDelete(false);
          setFilterModalVisible(false);
          setCheckedRecommendations({});
          setSelectedAds([]);
          fetchAdsData('datetime', userData.member);

          setSelectedFilter({
            desc: 'Newest',
            value: 0,
            db: 'datetime',
          });
        } else {
          // Gagal, tampilkan alert gagal
          Alert.alert('Failed', lang.failedDelete, [{text: 'Ok'}]);
        }
      } else {
        // Tangani kondisi tidak ada data
        Alert.alert('Failed', lang.failedDelete, [{text: 'Ok'}]);
      }
    } catch (err) {
      console.error('Error fetching ads data:', err);
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
              {item.dateends} {lang && lang.until ? lang.until : ''}
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
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
            }}>
            Total <Text style={{color: 'orange'}}>{storageAds.length}</Text>
            XRUNs.
          </Text>
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={{
              backgroundColor: 'white',
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderRadius: 5,
              elevation: 1,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'black',
                fontFamily: 'Poppins-Regular',
                fontSize: 13,
                marginBottom: -2,
              }}>
              {selectedFilter.desc}
            </Text>
            <Image
              source={require('../../../assets/images/icon_dropdown.png')}
              style={{
                tintColor: '#acb5bb',
                height: 15,
                width: 10,
                marginLeft: 10,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* List Storage Ads */}
        {storageAdsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#343a59" />
            <Text style={[styles.normalText, {color: 'grey'}]}>
              {lang && lang.loading ? lang.loading : ''}
            </Text>
          </View>
        ) : storageAds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {lang && lang.nodata ? lang.nodata : ''}
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
                    fontFamily: 'Poppins-SemiBold',
                    textAlign: 'center',
                  }}>
                  {lang && lang.delete ? lang.delete : ''}{' '}
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
                top: 0,
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
                  onPress={() => selectFilter('Newest', 0, 'datetime')}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderBottomColor: '#acb5bb',
                    borderBottomWidth: 1,
                  }}>
                  <Text style={styles.normalText}>
                    {lang && lang.newest ? lang.newest : ''}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => selectFilter('Deadline', 1, 'dateleft')}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderBottomColor: '#acb5bb',
                    borderBottomWidth: 1,
                  }}>
                  <Text style={styles.normalText}>
                    {lang && lang.deadline ? lang.deadline : ''}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => selectFilter('Coin order', 2, 'amount')}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderBottomColor: '#acb5bb',
                  }}>
                  <Text style={styles.normalText}>
                    {lang && lang.order ? lang.order : ''}
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
            {lang && lang.loading ? lang.loading : ''}
          </Text>
        </View>
      ) : completedAds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {lang && lang.nodata ? lang.nodata : ''}
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
            fontFamily: focused ? 'Poppins-Medium' : 'Poppins-Regular',
            fontSize: 13,
            textAlign: 'center',
          }}>
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
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
            {lang && lang.title ? lang.title : ''}
          </Text>
          {index == 0 ? (
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
                  // color: '#ffdc04',
                  color: 'orange',
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 13,
                }}>
                {isDelete
                  ? lang && lang.deleteAll
                    ? lang.deleteAll
                    : ''
                  : lang && lang.delete
                  ? lang.delete
                  : ''}
              </Text>
            </TouchableOpacity>
          ) : (
            ''
          )}
        </View>
      </View>

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
    elevation: 2,
    zIndex: 0,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#051C60',
    margin: 10,
    marginLeft: -10,
  },
  normalText: {
    color: 'black',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  smallText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: 'grey',
    paddingTop: 7,
  },
  mediumText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
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
    fontFamily: 'Poppins-Regular',
    fontSize: 20,
  },
  listNormalText: {
    color: 'grey',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    marginBottom: -3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'grey',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
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
    fontSize: 11,
    marginTop: -2,
    fontWeight: 'bold',
  },
});

export default AdvertiseScreen;
