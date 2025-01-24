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
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
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

const ShopScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});
  const [completedAds, setCompletedAds] = useState([]);
  const [completedAdsLoading, setCompletedAdsLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);
  const [savedItemsLoading, setSavedItemsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const layout = useWindowDimensions();
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

  // Back
  const handleBack = () => {
    navigation.replace('AdvertiseHome');
  };

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

          const items = [
            {
              transaction: '1',
              title: 'Transfer Ticket',
              price: '$5 / transfer',
              description:
                'This is a detailed description of the Transfer Ticket.',
            },
            {
              transaction: '2',
              title: 'Coin Pumper',
              price: '$15 / 30days',
              description: 'This is a detailed description of coin pumper.',
            },
          ];

          // setCompletedAds(filteredAds);
          setCompletedAds(items);

          fetchAdsData('datetime', getData.member);
        }

        setCompletedAdsLoading(false);
        setSavedItemsLoading(false);
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
  const savedItemsKeyExtractor = (item, index) => item.transaction.toString();

  const fetchAdsData = async (orderField, member) => {
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
        setSavedItems(data.data);
      }

      setSavedItemsLoading(false);
    } catch (err) {
      console.error('Error fetching ads data:', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      navigation.replace('Home');
    }
  };

  const onSavedItems = (memberID, advertisement, coin) => {
    navigation.replace('ShowAd', {
      screenName: 'AdvertiseHome',
      member: memberID,
      advertisement: advertisement,
      coin: coin,
      coinScreen: false,
    });
  };

  // const completedRenderItem = ({item}) => (
  //   <View
  //     style={[styles.list, {display: 'flex', flexDirection: 'row', gap: 10}]}
  //     key={item.transaction}>
  //     <View
  //       style={{
  //         borderColor: '#d9d9d9',
  //         borderWidth: 1,
  //         borderRadius: 5,
  //         height: 50,
  //         width: 50,
  //         alignItems: 'center',
  //         justifyContent: 'center',
  //       }}>
  //       <Image
  //         source={require('../../../assets/images/logo_xrun.png')}
  //         resizeMode="contain"
  //         style={{height: 25}}
  //       />
  //     </View>
  //     <View
  //       style={{
  //         flexDirection: 'column',
  //         justifyContent: 'center',
  //       }}>
  //       <Text
  //         style={[styles.normalText, {color: 'grey'}]}
  //         ellipsizeMode="tail"
  //         numberOfLines={1}>
  //         Transfer Ticket
  //       </Text>
  //       <Text style={[styles.normalText, {marginTop: 0, fontWeight: 'bold'}]}>
  //         $5 / transfer
  //       </Text>
  //     </View>
  //   </View>
  // );

  const completedRenderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedItem(item); // Simpan item yang dipilih
        setModalVisible(true); // Tampilkan modal
      }}
      style={[styles.list, {display: 'flex', flexDirection: 'row', gap: 10}]}
      key={item.transaction}>
      <View
        style={{
          borderColor: '#d9d9d9',
          borderWidth: 1,
          borderRadius: 5,
          height: 50,
          width: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={require('../../../assets/images/logo_xrun.png')}
          resizeMode="contain"
          style={{height: 25}}
        />
      </View>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Text
          style={[styles.normalText, {color: 'grey'}]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.normalText, {marginTop: 0, fontWeight: 'bold'}]}>
          $5 / transfer
        </Text>
      </View>
    </TouchableOpacity>
  );

  const savedRenderItem = ({item}) => (
    <TouchableOpacity
      onPress={() =>
        onSavedItems(userData.member, item.advertisement, item.coin)
      }
      style={styles.savedItemsList}
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

  const savedItemsRoute = () => {
    return (
      <View style={{flex: 1}}>
        {/* List Saved Items */}
        {savedItemsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#343a59" />
            <Text style={[styles.normalText, {color: 'grey'}]}>
              {lang && lang.screen_advertise && lang.screen_advertise.loading
                ? lang.screen_advertise.loading
                : ''}
            </Text>
          </View>
        ) : savedItems.length === 0 ? (
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
              data={savedItems}
              keyExtractor={savedItemsKeyExtractor}
              renderItem={savedRenderItem}
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
    first: () => savedItemsRoute(),
    second: completedRoute,
    third: itemShop,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: '#ffdc04', height: '100%'}}
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

      {/* Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View
                  style={{
                    borderColor: '#d9d9d9',
                    borderWidth: 1,
                    borderRadius: 5,
                    height: 50,
                    width: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={require('../../../assets/images/logo_xrun.png')}
                    resizeMode="contain"
                    style={{height: 25}}
                  />
                </View>
                <View style={{marginTop: 10}}>
                  <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
                  <Text style={styles.modalPrice}>{selectedItem?.price}</Text>
                </View>
                <ScrollView style={styles.modalDescription}>
                  <Text>{selectedItem?.description}</Text>
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    flexDirection: 'column',
  },
  savedItemsList: {
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
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalPrice: {
    fontSize: 16,
    marginVertical: 5,
    color: 'grey',
  },
  modalDescription: {
    marginTop: 10,
    maxHeight: 100,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#051C60',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ShopScreen;
