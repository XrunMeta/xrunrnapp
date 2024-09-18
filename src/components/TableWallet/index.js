import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import {
  loadMore,
  getFontFam,
  fontSize,
  listTransactionsHistory,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

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
          fontFamily: getFontFam() + 'Regular',
          fontSize: fontSize('body'),
          maxWidth: 80,
          borderBottomColor: 'yellow',
        }}>
        {route.title}
      </Text>
    )}
  />
);

// Function for language action
const actionFunc = (switchKey, lang) => {
  switch (switchKey) {
    case '3304':
      return lang && lang.screen_wallet.history_action3304
        ? lang.screen_wallet.history_action3304
        : '';
      break;
    case '3651':
      return lang && lang.screen_wallet.history_action3651
        ? lang.screen_wallet.history_action3651
        : '';
      break;
    case '3305':
      return lang && lang.screen_wallet.history_action3305
        ? lang.screen_wallet.history_action3305
        : '';
      break;
    case '3306':
      return lang && lang.screen_wallet.history_action3306
        ? lang.screen_wallet.history_action3306
        : '';
      break;
    case '3307':
      return lang && lang.screen_wallet.history_action3307
        ? lang.screen_wallet.history_action3307
        : '';
      break;
    case '3308':
      return lang && lang.screen_wallet.history_action3308
        ? lang.screen_wallet.history_action3308
        : '';
      break;
    default:
      return lang && lang.screen_wallet.history_action3305
        ? lang.screen_wallet.history_action3305
        : '';
      break;
  }
};

// Function for language extracode
const extracodeFunc = (switchKey, lang) => {
  switch (switchKey) {
    case '9453':
      return lang && lang.screen_wallet.history_extracode9453
        ? lang.screen_wallet.history_extracode9453
        : '';
      break;
    case '9416':
      extracode = '-';
      break;
    case '9001':
      return lang && lang.screen_wallet.history_extracode9001
        ? lang.screen_wallet.history_extracode9001
        : '';
      break;
    case '9002':
      return lang && lang.screen_wallet.history_extracode9002
        ? lang.screen_wallet.history_extracode9002
        : '';
      break;
    default:
      return lang && lang.screen_wallet.history_extracodesuccess
        ? lang.screen_wallet.history_extracodesuccess
        : '';
      break;
  }
};

// Content TabView
const TotalHistory = ({
  loadingTransaction,
  routeSwipe,
  totalTransaction,
  setTotalTransaction,
  member,
  currency,
  days,
  lang,
  btnSeeMore,
  setSeeMore,
  defaultLoadData,
  lastPosition,
  setLastPosition,
}) => {
  console.log('Total History');
  return (
    <ScrollView
      style={{paddingHorizontal: 28}}
      contentOffset={{y: lastPosition}}>
      {totalTransaction.length > 0 ? (
        <>
          {totalTransaction.map((item, index) => {
            const {
              datetime,
              time,
              amount,
              symbol,
              extracode: tempExtracode,
              action: tempAction,
            } = item;

            let action = actionFunc(tempAction, lang);
            let extracode = extracodeFunc(tempExtracode, lang);

            return (
              <View key={index} style={styles.wrapperItemTable}>
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
          })}

          {btnSeeMore && totalTransaction.length > defaultLoadData && (
            <View style={{marginTop: 20, marginBottom: 20}}>
              <TouchableOpacity
                style={styles.btnSeeMore}
                activeOpacity={0.7}
                onPress={() =>
                  loadMore(
                    routeSwipe,
                    totalTransaction,
                    setTotalTransaction,
                    member,
                    currency,
                    days,
                    setSeeMore,
                    lastPosition,
                    setLastPosition,
                  )
                }>
                <Text style={styles.textSeeMore}>
                  {lang && lang.screen_wallet
                    ? lang.screen_wallet.see_more
                    : ''}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : loadingTransaction ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}>
          <ActivityIndicator size="large" color="#ccc" />
        </View>
      ) : (
        <Text style={styles.textNotFoundHistory}>
          {lang && lang.screen_wallet.history_not_found
            ? lang.screen_wallet.history_not_found
            : ''}
        </Text>
      )}
    </ScrollView>
  );
};

const TransferHistory = ({
  loadingTransaction,
  routeSwipe,
  totalTransaction,
  setTotalTransaction,
  member,
  currency,
  days,
  lang,
  btnSeeMore,
  setSeeMore,
  defaultLoadData,
  lastPosition,
  setLastPosition,
}) => {
  console.log('Transfer History');

  return (
    <ScrollView
      style={{paddingHorizontal: 28}}
      contentOffset={{y: lastPosition}}>
      {totalTransaction.length > 0 ? (
        <>
          {totalTransaction.map((item, index) => {
            const {datetime, time, amount, symbol, action: tempAction} = item;

            let action = actionFunc(tempAction, lang);
            let extracode;

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
          })}

          {btnSeeMore && totalTransaction.length > defaultLoadData && (
            <View style={{marginTop: 20, marginBottom: 20}}>
              <TouchableOpacity
                style={styles.btnSeeMore}
                activeOpacity={0.7}
                onPress={() =>
                  loadMore(
                    routeSwipe,
                    totalTransaction,
                    setTotalTransaction,
                    member,
                    currency,
                    days,
                    setSeeMore,
                    lastPosition,
                    setLastPosition,
                  )
                }>
                <Text style={styles.textSeeMore}>
                  {lang && lang.screen_wallet
                    ? lang.screen_wallet.see_more
                    : ''}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : loadingTransaction ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}>
          <ActivityIndicator size="large" color="#ccc" />
        </View>
      ) : (
        <Text style={styles.textNotFoundHistory}>
          {lang && lang.screen_wallet.history_not_found
            ? lang.screen_wallet.history_not_found
            : ''}
        </Text>
      )}
    </ScrollView>
  );
};

const ReceivedDetails = ({
  loadingTransaction,
  routeSwipe,
  totalTransaction,
  setTotalTransaction,
  member,
  currency,
  days,
  lang,
  btnSeeMore,
  setSeeMore,
  defaultLoadData,
  lastPosition,
  setLastPosition,
}) => {
  return (
    <ScrollView
      style={{paddingHorizontal: 28}}
      contentOffset={{y: lastPosition}}>
      {totalTransaction.length > 0 ? (
        <>
          {totalTransaction.map((item, index) => {
            const {
              datetime,
              time,
              amount,
              symbol,
              extracode: tempExtracode,
              action: tempAction,
            } = item;

            let action = actionFunc(tempAction, lang);
            let extracode = extracodeFunc(tempExtracode, lang);

            return (
              <View key={index} style={styles.wrapperItemTable}>
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
          })}

          {btnSeeMore && totalTransaction.length > defaultLoadData && (
            <View style={{marginTop: 20, marginBottom: 20}}>
              <TouchableOpacity
                style={styles.btnSeeMore}
                activeOpacity={0.7}
                onPress={() =>
                  loadMore(
                    routeSwipe,
                    totalTransaction,
                    setTotalTransaction,
                    member,
                    currency,
                    days,
                    setSeeMore,
                    lastPosition,
                    setLastPosition,
                  )
                }>
                <Text style={styles.textSeeMore}>
                  {lang && lang.screen_wallet
                    ? lang.screen_wallet.see_more
                    : ''}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : loadingTransaction ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}>
          <ActivityIndicator size="large" color="#ccc" />
        </View>
      ) : (
        <Text style={styles.textNotFoundHistory}>
          {lang && lang.screen_wallet.history_not_found
            ? lang.screen_wallet.history_not_found
            : ''}
        </Text>
      )}
    </ScrollView>
  );
};

const TransitionHistory = ({
  loadingTransaction,
  routeSwipe,
  totalTransaction,
  setTotalTransaction,
  member,
  currency,
  days,
  lang,
  btnSeeMore,
  setSeeMore,
  defaultLoadData,
  lastPosition,
  setLastPosition,
}) => {
  return (
    <ScrollView
      style={{paddingHorizontal: 28}}
      contentOffset={{y: lastPosition}}>
      {totalTransaction.length > 0 ? (
        <>
          {totalTransaction.map((item, index) => {
            const {datetime, time, amount, symbol, action: tempAction} = item;

            let action = actionFunc(tempAction, lang);
            let extracode;

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
          })}

          {btnSeeMore && totalTransaction.length > defaultLoadData && (
            <View style={{marginTop: 20, marginBottom: 20}}>
              <TouchableOpacity
                style={styles.btnSeeMore}
                activeOpacity={0.7}
                onPress={() =>
                  loadMore(
                    routeSwipe,
                    totalTransaction,
                    setTotalTransaction,
                    member,
                    currency,
                    days,
                    setSeeMore,
                    lastPosition,
                    setLastPosition,
                  )
                }>
                <Text style={styles.textSeeMore}>
                  {lang && lang.screen_wallet
                    ? lang.screen_wallet.see_more
                    : ''}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : loadingTransaction ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}>
          <ActivityIndicator size="large" color="#ccc" />
        </View>
      ) : (
        <Text style={styles.textNotFoundHistory}>
          {lang && lang.screen_wallet.history_not_found
            ? lang.screen_wallet.history_not_found
            : ''}
        </Text>
      )}
    </ScrollView>
  );
};

// Memoized
const MemoizedTotalHistory = React.memo(TotalHistory);
const MemoizedTransferHistory = React.memo(TransferHistory);
const MemoizedReceivedDetails = React.memo(ReceivedDetails);
const MemoizedTransitionHistory = React.memo(TransitionHistory);

const TableWalletCard = ({
  member,
  dataWallet,
  currentCurrency,
  lang,
  route,
}) => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [currentDaysTransactional, setCurrentDaysTransactional] = useState(7);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([]);
  const [currentSwipe, setCurrentSwipe] = useState('totalHistory');
  const [contentOffsetX, setContentOffsetX] = useState(0);
  const scrollviewRef = useRef(null);
  const [loadingTransaction, setLoadingTransaction] = useState(true);

  // Transaction
  const defaultLoadData = 100;
  const [btnSeeMore, setBtnSeeMore] = useState(true);
  const [lastPosition, setLastPosition] = useState(0);
  const [totalHistoryLength, setTotalHistoryLength] = useState(0);

  const act = {
    totalHistory: 'app4200-05',
    transferHistory: 'app4200-06',
    receivedDetails: 'app4200-01',
    transitionHistory: 'app4200-03',
  };

  // Detail Transaction
  const [totalHistory, setTotalHistory] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [receivedDetails, setReceivedDetails] = useState([]);
  const [transitionHistory, setTransitionHistory] = useState([]);

  // Update automatic list transaction after transfer/convert
  useEffect(() => {
    if (route.params !== undefined) {
      if (
        route.params.completeSend === 'true' ||
        route.params.completeConversion === 'true'
      ) {
        const key = routes[index].key;
        getDataTransaction(key);
      }
    }
  }, [route]);

  useEffect(() => {
    setRoutes([
      {
        key: 'totalHistory',
        title:
          lang && lang.screen_wallet.total_history
            ? lang.screen_wallet.total_history
            : '',
      },
      {
        key: 'transferHistory',
        title:
          lang && lang.screen_wallet.transfer_history
            ? lang.screen_wallet.transfer_history
            : '',
      },
      {
        key: 'receivedDetails',
        title:
          lang && lang.screen_wallet.received_details
            ? lang.screen_wallet.received_details
            : '',
      },
      {
        key: 'transitionHistory',
        title:
          lang && lang.screen_wallet.transition_history
            ? lang.screen_wallet.transition_history
            : '',
      },
    ]);
  }, [lang]);

  const updateListTransactionWithChangeDay = useCallback(async () => {
    try {
      if (member !== '') {
        setLoadingTransaction(true);
        if (routes.length > 0) {
          const key = routes[index].key;
          getDataTransaction(key);
        }
      }
    } catch (err) {
      console.log(`Failed get transaction: ${err}`);
      Alert.alert('', `Failed get transaction`);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
    }
  }, [member, currentCurrency, currentDaysTransactional]);

  // Hit API for transaction if user change days
  useEffect(() => {
    if (member) {
      updateListTransactionWithChangeDay();
    }
  }, [member, currentCurrency, currentDaysTransactional]);

  const renderScene = useMemo(() => {
    return SceneMap({
      totalHistory: () => (
        <MemoizedTotalHistory
          loadingTransaction={loadingTransaction}
          totalTransaction={totalHistory}
          setTotalTransaction={setTotalHistory}
          member={member}
          currency={currentCurrency}
          days={currentDaysTransactional}
          lang={lang}
          btnSeeMore={btnSeeMore}
          setSeeMore={setBtnSeeMore}
          routeSwipe={currentSwipe}
          defaultLoadData={defaultLoadData}
          lastPosition={lastPosition}
          setLastPosition={setLastPosition}
        />
      ),
      transferHistory: () => (
        <MemoizedTransferHistory
          loadingTransaction={loadingTransaction}
          totalTransaction={transferHistory}
          setTotalTransaction={setTransferHistory}
          member={member}
          currency={currentCurrency}
          days={currentDaysTransactional}
          lang={lang}
          btnSeeMore={btnSeeMore}
          setSeeMore={setBtnSeeMore}
          routeSwipe={currentSwipe}
          defaultLoadData={defaultLoadData}
          lastPosition={lastPosition}
          setLastPosition={setLastPosition}
        />
      ),
      receivedDetails: () => (
        <MemoizedReceivedDetails
          loadingTransaction={loadingTransaction}
          totalTransaction={receivedDetails}
          setTotalTransaction={setReceivedDetails}
          member={member}
          currency={currentCurrency}
          days={currentDaysTransactional}
          lang={lang}
          btnSeeMore={btnSeeMore}
          setSeeMore={setBtnSeeMore}
          routeSwipe={currentSwipe}
          defaultLoadData={defaultLoadData}
          lastPosition={lastPosition}
          setLastPosition={setLastPosition}
        />
      ),
      transitionHistory: () => (
        <MemoizedTransitionHistory
          loadingTransaction={loadingTransaction}
          totalTransaction={transitionHistory}
          setTotalTransaction={setTransitionHistory}
          member={member}
          currency={currentCurrency}
          days={currentDaysTransactional}
          lang={lang}
          btnSeeMore={btnSeeMore}
          setSeeMore={setBtnSeeMore}
          routeSwipe={currentSwipe}
          defaultLoadData={defaultLoadData}
          lastPosition={lastPosition}
          setLastPosition={setLastPosition}
        />
      ),
    });
  }, [
    loadingTransaction,
    totalHistory,
    transferHistory,
    receivedDetails,
    transitionHistory,
    member,
    currentCurrency,
    currentDaysTransactional,
    lang,
    btnSeeMore,
    currentSwipe,
    defaultLoadData,
    lastPosition,
  ]);

  // Call API for get total history, only run once
  const defaultListTransactionsHistory = useCallback(async () => {
    try {
      const totalHistory = await listTransactionsHistory(
        'totalHistory',
        act.totalHistory,
        member,
        currentCurrency,
        currentDaysTransactional,
      );
      console.log('Run defaultListTransactionsHistory() function once');

      setTotalHistoryLength(totalHistory.length);
    } catch (error) {
      Alert.alert('', 'Failed get default list transactions history');
      console.log(`Failed get default list transactions history: ${error}`);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
    }
  }, [member, defaultLoadData]);

  useEffect(() => {
    if (member) {
      defaultListTransactionsHistory();
    }
  }, [member, defaultLoadData]);

  // Check length data history transaction
  const checkLengthHistoryDataTransaction = length => {
    if (length <= 0) {
      setLoadingTransaction(false);
    }
  };

  // Function for call API list transactions history
  const getDataTransaction = useMemo(() => {
    return async (key, isIOS) => {
      try {
        if (!isIOS) {
          setTotalHistory([]);
          setTransferHistory([]);
          setReceivedDetails([]);
          setTransitionHistory([]);
        }

        setLastPosition(0);
        setBtnSeeMore(true);

        switch (key) {
          case 'totalHistory':
            const totalHistory = await listTransactionsHistory(
              key,
              act[key],
              member,
              currentCurrency,
              currentDaysTransactional,
            );

            setTotalHistory(totalHistory);
            checkLengthHistoryDataTransaction(totalHistory.length);
            break;

          case 'transferHistory':
            const transferHistory = await listTransactionsHistory(
              key,
              act[key],
              member,
              currentCurrency,
              currentDaysTransactional,
            );

            setTransferHistory(transferHistory);
            checkLengthHistoryDataTransaction(transferHistory.length);
            break;

          case 'receivedDetails':
            const receivedDetails = await listTransactionsHistory(
              key,
              act[key],
              member,
              currentCurrency,
              currentDaysTransactional,
            );

            checkLengthHistoryDataTransaction(receivedDetails.length);
            setReceivedDetails(receivedDetails);
            break;

          case 'transitionHistory':
            const transitionHistory = await listTransactionsHistory(
              key,
              act[key],
              member,
              currentCurrency,
              currentDaysTransactional,
            );

            checkLengthHistoryDataTransaction(transitionHistory.length);
            setTransitionHistory(transitionHistory);
            break;

          default:
            console.log(`Failed get transaction ${key}`);
            Alert.alert(`Failed get list transactions ${key}`);
            break;
        }
      } catch (error) {
        console.log(`Failed get transaction ${key}: ${error}`);
        Alert.alert('', `Failed get transaction ${key}`);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      }
    };
  });

  // Go to page conversion request
  const changeAndExchangeWalletScreen = type => {
    navigation.navigate(type === 'Change' ? 'Change' : 'Exchange', {
      currency: dataWallet.currency,
    });
  };

  // Set state change days value
  const currentDaysBackground = '#fedc00';
  const changeCurrentDaysTransactional = days => {
    setCurrentDaysTransactional(days);
  };

  // Hit API for transaction if user swipe table
  const onSwipeTransaction = async (key, isIOS) => {
    setLoadingTransaction(true);
    setCurrentSwipe(key);
    if (isIOS) {
      getDataTransaction(key, isIOS);
    } else {
      getDataTransaction(key);
    }
  };

  // Press Swipe transaction for IOS
  const onSwipeTransactionIOS = (index, isScroll = false, newIndex) => {
    if (isScroll) {
      if (newIndex !== index) {
        setIndex(newIndex);
        const key = routes[newIndex].key;
        onSwipeTransaction(key, true);
      }
    } else {
      setIndex(index);
      const key = routes[index].key;
      onSwipeTransaction(key, true);
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.wrapperTextHead}>
        <TouchableOpacity
          style={styles.contentTextHeadDefault}
          activeOpacity={0.7}>
          <Text style={[styles.textHead, styles.textHeadDefault]}>
            {lang && lang.screen_wallet.table_head_transaction
              ? lang.screen_wallet.table_head_transaction
              : ''}
          </Text>
        </TouchableOpacity>
        {currentCurrency !== 4 ? (
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
                {lang && lang.screen_wallet.table_head_send
                  ? lang.screen_wallet.table_head_send
                  : ''}
              </Text>
            </TouchableOpacity>

            {currentCurrency === 1 ? (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.contentTextHead}
                onPress={() => changeAndExchangeWalletScreen('Change')}>
                <Text style={styles.textHead}>
                  {lang && lang.screen_wallet.table_head_change
                    ? lang.screen_wallet.table_head_change
                    : ''}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.contentTextHead}
                onPress={() => changeAndExchangeWalletScreen('Change')}>
                <Text style={styles.textHead}>
                  {lang && lang.screen_wallet.table_head_exchange
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
              {lang && lang.screen_wallet.table_days
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
              {lang && lang.screen_wallet.table_days
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
              {lang && lang.screen_wallet.table_days
                ? lang.screen_wallet.table_days
                : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wrapperTabView}>
          {Platform.OS === 'android' ? (
            <TabView
              navigationState={{index, routes}}
              renderScene={renderScene}
              onIndexChange={currentIndex => {
                setIndex(currentIndex);
                const key = routes[currentIndex].key;
                onSwipeTransaction(key);
              }}
              initialLayout={{width: layout.width}}
              renderTabBar={renderTabBar}
              lazy
              lazyPreloadDistance={0}
            />
          ) : (
            <>
              <View
                style={{
                  backgroundColor: 'white',
                  elevation: 0,
                  borderBottomColor: '#bbb',
                  borderBottomWidth: 0.5,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  paddingHorizontal: 28,
                  marginTop: 14,
                }}>
                {routes.map((route, index) => {
                  return (
                    <TouchableOpacity
                      style={{
                        borderBottomWidth: currentSwipe === route.key ? 1 : 0,
                        paddingBottom: 10,
                        borderBottomColor: '#383b50',
                        maxWidth: 80,
                      }}
                      onPress={() => {
                        onSwipeTransactionIOS(index);
                        scrollviewRef.current.measure(
                          (x, y, width, height, pageX, pageY) => {
                            switch (route.key) {
                              case 'totalHistory':
                                setContentOffsetX(0);
                                break;
                              case 'transferHistory':
                                setContentOffsetX(width);
                                break;
                              case 'receivedDetails':
                                setContentOffsetX(width * 2);
                                break;
                              case 'transitionHistory':
                                setContentOffsetX(width * 3);
                                break;
                              default:
                                setContentOffsetX(0);
                                break;
                            }
                          },
                        );
                      }}
                      key={route.key}>
                      <Text
                        style={{
                          color:
                            currentSwipe === route.key ? '#383b50' : '#bbb',
                          textAlign: 'center',
                          fontFamily: getFontFam() + 'Regular',
                          fontSize: fontSize('body'),
                        }}>
                        {route.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ScrollView
                showsHorizontalScrollIndicator={false}
                horizontal
                pagingEnabled
                contentOffset={{x: contentOffsetX}}
                style={{flex: 1}}
                ref={scrollviewRef}
                onMomentumScrollEnd={event => {
                  const {contentOffset, layoutMeasurement} = event.nativeEvent;

                  const newIndex = Math.floor(
                    contentOffset.x / layoutMeasurement.width,
                  );
                  setContentOffsetX(contentOffset.x);

                  onSwipeTransactionIOS(index, true, newIndex);
                }}>
                <View style={{width: Dimensions.get('window').width}}>
                  <TotalHistory
                    totalTransaction={totalHistory}
                    setTotalTransaction={setTotalHistory}
                    member={member}
                    currency={currentCurrency}
                    days={currentDaysTransactional}
                    lang={lang}
                    btnSeeMore={btnSeeMore}
                    setSeeMore={setBtnSeeMore}
                    routeSwipe={currentSwipe}
                    defaultLoadData={defaultLoadData}
                    lastPosition={lastPosition}
                    setLastPosition={setLastPosition}
                  />
                </View>
                <View style={{width: Dimensions.get('window').width}}>
                  <TransferHistory
                    totalTransaction={transferHistory}
                    setTotalTransaction={setTransferHistory}
                    member={member}
                    currency={currentCurrency}
                    days={currentDaysTransactional}
                    lang={lang}
                    btnSeeMore={btnSeeMore}
                    setSeeMore={setBtnSeeMore}
                    routeSwipe={currentSwipe}
                    defaultLoadData={defaultLoadData}
                    lastPosition={lastPosition}
                    setLastPosition={setLastPosition}
                  />
                </View>
                <View style={{width: Dimensions.get('window').width}}>
                  <ReceivedDetails
                    totalTransaction={receivedDetails}
                    setTotalTransaction={setReceivedDetails}
                    member={member}
                    currency={currentCurrency}
                    days={currentDaysTransactional}
                    lang={lang}
                    btnSeeMore={btnSeeMore}
                    setSeeMore={setBtnSeeMore}
                    routeSwipe={currentSwipe}
                    defaultLoadData={defaultLoadData}
                    lastPosition={lastPosition}
                    setLastPosition={setLastPosition}
                  />
                </View>
                <View style={{width: Dimensions.get('window').width}}>
                  <TransitionHistory
                    totalTransaction={transitionHistory}
                    setTotalTransaction={setTransitionHistory}
                    member={member}
                    currency={currentCurrency}
                    days={currentDaysTransactional}
                    lang={lang}
                    btnSeeMore={btnSeeMore}
                    setSeeMore={setBtnSeeMore}
                    routeSwipe={currentSwipe}
                    defaultLoadData={defaultLoadData}
                    lastPosition={lastPosition}
                    setLastPosition={setLastPosition}
                  />
                </View>
              </ScrollView>
            </>
          )}
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
    paddingRight: 28,
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('subtitle'),
    color: '#000',
    minWidth: 80,
    textTransform: 'uppercase',
  },
  textHeadDefault: {
    textTransform: 'none',
  },
  contentTextHeadDefault: {
    backgroundColor: 'white',
    maxWidth: 150,
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('subtitle'),
    color: 'black',
    marginBottom: 4,
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
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    maxWidth: 150,
  },
  date: {
    fontSize: fontSize('note'),
    marginTop: 3,
    fontFamily: getFontFam() + 'Regular',
    color: '#aaa',
  },
  wrapperPrice: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  price: {
    fontSize: fontSize('body'),
    fontFamily: getFontFam() + 'Regular',
    color: 'black',
    textAlign: 'right',
  },
  status: {
    color: '#999',
    textAlign: 'right',
    fontSize: fontSize('body'),
  },
  textNotFoundHistory: {
    fontFamily: getFontFam() + 'Regular',
    color: '#ccc',
    textAlign: 'center',
    paddingTop: 20,
    borderBottomColor: '#bbb',
    borderBottomWidth: 0.55,
    paddingBottom: 10,
    fontSize: fontSize('body'),
  },
  btnSeeMore: {
    borderWidth: 1,
    borderColor: '#555',
    padding: 8,
    borderRadius: 99,
  },
  textSeeMore: {
    color: '#555',
    textAlign: 'center',
  },
});
