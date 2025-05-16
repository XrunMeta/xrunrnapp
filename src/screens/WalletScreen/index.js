import React, {useState, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {fontSize, getFontFam} from '../../../utils';
import ButtonBack from '../../components/ButtonBack';

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

// Helper function to shorten address
const shortenAddress = (address, frontChars, backChars) => {
  if (!address || address.length < frontChars + backChars + 3) {
    return address || '-';
  }
  return `${address.substring(0, frontChars)}...${address.substring(
    address.length - backChars,
  )}`;
};

const WalletScreen = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isPopupShow, setIsPopupShow] = useState(false);
  const [publicAddress, setPublicAddress] = useState(
    '0x1AB3A2FD697390B269ABCD49CB660C54292C2FCB',
  );
  const [cryptoAssets, setCryptoAssets] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Token'); // 'Token' or 'Contract'
  const [contractAddress, setContractAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);

  // Handle star icon click
  const handleAddToken = () => {
    setModalVisible(true);
    resetModalState();
  };

  // Reset modal state
  const resetModalState = () => {
    setActiveTab('Token');
    setContractAddress('');
    setTokenName('');
    setTokenSymbol('');
    setTokenDecimals('');
    setSelectedToken(null);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    resetModalState();
  };

  // Handle token selection
  const handleTokenSelect = token => {
    setSelectedToken(token);
    setActiveTab('Contract');
  };

  // Handle next button in Token tab
  const handleTokenNext = () => {
    if (selectedToken) {
      setActiveTab('Contract');
    }
  };

  // Handle next button in Contract tab
  const handleContractNext = () => {
    if (contractAddress) {
      // Here you would typically validate the contract address
      // For demo purposes, we'll just show the confirmation
      setActiveTab('Confirm');
    }
  };

  // Handle add token confirmation
  const handleAddTokenConfirm = () => {
    // Here you would typically add the token to the wallet
    console.log('Adding token:', {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      contractAddress,
    });
    closeModal();
  };

  // Predefined tokens for Token tab
  const predefinedTokens = [
    {symbol: 'POL', name: 'Polygon'},
    {symbol: 'XRUN', name: 'XRUN'},
  ];

  // Modal component
  const AddTokenModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={closeModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {opacity: 0}]}>Add Token</Text>
              <TouchableOpacity onPress={closeModal}>
                <Image
                  source={require('./../../../assets/images/icon_close.png')}
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'Token' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('Token')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Token' && styles.activeTabText,
                  ]}>
                  Token
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'Contract' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('Contract')}
                disabled={!selectedToken && activeTab !== 'Contract'}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Contract' && styles.activeTabText,
                    !selectedToken &&
                      activeTab !== 'Contract' &&
                      styles.disabledTab,
                  ]}>
                  Contract
                </Text>
              </TouchableOpacity>
            </View>

            {/* Token Tab Content */}
            {activeTab === 'Token' && (
              <View style={styles.tabContent}>
                {predefinedTokens.map((token, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tokenItem,
                      selectedToken?.symbol === token.symbol &&
                        styles.selectedToken,
                    ]}
                    onPress={() => handleTokenSelect(token)}>
                    <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                    <Text style={styles.tokenName}>{token.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleTokenNext}
                  disabled={!selectedToken}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Contract Tab Content */}
            {activeTab === 'Contract' && (
              <View style={styles.tabContent}>
                <Text style={styles.inputLabel}>Contract Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0x..."
                  value={contractAddress}
                  onChangeText={setContractAddress}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleContractNext}
                  disabled={!contractAddress}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Confirm Tab Content */}
            {activeTab === 'Confirm' && (
              <View style={styles.tabContent}>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Token Name</Text>
                  <Text style={styles.confirmValue}>
                    {tokenName || selectedToken?.name}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Token Symbol</Text>
                  <Text style={styles.confirmValue}>
                    {tokenSymbol || selectedToken?.symbol}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Decimals</Text>
                  <Text style={styles.confirmValue}>
                    {tokenDecimals || '18'}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Contract Address</Text>
                  <Text style={styles.confirmValue}>
                    {shortenAddress(contractAddress, 6, 4)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddTokenConfirm}>
                  <Text style={styles.addButtonText}>Add token</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const onBack = () => {
    navigation.navigate('Home');
  };

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set dummy crypto assets
      setCryptoAssets([
        {
          id: '1',
          symbol: 'XRUN',
          name: 'XRUN',
          amount: '3,600',
          icon: require('./../../../assets/images/icon_xrun_white.png'),
        },
        {
          id: '2',
          symbol: 'POL',
          name: 'Polygon',
          amount: '1,600',
          icon: require('./../../../assets/images/icon_polygon.png'),
        },
        {
          id: '3',
          symbol: 'REALVERSE',
          name: 'RVC',
          amount: '1,000,000',
          icon: require('./../../../assets/images/icon_realverse.png'),
        },
        {
          id: '4',
          symbol: 'NFT #8282',
          name: 'Round 1',
          amount: '1',
          icon: require('./../../../assets/images/icon_nft_black.png'),
        },
        {
          id: '5',
          symbol: 'NFT #8283',
          name: 'Round 1',
          amount: '1',
          icon: require('./../../../assets/images/icon_nft_black.png'),
        },
        {
          id: '6',
          symbol: 'AD XRUN',
          name: 'XRUN',
          amount: '500',
          icon: require('./../../../assets/images/icon_ad_xrun.png'),
        },
      ]);
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
          return '#E0A15F'; // warna coklat keemasan
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
          paddingVertical: 5,
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
              <Text style={{fontSize: fontSize('body'), color: '#B8B8B8'}}>
                {item.name}
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: 'black',
              paddingVertical: 18,
            }}>
            {/* {formatCustom(item.amount)} {item.symbol} */}
            {item.amount} {item.symbol}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FAFAFA" barStyle="dark-content" />
      {isPopupShow && (
        <View style={{position: 'absolute', zIndex: 999}}>
          <Text>Add Token Popup</Text>
        </View>
      )}

      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={onBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Wallet</Text>
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
              source={require('./../../../assets/images/bg_walletCard.png')}
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
                gap: 15,
              }}>
              <View style={styles.walletAddressContainer}>
                <Text style={styles.walletLabel}>My Wallet</Text>
                <TouchableOpacity
                  onPress={handleCopyAddress}
                  style={styles.copyButton}>
                  <Image
                    source={require('./../../../assets/images/icon_copy_white.png')}
                    style={styles.copyIcon}
                  />
                </TouchableOpacity>
              </View>
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
          <Text style={styles.assetsTitle}>My Balance</Text>
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
            onPress={handleAddToken}>
            <Text
              style={{
                color: 'black',
                fontWeight: '700',
                fontSize: fontSize('body'),
              }}>
              Add token
            </Text>
            <Image
              source={require('./../../../assets/images/icon_star.png')}
              style={{width: 18, height: 18}}
            />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading assets...</Text>
          </View>
        ) : (
          <FlatList
            data={cryptoAssets}
            renderItem={renderCryptoItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cryptoList}
          />
        )}
      </View>

      <AddTokenModal />
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
    marginBottom: 8,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
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
  },
  selectedToken: {
    backgroundColor: '#F5F5FF',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  tokenName: {
    fontSize: 14,
    color: '#B8B8B8',
  },
  inputLabel: {
    fontSize: 14,
    color: '#B8B8B8',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#5F59E0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  confirmLabel: {
    fontSize: 14,
    color: '#B8B8B8',
  },
  confirmValue: {
    fontSize: 14,
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
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WalletScreen;
