import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  Dimensions,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {fontSize, getFontFam} from '../../../utils';
import ButtonBack from '../../components/ButtonBack';
import {dummyTransactions} from './dummyTX';

const screenWidth = Dimensions.get('window').width;

// Dynamic text truncation based on screen width
let front = 6;
let back = 4;

if (screenWidth < 350) {
  front = 6;
  back = 4;
} else if (screenWidth < 400) {
  front = 10;
  back = 8;
} else if (screenWidth < 500) {
  front = 14;
  back = 12;
} else {
  front = 16;
  back = 14;
}

const walletBackgrounds = {
  1: require('./../../../assets/images/bg_walletCard_xrun.png'),
  2: require('./../../../assets/images/bg_walletCard_polygon.png'),
  3: require('./../../../assets/images/bg_walletCard_realverse.png'),
  4: require('./../../../assets/images/bg_walletCard_nft1.png'),
  5: require('./../../../assets/images/bg_walletCard_nft2.png'),
  6: require('./../../../assets/images/bg_walletCard_adxrun.png'),
};

// Helper function to shorten address
const shortenAddress = (address, frontChars, backChars) => {
  if (!address || address.length < frontChars + backChars + 3) {
    return address || '-';
  }
  return `${address.substring(0, frontChars)}...${address.substring(
    address.length - backChars,
  )}`;
};

const WalletDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {currID, symbol, name, amount, icon, bgColor} = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [publicAddress, setPublicAddress] = useState(
    '0x1AB3A2FD697390B269ABCD49CB660C54292C2FCB',
  );

  // State for filter selections
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDays, setSelectedDays] = useState('7 Days');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);

  const setSelectedTypeStable = useCallback(type => {
    setSelectedType(type);
  }, []);

  const setSelectedDaysStable = useCallback(days => {
    setSelectedDays(days);
  }, []);

  const onCloseStable = useCallback(() => {
    setModalVisible(false);
  }, []);

  const onConfirmStable = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Fungsi untuk apply filter
  const applyFilters = () => {
    let result = dummyTransactions.filter(txn => txn.assetId === currID);

    // Filter by type
    if (selectedType !== 'All') {
      result = result.filter(txn => txn.type === selectedType.toLowerCase());
    }

    // Filter by date
    const days = parseInt(selectedDays);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    result = result.filter(txn => {
      const txnDate = new Date(txn.date.replace(/\./g, '-').replace(' ', 'T'));
      return txnDate >= cutoffDate;
    });

    setFilteredTransactions(result);
  };

  // Panggil applyFilters saat komponen mount atau filter berubah
  useEffect(() => {
    applyFilters();
  }, [selectedType, selectedDays, currID]);

  // Handle star icon click
  const handleAddToken = () => {
    setModalVisible(true);
  };

  // Modal component
  const AddTokenModal = React.memo(
    ({
      visible,
      onClose,
      selectedType,
      setSelectedType,
      selectedDays,
      setSelectedDays,
      onConfirm,
    }) => {
      // Handle type selection
      const handleTypeSelect = type => {
        setSelectedType(type);
      };

      // Handle days selection
      const handleDaysSelect = days => {
        setSelectedDays(days);
      };

      // Reset filters to default
      const handleReset = () => {
        setSelectedType('All');
        setSelectedDays('7 Days');
      };

      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={visible}
          onRequestClose={onClose}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={onClose}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.modalContent}
                onPress={e => e.stopPropagation()}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filter Transactions</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Image
                      source={require('./../../../assets/images/icon_close.png')}
                      style={styles.closeIcon}
                    />
                  </TouchableOpacity>
                </View>

                {/* Type Selection Row */}
                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Type</Text>
                  <View style={styles.buttonGroup}>
                    {['All', 'Send', 'Receive'].map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterButton,
                          selectedType === type && styles.selectedFilterButton,
                        ]}
                        onPress={() => handleTypeSelect(type)}>
                        <Text
                          style={[
                            styles.filterButtonText,
                            selectedType === type &&
                              styles.selectedFilterButtonText,
                          ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Days Selection Row */}
                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>History</Text>
                  <View style={styles.buttonGroup}>
                    {['7 Days', '14 Days', '30 Days'].map(days => (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.filterButton,
                          selectedDays === days && styles.selectedFilterButton,
                        ]}
                        onPress={() => handleDaysSelect(days)}>
                        <Text
                          style={[
                            styles.filterButtonText,
                            selectedDays === days &&
                              styles.selectedFilterButtonText,
                          ]}>
                          {days}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleReset}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={onConfirm}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      );
    },
  );

  const onBack = () => {
    navigation.navigate('WalletHome');
  };

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyAddress = () => {
    Clipboard.setString(publicAddress);
    console.log('Address copied to clipboard');
  };

  const handleReceive = () => {
    navigation.navigate('Receive', {
      publicAddress,
    });
  };

  const handleSend = () => {
    navigation.navigate('Sending', {
      symbol: 'POL',
      fromAddress: publicAddress,
      name: 'Polygon',
      icon: require('./../../../assets/images/icon_xrun_white.png'),
      contractAddress: 'dummy-contract-address',
    });
  };

  const handlePolygonscan = () => {
    Linking.openURL(`https://polygonscan.com/address/${publicAddress}`);
  };

  const renderCryptoItem = ({item}) => {
    // Function to determine icon color based on crypto symbol
    const getIconColor = symbol => {
      switch (symbol) {
        case 'XRUN':
          return '#000000'; // atau '#5F59E0' kalau kamu prefer default
        case 'POL':
          return '#8347E6';
        case 'REALVERSE':
          return '#000000'; // warna coklat keemasan
        case 'NFT #8282':
        case 'NFT #8283':
        case 'AD XRUN':
          return '#1C1C1E'; // hitam doff
        default:
          return '#5F59E0';
      }
    };

    const handlePress = () => {
      navigation.navigate('DetailToken', {
        currID: item.id,
        symbol: item.symbol,
        name: item.name,
        icon: item.icon,
        bgColor: getIconColor(item.symbol),
      });
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={{
          backgroundColor: 'white',
          paddingHorizontal: 12,
          paddingVertical: 15,
          marginHorizontal: 8,
          borderRadius: 15,
          marginVertical: 6,
          ...styles.shadow,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View
              style={[
                styles.cryptoIcon,
                {backgroundColor: getIconColor(item.symbol), marginRight: 12},
              ]}>
              <Image
                source={item.icon}
                style={styles.cryptoIconImage}
                resizeMode="contain"
              />
            </View>

            <View style={{}}>
              <Text
                style={{
                  fontSize: fontSize('subtitle'),
                  fontWeight: '500',
                  color: 'black',
                }}>
                {item.symbol}
              </Text>
              <Text
                style={{
                  fontSize: fontSize('body'),
                  color: '#B8B8B8',
                  textTransform: 'capitalize',
                }}>
                {item.type}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
            <Text style={{fontSize: fontSize('body'), color: '#B8B8B8'}}>
              {item.date}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: 'black',
              }}>
              {/* {formatCustom(item.amount)} {item.symbol} */}
              {item.amount} {item.symbol}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FAFAFA" barStyle="dark-content" />

      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{name}</Text>
        </View>
      </View>

      {/* Card Wrapper */}
      <View style={styles.walletCardContainer}>
        <View style={styles.walletCard}>
          {/* Card Content */}
          <View
            style={{
              padding: 16,
              position: 'relative',
            }}>
            <Image
              source={walletBackgrounds[currID]}
              style={{
                position: 'absolute',
                right: 0,
                left: 0,
                width: 'auto',
                zIndex: 1,
                borderRadius: 18,
              }}
            />
            <View
              style={{
                zIndex: 1,
                paddingLeft: 10,
              }}>
              <View style={styles.walletAddressContainer}>
                <Text style={styles.walletLabel}>My Balance</Text>
                <TouchableOpacity
                  onPress={handleCopyAddress}
                  style={styles.copyButton}>
                  <Image
                    source={require('./../../../assets/images/icon_copy_white.png')}
                    style={styles.copyIcon}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 28,
                  fontWeight: 'bold',
                  marginTop: -5,
                }}>
                {amount} {symbol}
              </Text>
              <Text style={styles.walletAddress}>
                {shortenAddress(publicAddress, front, back)}
              </Text>
            </View>
          </View>

          {/* Card Action */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={handlePolygonscan}
              style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Image
                  source={require('./../../../assets/images/icon_walletscan.png')}
                  style={styles.actionIcon}
                />
              </View>
              <Text style={styles.actionText}>Polygonscan</Text>
            </TouchableOpacity>

            <View
              style={{
                height: 'auto',
                width: 0.5,
                borderRadius: 50,
                backgroundColor: '#D8D8D8',
              }}
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReceive}>
              <View style={styles.actionIconContainer}>
                <Image
                  source={require('./../../../assets/images/icon_walletreceive.png')}
                  style={styles.actionIcon}
                />
              </View>
              <Text style={styles.actionText}>Receive</Text>
            </TouchableOpacity>

            <View
              style={{
                height: 'auto',
                width: 0.4,
                borderRadius: 50,
                backgroundColor: '#D8D8D8',
              }}
            />

            <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
              <View style={styles.actionIconContainer}>
                <Image
                  source={require('./../../../assets/images/icon_walletsend.png')}
                  style={[styles.actionIcon, {marginTop: -3, marginRight: -3}]}
                />
              </View>
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Currency Wrapper */}
      <View style={styles.assetsContainer}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.assetsTitle}>History</Text>
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
            onPress={handleAddToken}>
            <Image
              source={require('./../../../assets/images/icon_setting.png')}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading assets...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderCryptoItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cryptoList}
          />
        )}
      </View>

      <AddTokenModal
        visible={modalVisible}
        onClose={onCloseStable}
        selectedType={selectedType}
        setSelectedType={setSelectedTypeStable}
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDaysStable}
        onConfirm={onConfirmStable}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  shadow: {
    shadowColor: '#00000050',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.51,
    elevation: 6,
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
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
    // color: '#051C60',
    color: 'black',
    margin: 10,
  },
  header: {
    padding: 16,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 37,
    width: 111,
    objectFit: 'contain',
  },
  walletCardContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  walletCard: {
    borderRadius: 16,
    marginBottom: 1,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    height: 24,
    width: 24,
  },
  actionIcon: {
    height: 28,
    width: 28,
  },
  walletAddress: {
    color: '#fff',
    fontSize: fontSize('body'),
    marginBottom: -10,
  },
  actionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginHorizontal: 25,
    zIndex: 1,

    shadowColor: '#999',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    height: 30,
    width: 30,
  },
  actionText: {
    fontSize: fontSize('body'),
    color: '#333',
  },
  assetsContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    marginTop: 10,
  },
  assetsTitle: {
    fontSize: fontSize('subtitle'),
    fontWeight: '700',
    marginBottom: 10,
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoList: {
    paddingBottom: 16,
  },
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  cryptoIconContainer: {
    marginRight: 12,
  },
  cryptoIconImage: {
    width: 24,
    height: 24,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  cryptoName: {
    fontSize: 12,
    color: '#B8B8B8',
  },
  cryptoAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  selectedFilterButton: {
    backgroundColor: '#5F59E0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedFilterButtonText: {
    color: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#5F59E0',
    alignItems: 'center',
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
    textAlign: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  tabButton: {
    paddingVertical: 10,
    flex: 1,
    borderBottomWidth: 5,
    borderBottomColor: '#DEDEDE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 5,
    borderBottomColor: '#FFDC04',
  },
  tabText: {
    fontSize: 16,
    color: '#B8B8B8',
  },
  activeTabText: {
    color: 'black',
    fontWeight: 'bold',
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabContent: {
    minHeight: 200,
  },
  tokenItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    gap: 15,
  },
  selectedToken: {
    backgroundColor: '#F5F5FF',
  },
  tokenSymbol: {
    fontSize: fontSize('subtitle'),
    color: 'black',
  },
  inputLabel: {
    fontSize: 14,
    color: '#B8B8B8',
    marginBottom: 5,
  },
  input: {
    borderColor: '#FAFAFA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: fontSize('subtitle'),
  },
  nextButton: {
    backgroundColor: '#FFDC04',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    marginTop: 40,
    width: 150,
    marginHorizontal: 'auto',
    alignSelf: 'center',
  },
  nextButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: fontSize('subtitle'),
  },
  confirmRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  confirmLabel: {
    fontSize: fontSize('subtitle'),
    color: '#B8B8B8',
  },
  confirmValue: {
    fontSize: fontSize('subtitle'),
    color: 'black',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#5F59E0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  addButtonText: {
    color: 'black',
    fontSize: fontSize('subtitle'),
    fontWeight: 'bold',
  },
});

export default WalletDetailScreen;
