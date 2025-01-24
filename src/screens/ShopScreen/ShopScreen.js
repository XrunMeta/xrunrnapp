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
  SafeAreaView,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {
  URL_API_NODEJS,
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
  dateFormatter,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import RadioGroup from 'react-native-radio-buttons-group';

const ShopScreen = () => {
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
  // Select floating radio button
  const [selectedId, setSelectedId] = useState('1');

  // Back
  const handleBack = () => {
    navigation.replace('AdvertiseHome');
  };

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        console.log('Dapetin API di awal nih bray');
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

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

  const storageRenderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => onStorage(userData.member, item.advertisement, item.coin)}
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

  const storageRoute = () => {
    return (
      <View style={{flex: 1}}>
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
          </View>
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
    first: () => storageRoute(),
    second: completedRoute,
    third: itemShop,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      // indicatorStyle={{backgroundColor: '#051C60', height: 3}}
      indicatorStyle={{backgroundColor: 'yellow'}}
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
            ? 'Saved'
            : route.key === 'second'
            ? 'Expired'
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
          <ButtonBack onClick={handleBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Item Shop</Text>
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

export default ShopScreen;
