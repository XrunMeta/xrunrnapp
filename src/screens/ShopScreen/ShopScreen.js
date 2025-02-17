import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
  URL_API_NODEJS,
  parseBillingPeriod,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

// Saved Item
import {itemSavedRoutes} from './ItemSaved/ItemSavedRoutes';
import {itemSavedRenderItems} from './ItemSaved/ItemSavedRenderItems';

// Expired Item
import {itemExpiredRoutes} from './ItemExpired/ItemExpiredRoutes';
import {itemExpiredRenderItems} from './ItemExpired/ItemExpiredRenderItems';

// Shop Item
import {itemShopRoutes} from './ItemShop/ItemShopRoutes';
import {itemShopRenderItems} from './ItemShop/ItemShopRenderItems';

// In-App Purchase
import {
  useIAP,
  purchaseUpdatedListener,
  purchaseErrorListener,
  requestPurchase,
  initConnection,
  flushFailedPurchasesCachedAsPendingAndroid,
  getProducts,
  acknowledgePurchaseAndroid,
  getSubscriptions,
  requestSubscription,
} from 'react-native-iap';
import {Picker} from '@react-native-picker/picker';

const ShopScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [userData, setUserData] = useState({});

  // Item Saved
  const [itemSavedData, setItemSavedData] = useState([]);
  const [itemSavedLoading, setItemSavedLoading] = useState(true);

  // Item Expired
  const [itemExpiredData, setItemExpiredData] = useState([]);
  const [itemExpiredLoading, setItemExpiredLoading] = useState(true);

  // Item Shop
  const [itemShopData, setItemShopData] = useState([]);
  const [itemShopLoading, setItemShopLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedChildSubs, setSelectedChildSubs] = useState(bahlul?.[0]);

  // In-App Purchase
  const {connected, products} = useIAP();
  const [connection, setConnection] = useState(false);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [productList, setProductList] = useState([]);
  const itemSkus = [
    'xrunapp.10151_1.transferticket',
    'xrunapp.10152_2.coinpumper',
    'xrunitemtest',
  ];
  const subscriptionSkus = ['xrunapp.1052_3.freeads'];
  const bahlul = [
    {
      subscription: 1,
      itemID: 43,
      sku: 'xrunapp.1052_3.freeads',
      basePlanId: 'xrunapp10523freeads',
      offerToken:
        'AWOstcZLs+2WqXN3tlvyWJbTsvOsbu3BmOt/YlQnMEg2bacD+7XLAbLaTiquPGMUS2AYgS8j6y2IslqHAjCipRpTTJQzFoLMjvlEJHpbWw==',
      recurrenceMode: 3,
      price: '299000000000',
      billingPeriod: 'P3D',
      created: '2025-02-17',
    },
    {
      subscription: 2,
      itemID: 43,
      sku: 'xrunapp.1052_3.freeads',
      basePlanId: 'xrunapp10524freeads',
      offerToken:
        'AWOstcZWfo9rUvbYjdelZD2+WrX75y3iCSi7C78a3iHhhPr5B2f4WO2y4ivTrd3P8JuFhvRxHPbu0pCu32rjhCx3fHTv8oa2leouyKRo1Q==',
      recurrenceMode: 3,
      price: '399000000000',
      billingPeriod: 'P4W',
      created: '2025-02-17',
    },
  ];

  const initializeIAP = async () => {
    try {
      await initConnection().then(async value => {
        setConnection(value);
        if (Platform.OS === 'android') {
          await flushFailedPurchasesCachedAsPendingAndroid();
        }
      });
    } catch (error) {
      console.error('Error initializing IAP: ', error);
    }
  };

  const fetchProductsPlaystore = async () => {
    try {
      const fetchedProducts = await getProducts({skus: itemSkus});

      if (fetchedProducts?.length > 0) {
        // Simpan data produk ke state atau gunakan langsung
        setProductList(fetchedProducts);
        // console.log('Products fetched successfully:', fetchedProducts);
      } else {
        console.log('No products found.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    }
  };

  const fetchSubscriptionsPlaystore = async () => {
    try {
      const fetchedSubs = await getSubscriptions({skus: subscriptionSkus});
      // console.log('Fetched subscriptions:', fetchedSubs);
      // console.log(JSON.stringify(fetchedSubs, null, 2));

      if (fetchedSubs?.length > 0) {
        setSubscriptionList(fetchedSubs[0].subscriptionOfferDetails);
      } else {
        console.log('No subscriptions found.');
      }
    } catch (error) {
      console.log('Error fetching subscriptions:', error);
      Alert.alert('Error', 'Failed to fetch subscriptions');
    }
  };

  // Back
  const handleBack = () => {
    navigation.replace('AdvertiseHome');
  };

  // Click Item
  const handleItemPress = item => {
    setSelectedItem(item); // Simpan item yang dipilih
    setModalVisible(true); // Tampilkan modal
  };

  // Click Buy
  const handleBuyClick = () => {
    setModalVisible(false); // Sembunyikan modal detail
    setAgreementModalVisible(true); // Tampilkan modal agreement
  };

  // Click Agreement
  const handleAgreementBuyClick = async () => {
    if (isAgreed && selectedItem) {
      try {
        const item = itemShopData.find(
          product => product.sku === selectedItem.sku,
        );

        if (!item) {
          Alert.alert('Error', 'Item not found');
          return;
        }

        // Cek apakah item adalah subscription
        if (item.type == 10152) {
          console.log('Anjing -> ' + JSON.stringify(selectedChildSubs));
          // Pastikan selectedChildSubs sudah dipilih
          if (!selectedChildSubs) {
            Alert.alert('Error', 'Please select a subscription plan.');
            return;
          }

          // Ambil offerToken dari selectedChildSubs
          const offerToken = selectedChildSubs.offerToken;

          if (!offerToken) {
            Alert.alert('Error', 'Offer token is missing.');
            return;
          }

          // Request pembelian untuk subscription dengan offerToken
          const purchaseData = await requestSubscription({
            sku: selectedItem.sku,
            subscriptionOffers: [{sku: selectedItem.sku, offerToken}],
          });

          console.log('Purchase Data:', purchaseData);

          // Tampilkan modal sukses
          setPurchaseModalVisible(true);
        } else {
          // Handle pembelian produk biasa (bukan subscription)
          const purchaseData = await requestPurchase({
            skus: [selectedItem.sku],
          });
          console.log('Purchase Data:', purchaseData);

          // Tampilkan modal sukses
          setPurchaseModalVisible(true);
        }
      } catch (error) {
        console.log('Error during purchase:', error);
        Alert.alert('Failed', 'Purchase is failed');
      } finally {
        setAgreementModalVisible(false);
        setIsAgreed(false);
      }
    }
  };

  // Fetch Item Shop Data
  const fetchItemShopData = async () => {
    try {
      const request = await fetch(`${URL_API_NODEJS}/getListItemShop`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
      });
      const response = await request.json();

      if (response.status === 'success' && response.code === 200) {
        const shopData = response.data;

        setItemShopData(shopData);
        setItemShopLoading(false);
      } else {
        console.error('Failed to fetch ItemShop List:', response.message);
      }
    } catch (err) {
      console.error('Error fetching user data: ', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      setIsLoading(false);
    }
  };

  // Fetch Item Shop Data Saved
  const fetchItemShopDataSaved = async member => {
    try {
      const request = await fetch(`${URL_API_NODEJS}/getListItemShopSaved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          member,
        }),
      });
      const response = await request.json();

      if (response.status === 'success' && response.code === 200) {
        const shopSavedData = response.data;

        setItemSavedData(shopSavedData);
        setItemSavedLoading(false);
      } else {
        console.error('Failed to fetch ItemShopSaved List:', response.message);
      }
    } catch (err) {
      console.error('Error fetching user data: ', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      setIsLoading(false);
    }
  };

  // Fetch Item Shop Data Expired
  const fetchItemShopDataExpired = async member => {
    try {
      const request = await fetch(`${URL_API_NODEJS}/getListItemShopExpired`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          member,
        }),
      });
      const response = await request.json();

      if (response.status === 'success' && response.code === 200) {
        const shopExpData = response.data;

        setItemExpiredData(shopExpData);
        setItemExpiredLoading(false);
      } else {
        console.error(
          'Failed to fetch ItemShopExpired List:',
          response.message,
        );
      }
    } catch (err) {
      console.error('Error fetching user data: ', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get Language
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        // Get User Data
        const userData = await AsyncStorage.getItem('userData');
        const getData = JSON.parse(userData);
        setUserData(getData);

        // Item Saved
        fetchItemShopDataSaved(getData.member);

        // Item Expired
        fetchItemShopDataExpired(getData.member);

        // Item Shop
        fetchItemShopData();
      } catch (err) {
        console.error('Error retrieving data from AsyncStorage:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        navigation.replace('Home');
      }
    };

    initializeIAP();
    fetchData();
  }, []);

  useEffect(() => {
    if (connection) {
      console.log('IAP connected successfully.');
      fetchProductsPlaystore();
      fetchSubscriptionsPlaystore();
    } else {
      console.log('IAP connection failed.');
    }

    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async purchase => {
        console.log('Purchase Success:', purchase);

        // Acknowledge purchase for Android
        if (Platform.OS === 'android' && !purchase?.isAcknowledgedAndroid) {
          if (purchase?.purchaseToken && purchase?.purchaseStateAndroid === 0) {
            try {
              await acknowledgePurchaseAndroid(purchase.purchaseToken);

              // Setelah acknowledged, kita harus menyelesaikan transaksi
              await finishTransaction({purchase, isConsumable: false});
            } catch (error) {
              console.error('Error acknowledging purchase: ', error);
            }
          } else {
            console.log(
              `Purchase token is null or state is not valid for ${purchase.productId}`,
            );
          }
        }
      },
    );

    const purchaseErrorSubscription = purchaseErrorListener(error => {
      console.log('Purchase Error:', error);
      Alert.alert('Purchase Failed', error.message);
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, [connection]);

  useEffect(() => {
    setRoutes([
      {
        key: 'first',
        title: lang?.screen_shop?.tab_saved ?? 'Saved',
      },
      {
        key: 'second',
        title: lang?.screen_shop?.tab_expired ?? 'Expired',
      },
      {
        key: 'third',
        title: lang?.screen_shop?.tab_shop ?? 'Item Shop',
      },
    ]);
  }, [lang]);

  const renderScene = SceneMap({
    first: () =>
      itemSavedRoutes(
        lang,
        styles,
        itemSavedLoading,
        itemSavedData,
        item => item.id.toString(),
        ({item, styles, onPress}) =>
          itemSavedRenderItems({
            item,
            styles,
            onPress: () => handleItemPress(item),
          }),
      ),
    second: () =>
      itemExpiredRoutes(
        lang,
        styles,
        itemExpiredLoading,
        itemExpiredData,
        item => item.id.toString(),
        ({item, styles, onPress}) =>
          itemExpiredRenderItems({
            item,
            styles,
            onPress: () => handleItemPress(item),
          }),
      ),
    third: () =>
      itemShopRoutes(
        lang,
        styles,
        itemShopLoading,
        itemShopData,
        item => item.id.toString(),
        ({item, styles, onPress}) =>
          itemShopRenderItems({
            item,
            styles,
            onPress: () => handleItemPress(item),
          }),
      ),
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: '#ffdc04', height: '100%'}}
      style={{backgroundColor: 'white'}}
      renderLabel={({route, focused}) => (
        <Text
          style={{
            color: focused ? 'black' : 'grey',
            fontFamily: focused
              ? getFontFam() + 'Medium'
              : getFontFam() + 'Regular',
            fontSize: fontSize('body'),
            textAlign: 'center',
          }}>
          {route.title}
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
          <Text style={styles.title}>
            {lang?.screen_shop?.title ?? 'Item Shop'}
          </Text>
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

      {/* Modal Detail */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setIsAgreed(false);
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(false);
            setIsAgreed(false);
          }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 5,
                  }}
                  onPress={() => {
                    setModalVisible(false);
                    setIsAgreed(false);
                  }}>
                  <Image
                    source={require('../../../assets/images/icon_close.png')}
                    resizeMode="contain"
                    style={{height: 20}}
                  />
                </TouchableOpacity>

                {/* Modal Header */}
                <View style={styles.modalItem}>
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
                      source={
                        selectedItem?.icon_blob
                          ? {
                              uri: `data:image/png;base64,${selectedItem?.icon_blob.replace(
                                /(\r\n|\n|\r)/gm,
                                '',
                              )}`,
                            }
                          : require('../../../assets/images/logo_xrun.png')
                      }
                      resizeMode="contain"
                      style={{height: 25, width: 25}}
                    />
                  </View>
                  <View style={{justifyContent: 'center'}}>
                    <Text style={[styles.normalText, {color: 'grey'}]}>
                      {selectedItem?.name}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        {marginTop: 0, fontWeight: 'bold'},
                      ]}>
                      ${selectedItem?.price} / {selectedItem?.unit}
                    </Text>
                  </View>
                </View>

                {/* Modal Desc */}
                <ScrollView style={styles.modalDescription}>
                  <Text style={[styles.normalText, {color: 'grey'}]}>
                    {selectedItem?.description}
                  </Text>
                </ScrollView>

                {/* Modal Buy Button */}
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 15,
                    alignItems: 'flex-end',
                    alignSelf: 'flex-end',
                  }}>
                  {selectedItem?.type == 10152 && (
                    <View
                      style={{
                        backgroundColor: '#e5e5e56e',
                        borderRadius: 50,
                        overflow: 'hidden',
                        height: 35,
                        flex: 1,
                        justifyContent: 'center',
                        alignSelf: 'flex-end',
                      }}>
                      <Picker
                        selectedValue={selectedChildSubs}
                        onValueChange={itemValue =>
                          setSelectedChildSubs(itemValue)
                        }
                        style={{
                          height: 35,
                          color: 'black',
                        }}>
                        {bahlul.map(item => (
                          <Picker.Item
                            key={item.subscription}
                            label={`${parseBillingPeriod(
                              item.billingPeriod,
                            )} - ${item.price}`}
                            value={item}
                            style={styles.normalText}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleBuyClick}>
                    <Text style={[styles.normalText, styles.closeButtonText]}>
                      {selectedItem?.type == 10151
                        ? `$ ${selectedItem?.price}`
                        : 'Buy'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Agreement */}
      <Modal
        transparent={true}
        visible={agreementModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setAgreementModalVisible(false);
          setIsAgreed(false);
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setAgreementModalVisible(false);
            setIsAgreed(false);
          }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 5,
                  }}
                  onPress={() => {
                    setAgreementModalVisible(false);
                    setIsAgreed(false);
                  }}>
                  <Image
                    source={require('../../../assets/images/icon_close.png')}
                    resizeMode="contain"
                    style={{height: 20}}
                  />
                </TouchableOpacity>

                {/* Modal Header */}
                <View
                  style={[
                    styles.modalItem,
                    {
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}>
                  <Text style={[styles.normalText, {fontWeight: 'bold'}]}>
                    {lang?.screen_shop?.title ?? 'Item Shop'} -{' '}
                    {lang?.screen_shop?.modal.toc_title ??
                      'Terms and Conditions'}
                  </Text>
                </View>

                {/* Modal Desc */}
                <ScrollView style={styles.modalDescription}>
                  <Text style={[styles.normalText, {color: 'grey'}]}>
                    {itemShopData[0]?.description}
                    {selectedItem?.terms[0].termsDetail}
                  </Text>
                </ScrollView>

                {/* Agreement Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setIsAgreed(!isAgreed)}>
                  <View
                    style={[
                      styles.checkbox,
                      isAgreed ? styles.checkedBox : styles.uncheckedBox,
                    ]}>
                    {isAgreed && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.normalText]}>
                    {lang?.screen_shop?.modal.toc_checkbox ??
                      'I agree to the terms and conditions'}
                  </Text>
                </TouchableOpacity>

                {/* Modal Buy Button */}
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    !isAgreed && styles.disabledButton,
                    {alignSelf: 'center'},
                  ]}
                  onPress={handleAgreementBuyClick}
                  disabled={!isAgreed}>
                  <Text style={[styles.normalText, styles.closeButtonText]}>
                    ${selectedItem?.price}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal After Purchase */}
      <Modal
        transparent={true}
        visible={purchaseModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setPurchaseModalVisible(false);
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setPurchaseModalVisible(false);
          }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Image
                  source={require('../../../assets/images/icon_success.png')}
                  resizeMode="contain"
                  style={{height: 80, width: 80, marginBottom: 20}}
                />

                {/* Modal Header */}
                <View
                  style={[
                    styles.modalItem,
                    {
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}>
                  <Text style={[styles.normalText, {fontWeight: 'bold'}]}>
                    {lang?.screen_shop?.modal?.pur_success ??
                      'Purchase is success'}
                  </Text>
                </View>

                {/* Modal Desc */}
                <View
                  style={{
                    marginTop: -5,
                    minHeight: 30,
                    maxHeight: 50,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={[styles.normalText, {color: 'grey'}]}>
                    {lang?.screen_shop?.modal?.pur_desc ??
                      'Do you want to continue purchasing?'}
                  </Text>
                </View>

                {/* Modal Button */}
                <View style={{display: 'flex', flexDirection: 'row', gap: 20}}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginTop: 15,
                      padding: 10,
                      backgroundColor: 'lightgrey',
                      borderRadius: 50,
                      alignItems: 'center',
                      alignSelf: 'center',
                    }}
                    onPress={() => {
                      setIndex(0);
                      setPurchaseModalVisible(false);
                    }}>
                    <Text style={[styles.normalText, styles.closeButtonText]}>
                      No
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginTop: 15,
                      padding: 10,
                      backgroundColor: '#ffdc04',
                      borderRadius: 50,
                      alignItems: 'center',
                      alignSelf: 'center',
                    }}
                    onPress={() => {
                      setPurchaseModalVisible(false);
                    }}>
                    <Text style={[styles.normalText, styles.closeButtonText]}>
                      Yes
                    </Text>
                  </TouchableOpacity>
                </View>
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
    alignItems: 'center',
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
  modalOverlay: {
    backgroundColor: '#000000c9',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalItem: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: 10,
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
    minHeight: 150,
    maxHeight: 300,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#ffdc04',
    borderRadius: 50,
    minWidth: 70,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
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
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: -1,
  },
  disabledButton: {
    backgroundColor: 'lightgrey',
  },
});

export default ShopScreen;
