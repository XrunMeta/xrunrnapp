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
import FilterModal from './FilterModal';
import WebSocketInstance from '../../../utils/websocketUtils';
import crashlytics from '@react-native-firebase/crashlytics';
import {dateFormatter} from '../../../utils';

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
  const {currID, symbol, name, amount, icon, bgColor, publicAddress} =
    route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  // Filter states
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDays, setSelectedDays] = useState('7');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // WebSocket actions
  const act = {
    totalHistory: 'app4200-05',
    transferHistory: 'app4200-06',
    receivedDetails: 'app4200-01',
    transitionHistory: 'app4200-03',
  };

  // Add WebSocket listeners
  useEffect(() => {
    const listeners = [
      {
        type: 'app4200-05-response',
        callback: data => {
          if (data.data) {
            setTransactions(data.data);
            applyFilters(data.data);
            setIsLoading(false);
          }
        },
      },
      {
        type: 'app4200-06-response',
        callback: data => {
          if (data.data) {
            setTransactions(data.data);
            applyFilters(data.data);
            setIsLoading(false);
          }
        },
      },
      {
        type: 'app4200-01-response',
        callback: data => {
          if (data.data) {
            setTransactions(data.data);
            applyFilters(data.data);
            setIsLoading(false);
          }
        },
      },
      {
        type: 'app4200-03-response',
        callback: data => {
          if (data.data) {
            setTransactions(data.data);
            applyFilters(data.data);
            setIsLoading(false);
          }
        },
      },
    ];

    listeners.forEach(({type, callback}) =>
      WebSocketInstance.addListener(type, callback),
    );

    return () => {
      listeners.forEach(({type}) => WebSocketInstance.removeListener(type));
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchTransactions();
  }, [currID]);

  const fetchTransactions = () => {
    setIsLoading(true);
    try {
      WebSocketInstance.sendMessage(act.totalHistory, {
        member: 1342, // Replace with actual user ID
        currency: currID,
        daysbefore: parseInt(selectedDays),
        startwith: 0,
      });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      setIsLoading(false);
    }
  };

  const setSelectedTypeStable = useCallback(
    type => {
      setSelectedType(type);
      applyFilters();
    },
    [transactions],
  );

  const setSelectedDaysStable = useCallback(days => {
    setSelectedDays(days);
    fetchTransactions();
  }, []);

  const onCloseStable = useCallback(() => {
    setModalVisible(false);
  }, []);

  const onConfirmStable = useCallback(() => {
    setModalVisible(false);
    applyFilters();
  }, [transactions]);

  // Fungsi untuk apply filter
  const applyFilters = (txnData = transactions) => {
    let result = txnData.filter(txn => txn.currency === currID);

    // Filter by type if not 'All'
    if (selectedType !== 'All') {
      result = result.filter(txn => {
        // Map your action codes to types
        const actionType = getActionType(txn.action);
        return actionType === selectedType.toLowerCase();
      });
    }

    // Filter by days
    const days = parseInt(selectedDays);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    result = result.filter(txn => {
      const txnDate = new Date(txn.excuteddatetime || txn.date);
      return txnDate >= cutoffDate;
    });

    // Format for UI
    const formatted = result.map(txn => ({
      id: txn.id || `${txn.excuteddatetime}_${txn.amount}`,
      symbol: symbol,
      type: getActionType(txn.action),
      amount: txn.amount,
      date: dateFormatter(txn.excuteddatetime),
      ...txn, // Keep original data for detail view
    }));

    setFilteredTransactions(formatted);
  };

  // Helper to map action codes to types
  const getActionType = actionCode => {
    switch (actionCode) {
      case 3304:
        return 'transfer';
      case 3651:
        return 'deposit';
      case 3305:
        return 'withdrawal';
      case 3306:
        return 'exchange';
      case 3307:
        return 'received';
      case 3308:
        return 'sent';
      default:
        return 'other';
    }
  };

  // Panggil applyFilters saat komponen mount atau filter berubah
  useEffect(() => {
    applyFilters();
  }, [selectedType, selectedDays, currID]);

  // Handle star icon click
  const handleAddToken = () => {
    setModalVisible(true);
  };

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

    const handlePress = item => {
      navigation.navigate('TransactionDetail', {
        transactionData: item, // Pass full transaction data
        symbol: symbol,
        currencyId: currID,
      });
    };

    return (
      <TouchableOpacity
        onPress={() => handlePress(item)}
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
            refreshing={isLoading}
            onRefresh={fetchTransactions}
          />
        )}
      </View>

      <FilterModal
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
});

export default WalletDetailScreen;
