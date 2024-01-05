import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
    renderLabel={({route, focused}) => (
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
const TotalHistory = ({totalHistory, lang}) => {
  const renderItem = ({item}) => {
    const {
      datetime,
      time,
      amount,
      symbol,
      extracode: tempExtracode,
      action: tempAction,
    } = item;

    let action;
    let extracode;

    switch (tempAction) {
      case '3304':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3304
            ? lang.screen_wallet.history_action3304
            : '';
        break;
      case '3651':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3651
            ? lang.screen_wallet.history_action3651
            : '';
        break;
      case '3305':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3305
            ? lang.screen_wallet.history_action3305
            : '';
        break;
      case '3306':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3306
            ? lang.screen_wallet.history_action3306
            : '';
        break;
      case '3307':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3307
            ? lang.screen_wallet.history_action3307
            : '';
        break;
      case '3308':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3308
            ? lang.screen_wallet.history_action3308
            : '';
        break;
      default:
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3305
            ? lang.screen_wallet.history_action3305
            : '';
        break;
    }

    switch (tempExtracode) {
      case '9453':
        extracode =
          lang && lang.screen_wallet && lang.screen_wallet.history_extracode9453
            ? lang.screen_wallet.history_extracode9453
            : '';
        break;
      case '9416':
        extracode = '-';
        break;
      case '9001':
        extracode =
          lang && lang.screen_wallet && lang.screen_wallet.history_extracode9001
            ? lang.screen_wallet.history_extracode9001
            : '';
        break;
      case '9002':
        extracode =
          lang && lang.screen_wallet && lang.screen_wallet.history_extracode9002
            ? lang.screen_wallet.history_extracode9002
            : '';
        break;
      default:
        extracode =
          lang &&
          lang.screen_wallet &&
          lang.screen_wallet.history_extracodesuccess
            ? lang.screen_wallet.history_extracodesuccess
            : '';
        break;
    }

    return (
      <View style={styles.wrapperItemTable}>
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
  };

  const renderEmptyList = () => (
    <Text style={styles.textNotFoundHistory}>
      {lang && lang.screen_wallet && lang.screen_wallet.history_not_found
        ? lang.screen_wallet.history_not_found
        : ''}
    </Text>
  );

  return (
    <FlatList
      data={totalHistory}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyList}
      showsVerticalScrollIndicator={false}
      style={{paddingHorizontal: 28}}
      overScrollMode="never"
    />
  );
};

const TransferHistory = ({transferHistory, lang}) => {
  const renderItem = ({item}) => {
    const {datetime, time, amount, symbol, action: tempAction} = item;

    let action;
    let extracode;

    switch (tempAction) {
      case '3304':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3304
            ? lang.screen_wallet.history_action3304
            : '';
        break;
      case '3651':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3651
            ? lang.screen_wallet.history_action3651
            : '';
        break;
      case '3305':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3305
            ? lang.screen_wallet.history_action3305
            : '';
        break;
      case '3306':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3306
            ? lang.screen_wallet.history_action3306
            : '';
        break;
      case '3307':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3307
            ? lang.screen_wallet.history_action3307
            : '';
        break;
      case '3308':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3308
            ? lang.screen_wallet.history_action3308
            : '';
        break;
      default:
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3305
            ? lang.screen_wallet.history_action3305
            : '';
        break;
    }

    return (
      <View style={styles.wrapperItemTable}>
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
  };

  const renderEmptyList = () => (
    <Text style={styles.textNotFoundHistory}>
      {lang && lang.screen_wallet && lang.screen_wallet.history_not_found
        ? lang.screen_wallet.history_not_found
        : ''}
    </Text>
  );

  return (
    <FlatList
      data={transferHistory}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyList}
      showsVerticalScrollIndicator={false}
      style={{paddingHorizontal: 28}}
      overScrollMode="never"
    />
  );
};

const ReceivedDetails = ({receivedDetails, lang}) => {
  const renderItem = ({item}) => {
    const {
      datetime,
      time,
      amount,
      symbol,
      extracode: tempExtracode,
      action: tempAction,
    } = item;

    let action;
    let extracode;

    switch (tempAction) {
      case '3304':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3304
            ? lang.screen_wallet.history_action3304
            : '';
        break;
      case '3651':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3651
            ? lang.screen_wallet.history_action3651
            : '';
        break;
      case '3305':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3305
            ? lang.screen_wallet.history_action3305
            : '';
        break;
      case '3306':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3306
            ? lang.screen_wallet.history_action3306
            : '';
        break;
      case '3307':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3307
            ? lang.screen_wallet.history_action3307
            : '';
        break;
      case '3308':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3308
            ? lang.screen_wallet.history_action3308
            : '';
        break;
      default:
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3305
            ? lang.screen_wallet.history_action3305
            : '';
        break;
    }

    switch (tempExtracode) {
      case '9453':
        extracode =
          lang && lang.screen_wallet && lang.screen_wallet.history_extracode9453
            ? lang.screen_wallet.history_extracode9453
            : '';
        break;
      case '9416':
        extracode = '-';
        break;
      case '9001':
        extracode =
          lang && lang.screen_wallet && lang.screen_wallet.history_extracode9001
            ? lang.screen_wallet.history_extracode9001
            : '';
        break;
      case '9002':
        extracode =
          lang && lang.screen_wallet && lang.screen_wallet.history_extracode9002
            ? lang.screen_wallet.history_extracode9002
            : '';
        break;
      default:
        extracode =
          lang &&
          lang.screen_wallet &&
          lang.screen_wallet.history_extracodesuccess
            ? lang.screen_wallet.history_extracodesuccess
            : '';
        break;
    }

    return (
      <View style={styles.wrapperItemTable}>
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
  };

  const renderEmptyList = () => (
    <Text style={styles.textNotFoundHistory}>
      {lang && lang.screen_wallet && lang.screen_wallet.history_not_found
        ? lang.screen_wallet.history_not_found
        : ''}
    </Text>
  );

  return (
    <FlatList
      data={receivedDetails}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyList}
      showsVerticalScrollIndicator={false}
      style={{paddingHorizontal: 28}}
      overScrollMode="never"
    />
  );
};

const TransitionHistory = ({transitionHistory, lang}) => {
  const renderItem = ({item}) => {
    const {datetime, time, amount, symbol, action: tempAction} = item;

    let action;
    let extracode;

    switch (tempAction) {
      case '3304':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3304
            ? lang.screen_wallet.history_action3304
            : '';
        break;
      case '3651':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3651
            ? lang.screen_wallet.history_action3651
            : '';
        break;
      case '3305':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3305
            ? lang.screen_wallet.history_action3305
            : '';
        break;
      case '3306':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3306
            ? lang.screen_wallet.history_action3306
            : '';
        break;
      case '3307':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3307
            ? lang.screen_wallet.history_action3307
            : '';
        break;
      case '3308':
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3308
            ? lang.screen_wallet.history_action3308
            : '';
        break;
      default:
        action =
          lang && lang.screen_wallet && lang.screen_wallet.history_action3305
            ? lang.screen_wallet.history_action3305
            : '';
        break;
    }

    return (
      <View style={styles.wrapperItemTable}>
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
  };

  const renderEmptyList = () => (
    <Text style={styles.textNotFoundHistory}>
      {lang && lang.screen_wallet && lang.screen_wallet.history_not_found
        ? lang.screen_wallet.history_not_found
        : ''}
    </Text>
  );

  return (
    <FlatList
      data={transitionHistory}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyList}
      showsVerticalScrollIndicator={false}
      style={{paddingHorizontal: 28}}
      overScrollMode="never"
    />
  );
};

const TableWalletCard = ({
  dataWallet,
  currentCurrency,
  transactionalInformation,
  lang,
}) => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [currentDaysTransactional, setCurrentDaysTransactional] = useState(7);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    setRoutes([
      {
        key: 'totalHistory',
        title:
          lang && lang.screen_wallet && lang.screen_wallet.total_history
            ? lang.screen_wallet.total_history
            : '',
      },
      {
        key: 'transferHistory',
        title:
          lang && lang.screen_wallet && lang.screen_wallet.transfer_history
            ? lang.screen_wallet.transfer_history
            : '',
      },
      {
        key: 'receivedDetails',
        title:
          lang && lang.screen_wallet && lang.screen_wallet.received_details
            ? lang.screen_wallet.received_details
            : '',
      },
      {
        key: 'transitionHistory',
        title:
          lang && lang.screen_wallet && lang.screen_wallet.transition_history
            ? lang.screen_wallet.transition_history
            : '',
      },
    ]);
  }, [lang]);

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
        const transactionDateTime = new Date(`${transaction.datetime}`);

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
    totalHistory: () => (
      <TotalHistory totalHistory={filterTotalHistory} lang={lang} />
    ),
    transferHistory: () => (
      <TransferHistory transferHistory={filterTransferHistory} lang={lang} />
    ),
    receivedDetails: () => (
      <ReceivedDetails receivedDetails={filterReceivedDetails} lang={lang} />
    ),
    transitionHistory: () => (
      <TransitionHistory
        transitionHistory={filterTransitionHistory}
        lang={lang}
      />
    ),
  });

  const currentDaysBackground = '#fedc00';

  const changeCurrentDaysTransactional = days => {
    setCurrentDaysTransactional(days);
  };

  // Go to page conversion request
  const conversionRequest = () => {
    navigation.navigate('ConversionRequest', {
      currency: dataWallet.currency,
    });
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.wrapperTextHead}>
        <TouchableOpacity
          style={styles.contentTextHeadDefault}
          activeOpacity={0.7}>
          <Text style={[styles.textHead, styles.textHeadDefault]}>
            {lang &&
            lang.screen_wallet &&
            lang.screen_wallet.table_head_transaction
              ? lang.screen_wallet.table_head_transaction
              : ''}
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
              <Text style={styles.textHead}>
                {lang &&
                lang.screen_wallet &&
                lang.screen_wallet.table_head_send
                  ? lang.screen_wallet.table_head_send
                  : ''}
              </Text>
            </TouchableOpacity>

            {currentCurrency === '1' ? (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.contentTextHead}
                onPress={conversionRequest}>
                <Text style={styles.textHead}>
                  {lang &&
                  lang.screen_wallet &&
                  lang.screen_wallet.table_head_change
                    ? lang.screen_wallet.table_head_change
                    : ''}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.contentTextHead}
                onPress={conversionRequest}>
                <Text style={styles.textHead}>
                  {lang &&
                  lang.screen_wallet &&
                  lang.screen_wallet.table_head_exchange
                    ? lang.screen_wallet.table_head_exchange
                    : ''}
                </Text>
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
            <Text style={styles.textDay}>
              7{' '}
              {lang && lang.screen_wallet && lang.screen_wallet.table_days
                ? lang.screen_wallet.table_days
                : ''}
            </Text>
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
            <Text style={styles.textDay}>
              14{' '}
              {lang && lang.screen_wallet && lang.screen_wallet.table_days
                ? lang.screen_wallet.table_days
                : ''}
            </Text>
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
            <Text style={styles.textDay}>
              30{' '}
              {lang && lang.screen_wallet && lang.screen_wallet.table_days
                ? lang.screen_wallet.table_days
                : ''}
            </Text>
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
    color: '#000',
    minWidth: 80,
    textTransform: 'uppercase',
  },
  textHeadDefault: {
    textTransform: 'none',
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
    maxWidth: 150,
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
