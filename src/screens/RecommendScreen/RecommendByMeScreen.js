import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import ButtonBack from '../../components/ButtonBack';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getLanguage2,
  getFontFam,
  fontSize,
  gatewayNodeJS,
} from '../../../utils';
import crashlytics from '@react-native-firebase/crashlytics';

const RecommendByMeScreen = () => {
  const [lang, setLang] = useState({});
  const navigation = useNavigation();
  let ScreenHeight = Dimensions.get('window').height;
  const [userData, setUserData] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true); // Tambahkan state loading

  useEffect(() => {
    const fetchDataAndRecommendations = async () => {
      try {
        setLoading(true); // Mulai loading

        // Get Language
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);

        // Get User Data from AsyncStorage
        const astorUserData = await AsyncStorage.getItem('userData');
        const astorJsonData = JSON.parse(astorUserData);
        setUserData(astorJsonData);

        // Fetch Recommendations if userData is available
        if (astorJsonData?.member) {
          const body = {
            member: astorJsonData.member,
          };

          const result = await gatewayNodeJS(
            'getRecommendedToMe',
            'POST',
            body,
          );
          const data = result.data;

          console.log({data});

          if (result.status === 'success') {
            setRecommendations(data);
          }
        }
      } catch (error) {
        console.error('Error during fetching data and recommendations:', error);
        crashlytics().recordError(new Error(error));
        crashlytics().log(error);
      } finally {
        setLoading(false); // Selesai loading
      }
    };

    fetchDataAndRecommendations();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={[styles.root, {height: ScreenHeight}]}>
        {/* Title */}
        <View style={{flexDirection: 'row'}}>
          <View style={{position: 'absolute', zIndex: 1}}>
            <ButtonBack onClick={handleBack} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>
              {lang && lang.screen_recommend && lang.screen_recommend.category
                ? lang.screen_recommend.category.recomByMe
                : ''}
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingVertical: 10,
            flex: 1,
            width: '100%',
          }}>
          {loading ? ( // Tampilkan loading indicator jika loading
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : recommendations.length > 0 ? ( // Jika data ada, tampilkan daftar rekomendasi
            <ScrollView showsVerticalScrollIndicator={false}>
              {recommendations.map(item => (
                <View
                  key={item.email}
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 12,
                    marginHorizontal: 8,
                    borderRadius: 10,
                    marginVertical: 4,
                    ...styles.shadow,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      marginHorizontal: 5,
                    }}>
                    <Text
                      style={{
                        fontFamily: getFontFam() + 'Regular',
                        fontSize: fontSize('body'),
                        color: 'black',
                        paddingVertical: 18,
                      }}>
                      {item.masked_email}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            // Jika data kosong, tampilkan teks di tengah layar
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {lang &&
                lang.screen_recommend &&
                lang.screen_recommend.recomByMe
                  ? lang.screen_recommend.recomByMe.empty
                  : 'Your email has not been recommended by anyone'}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
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
  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.51,
    elevation: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize('body'),
    fontFamily: getFontFam() + 'Regular',
    color: 'gray',
  },
});

export default RecommendByMeScreen;
