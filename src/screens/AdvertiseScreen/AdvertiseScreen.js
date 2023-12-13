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
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import jsonData from '../../../testAds';

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
  const [isDelete, setIsDelete] = useState(false);
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

  // Back
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

        // Example Data from app5010-01
        // https://paste.sh/K99N6U8X#2HAEgf31aYrOA0bFo0CUjFfA

        const response = await fetch(
          `https://app.xrun.run/gateway.php?act=app5010-02&member=${getData.member}`,
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
          setStorageAds(jsonData.data);
        }

        setCompletedAdsLoading(false);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    getLanguage();
  }, []);

  const completedKeyExtractor = (item, index) => item.transaction.toString();
  const storageKeyExtractor = (item, index) => item.transaction.toString();

  const selectFilter = (desc, value, db) => {
    setSelectedFilter({
      desc: desc,
      value: value,
      db: db,
    });

    setFilterModalVisible(false);

    console.log('Selected -> ' + desc);
  };

  const onStorage = txid => {
    navigation.navigate('ShowAd', {txid: txid});
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

  const storageRenderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => onStorage(item.transaction)}
      style={styles.storageList}
      activeOpacity={0.9}
      key={item.transaction}>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
        }}>
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
            <Text style={styles.listNormalText}>{item.dateends} 까지</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const storageRoute = () => {
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
        {completedAdsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#343a59" />
            <Text style={[styles.normalText, {color: 'grey'}]}>
              Loading data, please wait...
            </Text>
          </View>
        ) : (
          <FlatList
            data={storageAds}
            keyExtractor={storageKeyExtractor}
            renderItem={storageRenderItem}
          />
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
                  <Text style={styles.normalText}>Newest</Text>
                </Pressable>
                <Pressable
                  onPress={() => selectFilter('Deadline', 1, 'dateleft')}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderBottomColor: '#acb5bb',
                    borderBottomWidth: 1,
                  }}>
                  <Text style={styles.normalText}>Deadline</Text>
                </Pressable>
                <Pressable
                  onPress={() => selectFilter('Coin order', 2, 'amount')}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderBottomColor: '#acb5bb',
                  }}>
                  <Text style={styles.normalText}>Coin order</Text>
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
            Loading data, please wait...
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
    first: storageRoute,
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
          <Text style={styles.title}>Advertising Storage</Text>
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
                  color: '#ffdc04',
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 13,
                }}>
                {isDelete ? 'DELETE ALL' : 'DELETE'}
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
});

export default AdvertiseScreen;
