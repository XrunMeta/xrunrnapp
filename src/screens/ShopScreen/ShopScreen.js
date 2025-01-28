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
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import {itemShopRoutes} from './ItemShop/ItemShopRoutes';
import {itemShopRenderItems} from './ItemShop/ItemShopRenderItems';
import dataShop from './ItemShop/dataShop.json';

const ShopScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [index, setIndex] = useState(0);
  const [userData, setUserData] = useState({});
  const [itemShopData, setItemShopData] = useState([]);
  const [itemShopLoading, setItemShopLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const layout = useWindowDimensions();
  const [routes] = useState([
    {key: 'first', title: 'Saved'},
    {key: 'second', title: 'Expired'},
    {key: 'third', title: 'Item Shop'},
  ]);

  // Back
  const handleBack = () => {
    navigation.replace('AdvertiseHome');
  };

  const handleBuyClick = () => {
    setModalVisible(false); // Sembunyikan modal detail
    setAgreementModalVisible(true); // Tampilkan modal agreement
  };

  const handleAgreementBuyClick = () => {
    if (isAgreed) {
      // Logic untuk proses pembelian
      console.log('Item purchased');
      setAgreementModalVisible(false); // Sembunyikan modal agreement setelah pembelian
      setIsAgreed(false);
    }
  };

  const handleItemPress = item => {
    console.log({item});
    setSelectedItem(item); // Simpan item yang dipilih
    setModalVisible(true); // Tampilkan modal
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

        // Item Shop
        setItemShopData(dataShop);
        setItemShopLoading(false);
      } catch (err) {
        console.error('Error retrieving data from AsyncStorage:', err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        navigation.replace('Home');
      }
    };

    fetchData();
  }, []);

  const renderScene = SceneMap({
    first: () => <Text>Saved Tab</Text>,
    second: () => <Text>Expired Tab</Text>,
    third: () =>
      itemShopRoutes(
        lang,
        styles,
        itemShopLoading,
        itemShopData,
        item => item.transaction.toString(),
        ({item, styles, onPress}) =>
          itemShopRenderItems({
            item, // Mengirimkan data item, termasuk 'icon' untuk gambar
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
                      source={{uri: selectedItem?.icon}}
                      resizeMode="contain"
                      style={{height: 25, width: 25}}
                    />
                  </View>
                  <View style={{justifyContent: 'center'}}>
                    <Text style={[styles.normalText, {color: 'grey'}]}>
                      {selectedItem?.title}
                    </Text>
                    <Text
                      style={[
                        styles.normalText,
                        {marginTop: 0, fontWeight: 'bold'},
                      ]}>
                      {selectedItem?.price}
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
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleBuyClick}>
                  <Text style={[styles.normalText, styles.closeButtonText]}>
                    $5
                  </Text>
                </TouchableOpacity>
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
                    Item Shop - Terms and Conditions
                  </Text>
                </View>

                {/* Modal Desc */}
                <ScrollView style={styles.modalDescription}>
                  <Text style={[styles.normalText, {color: 'grey'}]}>
                    {itemShopData[0]?.description}
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
                    I agree to the terms and conditions
                  </Text>
                </TouchableOpacity>

                {/* Modal Buy Button */}
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    !isAgreed && styles.disabledButton,
                    ,
                    {alignSelf: 'center'},
                  ]}
                  onPress={handleAgreementBuyClick}
                  disabled={!isAgreed}>
                  <Text style={[styles.normalText, styles.closeButtonText]}>
                    $5
                  </Text>
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
