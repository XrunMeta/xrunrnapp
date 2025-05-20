import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import TxDetailItem from '../../components/TransactionDetailItem';
import ButtonBack from '../../components/ButtonBack';

const TransactionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {txHash, symbol, timestamp} = route.params;

  const [txDetail, setTxDetail] = useState();
  const [loading, setLoading] = useState(true);

  const onBack = () => {
    navigation.navigate('WalletHome');
  };

  const fetchTransactionDetails = async txHash => {
    try {
      // Simulasi waktu transaksi
      const timestampUnix = Math.floor(Date.now() / 1000) - 3600;
      const date = new Date(timestampUnix * 1000);
      const dateFormatted = date.toLocaleString();

      // Dummy data transaksi
      const dummyTx = {
        from: '0x12288d42ccd5635de5463b390b8d503f607ddeb8',
        to: '0xa5c3ff94f4fc1be560b79a4a6774bf4bae754d62',
        hash: txHash,
        nonce: 42,
        gasPrice: '1000000000',
        gasUsed: '21000',
        gas: '30000',
        blockNumber: 12345678,
        value: '5000000000000000000', // 5 ETH
        erc20Transfer: {
          recipient: '0xa5c3ff94f4fc1be560b79a4a6774bf4bae754d62',
          amountFormatted: '100.00',
        },
      };

      const isERC20 = !!dummyTx.erc20Transfer;
      const totalGasFee = ((dummyTx.gasUsed * dummyTx.gasPrice) / 1e18).toFixed(
        6,
      );

      return {
        from: dummyTx.from,
        to: isERC20 ? dummyTx.erc20Transfer.recipient : dummyTx.to,
        time: dateFormatted,
        txHash: dummyTx.hash,
        details: {
          nonce: dummyTx.nonce,
          gasPrice: dummyTx.gasPrice,
          usedGas: dummyTx.gasUsed,
          maxGas: dummyTx.gas,
          totalSpent: isERC20
            ? `${dummyTx.erc20Transfer.amountFormatted} USDT`
            : `${(dummyTx.value / 1e18).toFixed(6)} ETH`,
          blockNumber: dummyTx.blockNumber,
          gasFee: `${totalGasFee} MATIC`,
        },
        network: 'Polygon',
      };
    } catch (err) {
      console.error('fetchTransactionDetails (dummy) error:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadTx = async () => {
      const result = await fetchTransactionDetails(txHash);
      if (result) {
        setTxDetail(result);
      }
      setLoading(false);
    };

    loadTx();
  }, [txHash]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: '#364ED4'}} />

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}>
        <StatusBar backgroundColor="#364ED4" barStyle="light-content" />
        <View style={styles.contentContainer}>
          <View style={{flexDirection: 'row'}}>
            <View style={{position: 'absolute', zIndex: 1}}>
              <ButtonBack onClick={onBack} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>Transaction</Text>
            </View>
          </View>

          <ScrollView style={{flex: 1}}>
            {loading ? (
              <Text style={{textAlign: 'center', marginTop: 40}}>
                Loading...
              </Text>
            ) : txDetail ? (
              <>
                <View style={styles.section}>
                  <TxDetailItem label="from" value={txDetail.from} copy />
                  <TxDetailItem label="to" value={txDetail.to} copy />
                  <TxDetailItem label="time" value={txDetail.time} />
                  <TxDetailItem
                    label="txHash"
                    value={txDetail.txHash}
                    copy
                    link={`https://polygonscan.com/tx/${txDetail.txHash}`}
                  />
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>'transactionDetails'</Text>
                </View>

                <View style={styles.section}>
                  <TxDetailItem label="nonce" value={txDetail.details.nonce} />
                  <TxDetailItem
                    label="gasPrice"
                    value={txDetail.details.gasPrice}
                  />
                  <TxDetailItem
                    label="usedGas"
                    value={txDetail.details.usedGas}
                  />
                  <TxDetailItem
                    label="maxGas"
                    value={txDetail.details.maxGas}
                  />
                  <TxDetailItem
                    label="totalSpent"
                    value={txDetail.details.totalSpent}
                    isLarge
                  />
                  <TxDetailItem
                    label="blockHeight"
                    value={txDetail.details.blockNumber}
                  />
                </View>

                <View style={styles.networkContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `https://polygonscan.com/tx/${txDetail.txHash}`,
                      )
                    }
                    style={styles.iconButton}>
                    <Image
                      source={require('./../../../assets/images/icon_polygonscan.png')}
                      height={17}
                      width={109}
                      style={styles.iconPolygonscan}
                    />
                    <Image
                      source={require('./../../../assets/images/icon_link2.png')}
                      style={{height: 14, objectFit: 'contain', marginTop: 3}}
                    />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={{textAlign: 'center', marginTop: 40}}>
                'notFound'
              </Text>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#364ED4',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  section: {
    paddingBottom: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 25,
    marginTop: 15,
    paddingBottom: 5,
    borderTopWidth: 0.5,
    borderTopColor: '#DEDEDE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  iconButton: {
    padding: 8,
    flexDirection: 'row',
  },
  networkContainer: {
    flexDirection: 'row',
    paddingBottom: 50,
    marginBottom: 20,
  },
  iconPolygonscan: {width: 109, height: 17},
});

export default TransactionDetailScreen;
