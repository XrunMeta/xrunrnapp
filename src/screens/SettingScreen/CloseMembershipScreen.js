import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLanguage2, getFontFam, fontSize} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';
import ButtonNext from '../../components/ButtonNext/ButtonNext';
import IOSButtonFixer from '../../components/IOSButtonFixer';

const CloseMembershipScreen = () => {
  const [lang, setLang] = useState('');
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [checkedRecommendations, setCheckedRecommendations] = useState({});
  const [checkedID, setCheckedID] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDisable, setIsDisable] = useState(true);
  const [isEditableReason, setIsEditableReason] = useState(false);

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

    if (reasonNum === 2) {
      setIsEditableReason(true);

      if (reason == '' && reasonNum === 2) {
        setIsDisable(true);
      } else {
        setIsDisable(false);
      }
    } else {
      setIsEditableReason(false);
    }

    if (updatedCheckedState[reasonNum] == true) {
      setCheckedID(reasonNum);
      if (reasonNum != 2) {
        setIsDisable(false);
      }
    } else {
      setCheckedID(null);
      setIsDisable(true);
      setIsEditableReason(false);
    }
  };

  const inputReason = reason => {
    setReason(reason);

    if (checkedID == 2 && reason != '') {
      setIsDisable(false);
    } else {
      setIsDisable(true);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#343a59" />
            <Text
              style={{
                color: 'white',
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('body'),
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
                  fontFamily: getFontFam() + 'Regular',
                  fontSize: fontSize('subtitle'),
                }}>
                {lang && lang.screen_setting
                  ? lang.screen_setting.close.desc.clo1
                  : ''}
                <Text
                  style={{
                    color: '#ffc404',
                    fontFamily: getFontFam() + 'Medium',
                  }}>
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
                  fontFamily: getFontFam() + 'Regular',
                  fontSize: fontSize('body'),
                  marginTop: 20,
                }}>
                {lang && lang.screen_setting
                  ? lang.screen_setting.close.desc.clo4
                  : ''}
              </Text>
              <Text
                style={{
                  color: '#ffc404',
                  fontFamily: getFontFam() + 'Medium',
                  fontSize: fontSize('body'),
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
                marginTop: 15,
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
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: getFontFam() + 'Regular',
                      fontSize: fontSize('body'),
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
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: getFontFam() + 'Regular',
                      fontSize: fontSize('body'),
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
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: getFontFam() + 'Regular',
                      fontSize: fontSize('body'),
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
                onChangeText={reason => inputReason(reason)}
                placeholder={
                  lang && lang.screen_setting
                    ? lang.screen_setting.close.reason
                    : ''
                }
                placeholderTextColor="#a8a8a7"
                style={styles.input}
                editable={isEditableReason}
              />
            </View>

          <IOSButtonFixer count={5} />
              <ButtonNext onClick={onSaveChange} isDisabled={isDisable} />
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('body'),
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
    fontSize: fontSize('title'),
    fontFamily: getFontFam() + 'Bold',
    color: '#051C60',
    margin: 10,
  },
  // shadow: {
  //   shadowColor: '#000000',
  //   shadowOffset: {
  //     width: 0,
  //     height: 1,
  //   },
  //   shadowOpacity: 0.16,
  //   shadowRadius: 1.51,
  //   elevation: 1,
  // },
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
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: -1,
  },
});

export default CloseMembershipScreen;
