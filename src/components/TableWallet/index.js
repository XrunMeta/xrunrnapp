import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {
  funcReceivedDetails,
  funcTotalHistory,
  funcTransferHistory,
  funcTransitionHistory,
  loadMore,
  getFontFam,
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
const TotalHistory = ({
  routeSwipe,
  totalTransaction,
  setTotalTransaction,
  member,
  currency,
  days,
  lang,
  seeMore,
  setSeeMore,
  defaultLoadData,
  lastPosition,
  setLastPosition,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (totalTransaction.length > 0) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 100);
  }, [totalTransaction]);
  return (
    <ScrollView
      style={{paddingHorizontal: 28}}
      overScrollMode="never"
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

            let action;
            let extracode;

            switch (tempAction) {
              case '3304':
                action =
                  lang && lang.screen_wallet.history_action3304
                    ? lang.screen_wallet.history_action3304
                    : '';
                break;
              case '3651':
                action =
                  lang && lang.screen_wallet.history_action3651
                    ? lang.screen_wallet.history_action3651
                    : '';
                break;
              case '3305':
                action =
                  lang && lang.screen_wallet.history_action3305
                    ? lang.screen_wallet.history_action3305
                    : '';
                break;
              case '3306':
                action =
                  lang && lang.screen_wallet.history_action3306
                    ? lang.screen_wallet.history_action3306
                    : '';
                break;
              case '3307':
                action =
                  lang && lang.screen_wallet.history_action3307
                    ? lang.screen_wallet.history_action3307
                    : '';
                break;
              case '3308':
                action =
                  lang && lang.screen_wallet.history_action3308
                    ? lang.screen_wallet.history_action3308
                    : '';
                break;
              default:
                action =
                  lang && lang.screen_wallet.history_action3305
                    ? lang.screen_wallet.history_action3305
                    : '';
                break;
            }

            switch (tempExtracode) {
              case '9453':
                extracode =
                  lang && lang.screen_wallet.history_extracode9453
                    ? lang.screen_wallet.history_extracode9453
                    : '';
                break;
              case '9416':
                extracode = '-';
                break;
              case '9001':
                extracode =
                  lang && lang.screen_wallet.history_extracode9001
                    ? lang.screen_wallet.history_extracode9001
                    : '';
                break;
              case '9002':
                extracode =
                  lang && lang.screen_wallet.history_extracode9002
                    ? lang.screen_wallet.history_extracode9002
                    : '';
                break;
              default:
                extracode =
                  lang && lang.screen_wallet.history_extracodesuccess
                    ? lang.screen_wallet.history_extracodesuccess
                    : '';
                break;
            }

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

          {seeMore && totalTransaction.length > defaultLoadData && (
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
      ) : loading ? (
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
  routeSwipe,
  totalTransaction,
  setTotalTransaction,
  member,
  currency,
  days,
  lang,
  seeMore,
  setSeeMore,
  defaultLoadData,
  lastPosition,
  setLastPosition,
}) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      if (totalTransaction.length > 0) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 100);
  }, [totalTransaction]);

  return (
    <ScrollView
      style={{paddingHorizontal: 28}}
      overScrollMode="never"
      contentOffset={{y: lastPosition}}>
      {totalTransaction.length > 0 ? (
        <>
          {totalTransaction.map((item, index) => {
            const {datetime, time, amount, symbol, action: tempAction} = item;

            let action;
            let extracode;

            switch (tempAction) {
              case '3304':
                action =
                  lang && lang.screen_wallet.history_action3304
                    ? lang.screen_wallet.history_action3304
                    : '';
                break;
              case '3651':
                action =
                  lang && lang.screen_wallet.history_action3651
                    ? lang.screen_wallet.history_action3651
                    : '';
                break;
              case '3305':
                action =
                  lang && lang.screen_wallet.history_action3305
                    ? lang.screen_wallet.history_action3305
                    : '';
                break;
              case '3306':
                action =
                  lang && lang.screen_wallet.history_action3306
                    ? lang.screen_wallet.history_action3306
                    : '';
                break;
              case '3307':
                action =
                  lang && lang.screen_wallet.history_action3307
                    ? lang.screen_wallet.history_action3307
                    : '';
                break;
              case '3308':
                action =
                  lang && lang.screen_wallet.history_action3308
                    ? lang.screen_wallet.history_action3308
                    : '';
                break;
              default:
                action =
                  lang && lang.screen_wallet.history_action3305
                    ? lang.screen_wallet.history_action3305
                    : '';
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
          })}

          {seeMore && totalTransaction.length > defaultLoadData && (
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
      ) : loading ? (
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
  routeSwipe,
  totalTransaction,
  setTotalTransaction,
  member,
  currency,
  days,
  lang,
  seeMore,
  setSeeMore,
  defaultLoadData,
  lastPosition,
  setLastPosition,
}) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      if (totalTransaction.length > 0) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 100);
  }, [totalTransaction]);

  return (
    <ScrollView
      style={{paddingHorizontal: 28}}
      overScrollMode="never"
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

            let action;
            let extracode;

            switch (tempAction) {
              case '3304':
                action =
                  lang && lang.screen_wallet.history_action3304
                    ? lang.screen_wallet.history_action3304
                    : '';
                break;
              case '3651':
                action =
                  lang && lang.screen_wallet.history_action3651
                    ? lang.screen_wallet.history_action3651
                    : '';
                break;
              case '3305':
                action =
                  lang && lang.screen_wallet.history_action3305
                    ? lang.screen_wallet.history_action3305
                    : '';
                break;
              case '3306':
                action =
                  lang && lang.screen_wallet.history_action3306
                    ? lang.screen_wallet.history_action3306
                    : '';
                break;
              case '3307':
                action =
                  lang && lang.screen_wallet.history_action3307
                    ? lang.screen_wallet.history_action3307
                    : '';
                break;
              case '3308':
                action =
                  lang && lang.screen_wallet.history_action3308
                    ? lang.screen_wallet.history_action3308
                    : '';
                break;
              default:
                action =
                  lang && lang.screen_wallet.history_action3305
                    ? lang.screen_wallet.history_action3305
                    : '';
                break;
            }

            switch (tempExtracode) {
              case '9453':
                extracode =
                  lang && lang.screen_wallet.history_extracode9453
                    ? lang.screen_wallet.history_extracode9453
                    : '';
                break;
              case '9416':
                extracode = '-';
                break;
              case '9001':
                extracode =
                  lang && lang.screen_wallet.history_extracode9001
                    ? lang.screen_wallet.history_extracode9001
                    : '';
                break;
              case '9002':
                extracode =
                  lang && lang.screen_wallet.history_extracode9002
                    ? lang.screen_wallet.history_extracode9002
                    : '';
                break;
              default:
                extracode =
                  lang && lang.screen_wallet.history_extracodesuccess
                    ? lang.screen_wallet.history_extracodesuccess
                    : '';
                break;
            }

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

          {seeMore && totalTransaction.length > defaultLoadData && (
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
      ) : loading ? (
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
  routeSwipe,
  totalTransaction,
  setTotalTransaction,
  member,
  currency,
  days,
  lang,
  seeMore,
  setSeeMore,
  defaultLoadData,
  lastPosition,
  setLastPosition,
}) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      if (totalTransaction.length > 0) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 100);
  }, [totalTransaction]);

  return (
    <ScrollView
      style={{paddingHorizontal: 28}}
      overScrollMode="never"
      contentOffset={{y: lastPosition}}>
      {totalTransaction.length > 0 ? (
        <>
          {totalTransaction.map((item, index) => {
            const {datetime, time, amount, symbol, action: tempAction} = item;

            let action;
            let extracode;

            switch (tempAction) {
              case '3304':
                action =
                  lang && lang.screen_wallet.history_action3304
                    ? lang.screen_wallet.history_action3304
                    : '';
                break;
              case '3651':
                action =
                  lang && lang.screen_wallet.history_action3651
                    ? lang.screen_wallet.history_action3651
                    : '';
                break;
              case '3305':
                action =
                  lang && lang.screen_wallet.history_action3305
                    ? lang.screen_wallet.history_action3305
                    : '';
                break;
              case '3306':
                action =
                  lang && lang.screen_wallet.history_action3306
                    ? lang.screen_wallet.history_action3306
                    : '';
                break;
              case '3307':
                action =
                  lang && lang.screen_wallet.history_action3307
                    ? lang.screen_wallet.history_action3307
                    : '';
                break;
              case '3308':
                action =
                  lang && lang.screen_wallet.history_action3308
                    ? lang.screen_wallet.history_action3308
                    : '';
                break;
              default:
                action =
                  lang && lang.screen_wallet.history_action3305
                    ? lang.screen_wallet.history_action3305
                    : '';
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
          })}

          {seeMore && totalTransaction.length > defaultLoadData && (
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
      ) : loading ? (
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

const TableWalletCard = ({
  member,
  dataWallet,
  currentCurrency,
  lang,
  setEmptyWallet,
  route,
}) => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [currentDaysTransactional, setCurrentDaysTransactional] = useState(7);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([]);
  const [currentSwipe, setCurrentSwipe] = useState('totalHistory');

  // Transaction
  const defaultLoadData = 100;
  const [seeMore, setBtnSeeMore] = useState(true);
  const [lastPosition, setLastPosition] = useState(0);
  const [totalHistoryLength, setTotalHistoryLength] = useState(0);

  // Detail Transaction
  const [totalHistory, setTotalHistory] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [receivedDetails, setReceivedDetails] = useState([]);
  const [transitionHistory, setTransitionHistory] = useState([]);

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

  // Hit API for transaction if user change days
  useEffect(() => {
    const funcTransaction = async () => {
      try {
        if (member !== '') {
          if (routes.length > 0) {
            const key = routes[index].key;
            getDataTransaction(key);
          }
        }
      } catch (err) {
        console.log(`Failed get transaction: ${err}`);
        Alert.alert('', `Failed get transaction: ${err}`);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    funcTransaction();
  }, [member, currentCurrency, currentDaysTransactional]);

  useEffect(() => {
    if (totalHistoryLength === 0 && currentCurrency == 1) {
      setEmptyWallet(true);
    } else {
      setEmptyWallet(false);
    }
  }, [totalHistoryLength]);

  const renderScene = SceneMap({
    totalHistory: () => (
      <TotalHistory
        totalTransaction={totalHistory}
        setTotalTransaction={setTotalHistory}
        member={member}
        currency={currentCurrency}
        days={currentDaysTransactional}
        lang={lang}
        seeMore={seeMore}
        setSeeMore={setBtnSeeMore}
        routeSwipe={currentSwipe}
        defaultLoadData={defaultLoadData}
        lastPosition={lastPosition}
        setLastPosition={setLastPosition}
      />
    ),
    transferHistory: () => (
      <TransferHistory
        totalTransaction={transferHistory}
        setTotalTransaction={setTransferHistory}
        member={member}
        currency={currentCurrency}
        days={currentDaysTransactional}
        lang={lang}
        seeMore={seeMore}
        setSeeMore={setBtnSeeMore}
        routeSwipe={currentSwipe}
        defaultLoadData={defaultLoadData}
        lastPosition={lastPosition}
        setLastPosition={setLastPosition}
      />
    ),
    receivedDetails: () => (
      <ReceivedDetails
        totalTransaction={receivedDetails}
        setTotalTransaction={setReceivedDetails}
        member={member}
        currency={currentCurrency}
        days={currentDaysTransactional}
        lang={lang}
        seeMore={seeMore}
        setSeeMore={setBtnSeeMore}
        routeSwipe={currentSwipe}
        defaultLoadData={defaultLoadData}
        lastPosition={lastPosition}
        setLastPosition={setLastPosition}
      />
    ),
    transitionHistory: () => (
      <TransitionHistory
        totalTransaction={transitionHistory}
        setTotalTransaction={setTransitionHistory}
        member={member}
        currency={currentCurrency}
        days={currentDaysTransactional}
        lang={lang}
        seeMore={seeMore}
        setSeeMore={setBtnSeeMore}
        routeSwipe={currentSwipe}
        defaultLoadData={defaultLoadData}
        lastPosition={lastPosition}
        setLastPosition={setLastPosition}
      />
    ),
  });

  useEffect(() => {
    const getDefaultDataTransaction = async () => {
      try {
        const totalHistory = await funcTotalHistory(
          undefined,
          undefined,
          member,
          1,
          30,
        );

        setTotalHistoryLength(totalHistory.length);
      } catch (err) {
        console.log(err);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
      }
    };

    if (member !== '') {
      getDefaultDataTransaction();
    }
  }, [member]);

  // Function for hit API transaction
  const getDataTransaction = useMemo(() => {
    return async key => {
      try {
        setTotalHistory([]);
        setTransferHistory([]);
        setReceivedDetails([]);
        setTransitionHistory([]);

        switch (key) {
          case 'totalHistory':
            const totalHistory = await funcTotalHistory(
              undefined,
              undefined,
              member,
              currentCurrency,
              currentDaysTransactional,
            );

            setLastPosition(0);
            setBtnSeeMore(true);
            setTotalHistory(totalHistory);
            break;
          case 'transferHistory':
            const transferHistory = await funcTransferHistory(
              undefined,
              undefined,
              member,
              currentCurrency,
              currentDaysTransactional,
            );

            setLastPosition(0);
            setBtnSeeMore(true);
            setTransferHistory(transferHistory);
            break;
          case 'receivedDetails':
            const receivedDetails = await funcReceivedDetails(
              undefined,
              undefined,
              member,
              currentCurrency,
              currentDaysTransactional,
            );

            setLastPosition(0);
            setBtnSeeMore(true);
            setReceivedDetails(receivedDetails);
            break;
          case 'transitionHistory':
            const transitionHistory = await funcTransitionHistory(
              undefined,
              undefined,
              member,
              currentCurrency,
              currentDaysTransactional,
            );

            setLastPosition(0);
            setBtnSeeMore(true);
            setTransitionHistory(transitionHistory);
            break;
          default:
            console.log(`Failed get transaction ${key}: ${err}`);
            Alert.alert('', `Failed get transaction ${key}: ${err}`);
            break;
        }
      } catch (err) {
        console.log(`Failed get transaction ${key}: ${err}`);
        Alert.alert('', `Failed get transaction ${key}: ${err}`);
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
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
  const onSwipeTransaction = async key => {
    setCurrentSwipe(key);
    getDataTransaction(key);
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
                {lang && lang.screen_wallet.table_head_send
                  ? lang.screen_wallet.table_head_send
                  : ''}
              </Text>
            </TouchableOpacity>

            {currentCurrency === '1' ? (
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
          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{width: layout.width}}
            renderTabBar={renderTabBar}
            onSwipeEnd={() => {
              const key = routes[index].key;
              onSwipeTransaction(key);
            }}
            lazy
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
    fontSize: 15,
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
    fontSize: 13,
    maxWidth: 150,
  },
  date: {
    fontSize: 11,
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
    fontSize: 13,
    fontFamily: getFontFam() + 'Regular',
    color: 'black',
    textAlign: 'right',
  },
  status: {
    color: '#999',
    textAlign: 'right',
    fontSize: 13,
  },
  textNotFoundHistory: {
    fontFamily: getFontFam() + 'Regular',
    color: '#ccc',
    textAlign: 'center',
    paddingTop: 20,
    borderBottomColor: '#bbb',
    borderBottomWidth: 0.55,
    paddingBottom: 10,
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
