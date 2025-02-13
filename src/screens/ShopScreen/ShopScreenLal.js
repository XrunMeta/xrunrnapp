import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  FlatList,
  ScrollView,
  Clipboard,
  Platform,
} from 'react-native';
import {
  useIAP,
  purchaseUpdatedListener,
  purchaseErrorListener,
  requestPurchase,
  initConnection,
  flushFailedPurchasesCachedAsPendingAndroid,
  getProducts,
  acknowledgePurchaseAndroid,
} from 'react-native-iap';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';

const itemSkus = [
  'xrunapp.10151_1.transferticket',
  'xrunapp.10152_2.coinpumper',
  'xrunitemtest',
];

const ShopScreen = () => {
  const {connected, products} = useIAP();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [connection, setConnection] = useState(false);
  const [productList, setProductList] = useState([]);

  const navigation = useNavigation();

  const addLog = message => {
    setLogs(prevLogs => [
      ...prevLogs,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

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
      addLog(`Error initializing IAP: ${error.message}`);
    }
  };

  useEffect(() => {
    initializeIAP();

    return () => {
      if (connected) {
        // Assuming endConnection is available in react-native-iap
        // endConnection();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      addLog('IAP connected successfully.');
      fetchProducts();
    } else {
      addLog('IAP connection failed.');
    }

    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async purchase => {
        console.log('Purchase Success:', purchase);
        addLog(`Purchase successful: ${JSON.stringify(purchase)}`);

        // Acknowledge purchase for Android
        if (Platform.OS === 'android' && !purchase.isAcknowledgedAndroid) {
          if (purchase?.purchaseToken && purchase.purchaseStateAndroid === 0) {
            try {
              await acknowledgePurchaseAndroid(purchase.purchaseToken);
              addLog(`Purchase acknowledged: ${purchase.productId}`);

              // Setelah acknowledged, kita harus menyelesaikan transaksi
              await finishTransaction({purchase, isConsumable: false});
              addLog(`Transaction finished for ${purchase.productId}`);
              Alert.alert('Purchase Successful', JSON.stringify(purchase));
            } catch (error) {
              console.error('Error acknowledging purchase: ', error);
              addLog(`Error acknowledging purchase: ${error.message}`);
            }
          } else {
            addLog(
              `Purchase token is null or state is not valid for ${purchase.productId}`,
            );
          }
        }
      },
    );

    const purchaseErrorSubscription = purchaseErrorListener(error => {
      console.log('Purchase Error:', error);
      addLog(`Purchase error: ${error.message}`);
      Alert.alert('Purchase Failed', error.message);
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, [connection]);

  const fetchProducts = async () => {
    addLog('Fetching products...');
    console.log('Item SKUs:', itemSkus);
    try {
      setLoading(true);
      const fetchedProducts = await getProducts({skus: itemSkus});
      console.log({fetchedProducts});

      if (fetchedProducts?.length > 0) {
        setProductList(fetchedProducts); // Simpan data ke state
      } else {
        addLog('No products found.');
      }

      addLog(`Fetched products: ${JSON.stringify(fetchedProducts)}`);
    } catch (error) {
      console.log('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
      addLog(`Error fetching products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async sku => {
    addLog(`Attempting to purchase: ${sku}`);
    try {
      const purchaseData = await requestPurchase(
        Platform.select({
          ios: {sku},
          android: {skus: [sku]},
        }),
      );

      console.log({purchaseData});
      addLog(`Purchase initiated: ${JSON.stringify(purchaseData)}`);
    } catch (error) {
      console.log('Error during purchase:', error);
      Alert.alert('Error', 'Purchase failed');
      addLog(`Error during purchase: ${error.message}`);
    }
  };

  const copyLogsToClipboard = () => {
    const logText = logs.join('\n');
    Clipboard.setString(logText);
    Alert.alert('Logs copied to clipboard');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <View style={{zIndex: 1}}>
        <ButtonBack onClick={handleBack} />
      </View>
      <Text
        style={{
          color: 'black',
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 10,
        }}>
        In-App Purchases Debugging
      </Text>

      <Text style={{color: 'black', fontWeight: 'bold', marginBottom: 5}}>
        Status:
      </Text>
      <Text style={{color: 'black', marginBottom: 10}}>
        IAP Connected: {connected ? 'Yes' : 'No'}
      </Text>

      <Text style={{color: 'black', fontWeight: 'bold', marginBottom: 5}}>
        Logs:
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 5,
          padding: 10,
          height: 200,
          marginBottom: 10,
        }}>
        <ScrollView>
          {logs.map((log, index) => (
            <Text key={index} style={{color: 'black', fontSize: 12}}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
      <Button title="Copy Logs to Clipboard" onPress={copyLogsToClipboard} />

      <ScrollView>
        <Text
          style={{
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 5,
            color: 'black',
          }}>
          Products:
        </Text>
        {loading ? (
          <Text>Loading products...</Text>
        ) : (
          <FlatList
            data={productList}
            keyExtractor={item => item.productId}
            renderItem={({item}) => (
              <View
                style={{
                  marginBottom: 15,
                  padding: 10,
                  borderWidth: 1,
                  borderRadius: 5,
                }}>
                <Text style={{color: 'black'}}>{item.title}</Text>
                <Text style={{color: 'black'}}>{item.description}</Text>
                <Text style={{color: 'black'}}>
                  Price: {item.localizedPrice}
                </Text>
                <Button
                  title="Buy Now"
                  onPress={() => handlePurchase(item.productId)}
                />
              </View>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ShopScreen;
