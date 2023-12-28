import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

// Custom TabBar
const renderTabBar = props => (
  <TabBar
    {...props}
    indicatorStyle={{backgroundColor: '#383b50'}}
    style={{
      backgroundColor: 'white',
      height: 55,
      elevation: 0,
      borderBottomColor: '#bbb',
      borderBottomWidth: 0.5,
    }}
    renderLabel={({route, focused, color}) => (
      <Text
        style={{
          color: focused ? '#383b50' : '#bbb',
          textAlign: 'center',
          fontFamily: 'Poppins-Regular',
          fontSize: 13,
          maxWidth: 80,
          borderBottomColor: 'yellow',
        }}>
        {route.title}
      </Text>
    )}
  />
);

// Content TabView
const TotalHistory = ({totalHistory}) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    style={{paddingHorizontal: 28}}
    overScrollMode="never">
    {totalHistory.length > 0 ? (
      totalHistory.map((totalHistory, index) => {
        const {
          datetime,
          time,
          amount,
          symbol,
          extracode: tempExtracode,
          action: tempAction,
        } = totalHistory;
        let action;
        let extracode;

        switch (tempAction) {
          case '3304':
            action = 'Completed';
            break;
          case '3651':
            action = 'Withdrawal details';
            break;
          case '3305':
            action = 'Transfer';
            break;
          case '3306':
            action = 'Conversion';
            break;
          case '3307':
            action = 'Exchange';
            break;
          case '3308':
            action = 'Exchange completed';
            break;
          default:
            action = 'Transfer';
            break;
        }

        switch (tempExtracode) {
          case '9453':
            extracode = 'Transfer failed';
            break;
          case '9416':
            extracode = '-';
            break;
          case '9001':
            extracode = 'Withdrawal approval';
            break;
          case '9002':
            extracode = 'Withdrawal not approved';
            break;
          default:
            extracode = 'Transfer completed';
            break;
        }

        return (
          <View style={styles.wrapperItemTable} key={index}>
            <View>
              <Text style={styles.details}>{action}</Text>
              <Text style={styles.date}>{`${datetime}    ${time}`}</Text>
            </View>
            <View>
              <View style={styles.wrapperPrice}>
                <Text style={styles.price}>{amount} </Text>
                <Text style={styles.price}>{symbol}</Text>
              </View>
              <Text style={styles.status}>{extracode}</Text>
            </View>
          </View>
        );
      })
    ) : (
      <Text style={styles.textNotFoundHistory}>History not found</Text>
    )}
  </ScrollView>
);

const TransferHistory = ({transferHistory}) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    style={{paddingHorizontal: 28}}
    overScrollMode="never">
    {transferHistory.length > 0 ? (
      transferHistory.map((transferHistory, index) => {
        const {
          datetime,
          time,
          amount,
          symbol,
          extracode: tempExtracode,
          action: tempAction,
        } = transferHistory;
        let action;
        let extracode;

        switch (tempAction) {
          case '3304':
            action = 'Completed';
            break;
          case '3651':
            action = 'Withdrawal details';
            break;
          case '3305':
            action = 'Transfer';
            break;
          case '3306':
            action = 'Conversion';
            break;
          case '3307':
            action = 'Exchange';
            break;
          case '3308':
            action = 'Exchange completed';
            break;
          default:
            action = 'Transfer';
            break;
        }

        switch (tempExtracode) {
          case '9453':
            extracode = 'Transfer failed';
            break;
          case '9416':
            extracode = '-';
            break;
          case '9001':
            extracode = 'Withdrawal approval';
            break;
          case '9002':
            extracode = 'Withdrawal not approved';
            break;
          default:
            extracode = '';
            break;
        }

        return (
          <View style={styles.wrapperItemTable} key={index}>
            <View>
              <Text style={styles.details}>{action}</Text>
              <Text style={styles.date}>{`${datetime}    ${time}`}</Text>
            </View>
            <View>
              <Text style={styles.price}>
                {amount} {symbol}
              </Text>
              <Text style={styles.status}>{extracode}</Text>
            </View>
          </View>
        );
      })
    ) : (
      <Text style={styles.textNotFoundHistory}>History not found</Text>
    )}
  </ScrollView>
);

const ReceivedDetails = ({receivedDetails}) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    style={{paddingHorizontal: 28}}
    overScrollMode="never">
    {receivedDetails.length > 0 ? (
      receivedDetails.map((receivedDetail, index) => {
        const {
          datetime,
          time,
          amount,
          symbol,
          extracode: tempExtracode,
          action: tempAction,
        } = receivedDetail;
        let action;
        let extracode;

        switch (tempAction) {
          case '3304':
            action = 'Completed';
            break;
          case '3651':
            action = 'Withdrawal details';
            break;
          case '3305':
            action = 'Transfer';
            break;
          case '3306':
            action = 'Conversion';
            break;
          case '3307':
            action = 'Exchange';
            break;
          case '3308':
            action = 'Exchange completed';
            break;
          default:
            action = 'Transfer';
            break;
        }

        switch (tempExtracode) {
          case '9453':
            extracode = 'Transfer failed';
            break;
          case '9416':
            extracode = '-';
            break;
          case '9001':
            extracode = 'Withdrawal approval';
            break;
          case '9002':
            extracode = 'Withdrawal not approved';
            break;
          default:
            extracode = 'Transfer completed';
            break;
        }

        return (
          <View style={styles.wrapperItemTable} key={index}>
            <View>
              <Text style={styles.details}>{action}</Text>
              <Text style={styles.date}>{`${datetime}    ${time}`}</Text>
            </View>
            <View>
              <Text style={styles.price}>
                {amount} {symbol}
              </Text>
              <Text style={styles.status}>{extracode}</Text>
            </View>
          </View>
        );
      })
    ) : (
      <Text style={styles.textNotFoundHistory}>History not found</Text>
    )}
  </ScrollView>
);

const TransitionHistory = ({transitionHistory}) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    style={{paddingHorizontal: 28}}
    overScrollMode="never">
    {transitionHistory.length > 0 ? (
      transitionHistory.map((transitionHistory, index) => {
        const {
          datetime,
          time,
          amount,
          symbol,
          extracode: tempExtracode,
          action: tempAction,
        } = transitionHistory;
        let action;
        let extracode;

        switch (tempAction) {
          case '3304':
            action = 'Completed';
            break;
          case '3651':
            action = 'Withdrawal details';
            break;
          case '3305':
            action = 'Transfer';
            break;
          case '3306':
            action = 'Conversion';
            break;
          case '3307':
            action = 'Exchange';
            break;
          case '3308':
            action = 'Exchange completed';
            break;
          default:
            action = 'Transfer';
            break;
        }

        switch (tempExtracode) {
          case '9453':
            extracode = 'Transfer failed';
            break;
          case '9416':
            extracode = '-';
            break;
          case '9001':
            extracode = 'Withdrawal approval';
            break;
          case '9002':
            extracode = 'Withdrawal not approved';
            break;
          default:
            extracode = '';
            break;
        }

        return (
          <View style={styles.wrapperItemTable} key={index}>
            <View>
              <Text style={styles.details}>{action}</Text>
              <Text style={styles.date}>{`${datetime}    ${time}`}</Text>
            </View>
            <View>
              <Text style={styles.price}>
                {amount} {symbol}
              </Text>
              <Text style={styles.status}>{extracode}</Text>
            </View>
          </View>
        );
      })
    ) : (
      <Text style={styles.textNotFoundHistory}>History not found</Text>
    )}
  </ScrollView>
);

const TableWalletCard = ({
  dataWallet,
  currentCurrency,
  transactionalInformation,
}) => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [currentDaysTransactional, setCurrentDaysTransactional] = useState(7);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'totalHistory', title: 'Total History'},
    {key: 'transferHistory', title: 'Transfer History'},
    {key: 'receivedDetails', title: 'Received details'},
    {key: 'transitionHistory', title: 'Transition History'},
  ]);

  const {totalHistory, transferHistory, receivedDetails, transitionHistory} =
    transactionalInformation;

  // Check if data transactionalInformation still empty / not
  if (
    !transactionalInformation ||
    !totalHistory ||
    !transferHistory ||
    !receivedDetails ||
    !transitionHistory
  ) {
    console.log(
      'Waiting data Total History, Transfer History, Received Details, and Transition History',
    );
    return;
  }

  const currentDate = new Date();

  const filterTransactionalByCurrency = data => {
    const dataTransactional = data
      .filter(
        transactionalByCurrency =>
          transactionalByCurrency.currency == currentCurrency,
      )
      .filter(transaction => {
        const transactionDateTime = new Date(
          `${transaction.datetime}T${transaction.time}`,
        );

        // Hitung perbedaan waktu dalam milidetik
        const timeDifference = currentDate - transactionDateTime;

        // Konversi perbedaan waktu dari milidetik ke hari
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

        // Return true jika transaksi terjadi dalam 7 hari terakhir
        return daysDifference <= currentDaysTransactional;
      });

    return dataTransactional;
  };

  // Filter by currency
  const filterTotalHistory = filterTransactionalByCurrency(totalHistory);
  const filterTransferHistory = filterTransactionalByCurrency(transferHistory);
  const filterReceivedDetails = filterTransactionalByCurrency(receivedDetails);
  const filterTransitionHistory =
    filterTransactionalByCurrency(transitionHistory);

  const renderScene = SceneMap({
    totalHistory: () => <TotalHistory totalHistory={filterTotalHistory} />,
    transferHistory: () => (
      <TransferHistory transferHistory={filterTransferHistory} />
    ),
    receivedDetails: () => (
      <ReceivedDetails receivedDetails={filterReceivedDetails} />
    ),
    transitionHistory: () => (
      <TransitionHistory transitionHistory={filterTransitionHistory} />
    ),
  });

  const currentDaysBackground = '#fedc00';

  const changeCurrentDaysTransactional = days => {
    setCurrentDaysTransactional(days);
  };

  // Go to page conversion request
  const conversionRequest = () => {
    navigation.navigate('ConversionRequest', {
      dataWallet,
    });
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.wrapperTextHead}>
        <TouchableOpacity
          style={styles.contentTextHeadDefault}
          activeOpacity={0.7}>
          <Text style={[styles.textHead, styles.textHeadDefault]}>
            Transactional Information/
          </Text>
        </TouchableOpacity>
        {currentCurrency !== '4' ? (
          <>
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.contentTextHead}
              onPress={() =>
                navigation.navigate('SendWallet', {
                  dataWallet,
                })
              }>
              <Text style={styles.textHead}>SEND</Text>
            </TouchableOpacity>

            {currentCurrency === '1' ? (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.contentTextHead}
                onPress={conversionRequest}>
                <Text style={styles.textHead}>CHANGE</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.contentTextHead}
                onPress={conversionRequest}>
                <Text style={styles.textHead}>EXCHANGE</Text>
              </TouchableOpacity>
            )}
          </>
        ) : null}
      </View>

      <View style={styles.contentTable}>
        <View style={styles.wrapperDate}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => changeCurrentDaysTransactional(7)}
            style={[
              styles.wrapperTextDay,
              currentDaysTransactional === 7 && {
                backgroundColor: currentDaysBackground,
              },
            ]}>
            <Text style={styles.textDay}>7DAYS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => changeCurrentDaysTransactional(14)}
            style={[
              styles.wrapperTextDay,
              currentDaysTransactional === 14 && {
                backgroundColor: currentDaysBackground,
              },
            ]}>
            <Text style={styles.textDay}>14DAYS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => changeCurrentDaysTransactional(30)}
            style={[
              styles.wrapperTextDay,
              currentDaysTransactional === 30 && {
                backgroundColor: currentDaysBackground,
              },
            ]}>
            <Text style={styles.textDay}>30DAYS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wrapperTabView}>
          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{width: layout.width}}
            renderTabBar={renderTabBar}
          />
        </View>
      </View>
    </View>
  );
};

export default TableWalletCard;
const styles = StyleSheet.create({
  wrapperTextHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 36,
    // marginTop: 20,
  },
  contentTextHead: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textHead: {
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: 'black',
  },
  contentTextHeadDefault: {
    backgroundColor: 'white',
    maxWidth: 200,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 20,
  },
  contentTable: {
    backgroundColor: 'white',
    flex: 1,
    paddingTop: 22,
  },
  wrapperDate: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  wrapperTextDay: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 26,
    paddingTop: 6,
    paddingBottom: 2,
  },
  textDay: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: 'black',
  },
  wrapperTabView: {
    flex: 1,
    marginTop: 4,
  },
  wrapperItemTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomColor: '#bbb',
    borderBottomWidth: 0.55,
    paddingBottom: 10,
    paddingTop: 20,
  },
  details: {
    color: 'black',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  date: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#aaa',
  },
  wrapperPrice: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  price: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: 'black',
    textAlign: 'right',
  },
  status: {
    color: '#999',
    textAlign: 'right',
    fontSize: 13,
  },
  textNotFoundHistory: {
    fontFamily: 'Poppins-Regular',
    color: '#ccc',
    textAlign: 'center',
    paddingTop: 20,
    borderBottomColor: '#bbb',
    borderBottomWidth: 0.55,
    paddingBottom: 10,
  },
});
