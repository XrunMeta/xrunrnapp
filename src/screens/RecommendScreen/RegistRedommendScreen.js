import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomInput from '../../components/CustomInput';
import {URL_API, getLanguage} from '../../../utils';

const RegistRecommendScreen = () => {
  const [lang, setLang] = useState({});
  const [alert, setAlert] = useState({});
  const navigation = useNavigation();
  const [recID, setRecID] = useState('');
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});

  useEffect(() => {
    // Get Language
    const fetchData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage(
          currentLanguage,
          'screen_recommend',
        );
        const screenAlert = await getLanguage(currentLanguage, 'alert');
        setLang(screenLang);
        setAlert(screenAlert);

        // Get User Data from Asyncstorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);
        setUserData(astorJsonData);
      } catch (err) {
        console.error(
          'Error retrieving selfCoordinate from AsyncStorage:',
          err,
        );
      }
    };

    fetchData();
  }, []);

  const onSaveChange = () => {
    if (recID == '') {
      Alert.alert(
        alert ? alert.title.fail : '',
        lang && lang.add_recommend ? lang.add_recommend.placeholder : '',
      );
    } else {
      const registRecommend = async () => {
        try {
          const apiUrl = `${URL_API}&act=app7410-01&member=${userData.member}&email=${recID}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.data === 'no id') {
            Alert.alert(
              alert ? alert.title.fail : '',
              lang && lang.add_recommend ? lang.add_recommend.not_found : '',
            );

            setRecID('');
          } else if (data.data === 'ok') {
            Alert.alert(
              alert ? alert.title.success : '',
              lang && lang.add_recommend ? lang.add_recommend.recommended : '',
            );

            navigation.replace('InfoHome');
          } else {
            Alert.alert(
              alert ? alert.title.warning : '',
              lang && lang.add_recommend ? lang.add_recommend.already : '',
            );

            navigation.replace('InfoHome');
          }
        } catch (error) {
          console.error('Terjadi kesalahan:', error.message);
        }
      };

      registRecommend();
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.root, {height: ScreenHeight}]}>
      {/* Title */}
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack onClick={handleBack} />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{lang ? lang.title : ''}</Text>
        </View>
      </View>

      <CustomInput
        label={lang && lang.add_recommend ? lang.add_recommend.label : ''}
        placeholder={
          lang && lang.add_recommend ? lang.add_recommend.placeholder : ''
        }
        value={recID}
        setValue={setRecID}
      />

      <View style={[styles.bottomSection]}>
        <View style={styles.additionalLogin}></View>
        <Pressable onPress={onSaveChange} style={styles.buttonSignIn}>
          <Image
            source={require('../../../assets/images/icon_check.png')}
            resizeMode="contain"
            style={styles.buttonSignInImage}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'white',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    width: '100%',
  },
  additionalLogin: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    height: 100,
    flex: 1,
  },
  buttonSignIn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'column-reverse',
    height: 100,
    justifyContent: 'center',
    marginRight: 10,
  },
  buttonSignInImage: {
    height: 80,
    width: 80,
  },
});

export default RegistRecommendScreen;
