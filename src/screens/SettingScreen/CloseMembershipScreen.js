import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLanguage2} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const CloseMembershipScreen = () => {
  const [lang, setLang] = useState('');
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [checkedRecommendations, setCheckedRecommendations] = useState({});
  const [checkedID, setCheckedID] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get Language Data
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);

        // Set your language state
        setLang(screenLang);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error in fetchData:', err);
      }
    };

    fetchData();
    setLoading(false);
  }, []);

  const onSaveChange = () => {
    console.log(checkedID);
    if (checkedID == null) {
      Alert.alert(
        lang && lang.alert ? lang.alert.title.fail : '',
        lang && lang.screen_recommend
          ? lang.screen_recommend.random_recommend.empty
          : '',
      );
    } else {
      console.log(`
        Send Data :
              Checked : ${checkedID}
              Reason  : ${reason}
      `);
      navigation.navigate('CloseConfirm', {
        reasonNum: checkedID,
        reason: reason,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const checkBoxToggle = reasonNum => {
    const updatedCheckedState = {...checkedRecommendations};
    const newCheckedState = !updatedCheckedState[reasonNum];

    // Uncheck all other recommendations
    for (const key in updatedCheckedState) {
      if (key !== reasonNum) {
        updatedCheckedState[key] = false;
      }
    }

    // Check or uncheck the selected recommendation
    updatedCheckedState[reasonNum] = newCheckedState;
    setCheckedRecommendations(updatedCheckedState);

    if (updatedCheckedState[reasonNum] == true) {
      setCheckedID(reasonNum);
    } else {
      setCheckedID(null);
    }
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#343a59" />
          <Text
            style={{
              color: 'white',
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
            }}>
            {lang && lang.screen_map && lang.screen_map.section_marker
              ? lang.screen_map.section_marker.loader
              : ''}
          </Text>
          {/* Show Loading While Data is Load */}
        </View>
      ) : (
        <View style={{flex: 1, width: '100%'}}>
          {/* Title */}
          <View style={{flexDirection: 'row'}}>
            <View style={{position: 'absolute', zIndex: 1}}>
              <ButtonBack onClick={handleBack} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>
                {lang && lang.screen_setting
                  ? lang.screen_setting.close.title
                  : ''}
              </Text>
            </View>
          </View>

          <View
            style={{
              width: '100%',
              marginTop: 30,
              paddingHorizontal: 20,
            }}>
            <Text
              style={{
                color: 'black',
                fontFamily: 'Poppins-Regular',
                fontSize: 16,
              }}>
              {lang && lang.screen_setting
                ? lang.screen_setting.close.desc.clo1 + ' '
                : ''}
              <Text style={{color: '#ffc404', fontFamily: 'Poppins-Medium'}}>
                {lang && lang.screen_setting
                  ? lang.screen_setting.close.desc.clo2
                  : ''}
              </Text>
              {lang && lang.screen_setting
                ? lang.screen_setting.close.desc.clo3
                : ''}
            </Text>
            <Text
              style={{
                color: 'black',
                fontFamily: 'Poppins-Regular',
                fontSize: 13,
                marginTop: 15,
              }}>
              {lang && lang.screen_setting
                ? lang.screen_setting.close.desc.clo4
                : ''}
            </Text>
            <Text
              style={{
                color: '#ffc404',
                fontFamily: 'Poppins-Medium',
                fontSize: 13,
                marginTop: -2,
              }}>
              {lang && lang.screen_setting
                ? lang.screen_setting.close.desc.clo5
                : ''}
            </Text>
          </View>

          <View
            style={{
              paddingVertical: 10,
              width: '100%',
              marginTop: 10,
            }}>
            {/* Service Difficult */}
            <TouchableOpacity
              activeOpacity={1}
              key={0}
              onPress={() => checkBoxToggle(0)}
              style={{
                backgroundColor: 'white',
                paddingRight: 12,
                paddingLeft: 7,
                marginHorizontal: 8,
                borderRadius: 10,
                ...styles.shadow,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  marginHorizontal: 5,
                }}>
                <View
                  style={[
                    styles.checkbox,
                    checkedRecommendations[0]
                      ? styles.checkedBox
                      : styles.uncheckedBox,
                  ]}>
                  {checkedRecommendations[0] && (
                    <Text style={styles.checkMark}>✔</Text>
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 13,
                    color: 'black',
                    paddingVertical: 5,
                  }}>
                  {lang && lang.screen_setting
                    ? lang.screen_setting.close.select.sel1
                    : ''}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Function Difficult */}
            <TouchableOpacity
              activeOpacity={1}
              key={1}
              onPress={() => checkBoxToggle(1)}
              style={{
                backgroundColor: 'white',
                paddingRight: 12,
                paddingLeft: 7,
                marginHorizontal: 8,
                borderRadius: 10,
                ...styles.shadow,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  marginHorizontal: 5,
                }}>
                <View
                  style={[
                    styles.checkbox,
                    checkedRecommendations[1]
                      ? styles.checkedBox
                      : styles.uncheckedBox,
                  ]}>
                  {checkedRecommendations[1] && (
                    <Text style={styles.checkMark}>✔</Text>
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 13,
                    color: 'black',
                    paddingVertical: 5,
                  }}>
                  {lang && lang.screen_setting
                    ? lang.screen_setting.close.select.sel2
                    : ''}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Etc */}
            <TouchableOpacity
              activeOpacity={1}
              key={2}
              onPress={() => checkBoxToggle(2)}
              style={{
                backgroundColor: 'white',
                paddingRight: 12,
                paddingLeft: 7,
                marginHorizontal: 8,
                borderRadius: 10,
                ...styles.shadow,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  marginHorizontal: 5,
                }}>
                <View
                  style={[
                    styles.checkbox,
                    checkedRecommendations[2]
                      ? styles.checkedBox
                      : styles.uncheckedBox,
                  ]}>
                  {checkedRecommendations[2] && (
                    <Text style={styles.checkMark}>✔</Text>
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 13,
                    color: 'black',
                    paddingVertical: 5,
                  }}>
                  {lang && lang.screen_setting
                    ? lang.screen_setting.close.select.sel3
                    : ''}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Close Reason */}
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder={
                lang && lang.screen_setting
                  ? lang.screen_setting.close.reason
                  : ''
              }
              placeholderTextColor="#a8a8a7"
              style={styles.input}
            />
          </View>

          <View style={[styles.bottomSection]}>
            <View style={styles.additionalLogin}></View>
            <Pressable onPress={onSaveChange} style={styles.buttonSignIn}>
              <Image
                source={require('../../../assets/images/icon_next.png')}
                resizeMode="contain"
                style={styles.buttonSignInImage}
              />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  input: {
    height: 40,
    paddingBottom: -10,
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#343a59',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    paddingRight: 30,
    paddingLeft: -10,
    marginHorizontal: 20,
    marginTop: -5,
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
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#051C60',
    margin: 10,
  },
  bottomSection: {
    padding: 5,
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    justifyContent: 'center',
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
  shadow: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 1,
    shadowRadius: 3.5,
    // elevation: 2,
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
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: -1,
  },
});

export default CloseMembershipScreen;
