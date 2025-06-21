import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Linking,
  AppState,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  URL_API_NODEJS,
  getLanguage2,
  getFontFam,
  fontSize,
  authcode,
} from '../../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import crashlytics from '@react-native-firebase/crashlytics';
import FastImage from 'react-native-fast-image';
import WebSocketInstance from '../../../utils/websocketUtils';
import {collectDeviceInfo} from '../../utils/napApiUtils';

const CustomModal = ({visible, text, onOK, textOK}) => {
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{text}</Text>
          <TouchableOpacity onPress={onOK} style={styles.okButton}>
            <Text style={styles.okButtonText}>{textOK}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ShowNapAdScreen = ({route}) => {
  // route.params가 undefined일 때를 대비한 안전한 파라미터 처리
  const params = route?.params || {};
  const {
    screenName = 'Home', // 기본값 설정
    member: routeMember = null, // route에서 전달받은 member
    advertisement = '',
    coin = 0,
    coinScreen = false,
  } = params;

  const [modalVisible, setModalVisible] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTextOK, setModalTextOK] = useState('');
  const [lang, setLang] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [member, setMember] = useState(''); // 기본값 설정
  const [campaignData, setCampaignData] = useState(null); // 캠페인 정보 저장
  const [retryCount, setRetryCount] = useState(0); // 재시도 횟수
  const [maxRetries] = useState(5); // 최대 재시도 횟수
  const [appState, setAppState] = useState(AppState.currentState); // 앱 상태
  const [hasOpenedUrl, setHasOpenedUrl] = useState(false); // URL을 열었는지 여부
  const [showAdCompleteModal, setShowAdCompleteModal] = useState(false); // 광고 완료 모달
  const navigation = useNavigation();

  // AsyncStorage에서 userData를 가져와서 member 추출
  const getUserData = async () => {
    try {
      console.log('=== getUserData 시작 ===');
      const userData = await AsyncStorage.getItem('userData');
      console.log('AsyncStorage에서 가져온 userData:', userData);

      if (userData) {
        const userDataObject = JSON.parse(userData);
        const userMember = userDataObject.member;
        console.log('파싱된 userDataObject:', userDataObject);
        console.log('추출된 member:', userMember);

        setMember(userMember);
        console.log('✅ member 상태 업데이트 완료:', userMember);
        return userMember;
      } else {
        console.log('⚠️ userData가 AsyncStorage에 없음, 기본값 사용: userTest');
        setMember('userTest');
        return 'userTest';
      }
    } catch (error) {
      console.error('❌ userData 가져오기 실패:', error);
      setMember('userTest');
      return 'userTest';
    }
  };

  // 디버깅을 위한 로그 추가
  console.log('ShowNapAdScreen 파라미터:', {
    screenName,
    routeMember,
    advertisement,
    coin,
    coinScreen,
    currentMember: member,
  });

  const handleOKPress = () => {
    setModalVisible(false);

    setTimeout(() => {
      if (coinScreen) {
        navigation.replace(screenName, {
          sendActiveTab: 'Camera',
        });
      } else {
        navigation.replace(screenName);
      }
    }, 600);
  };

  /**
   * 광고 완료 모달 확인 버튼 클릭 시 실행
   */
  const handleAdCompleteOK = () => {
    console.log('광고 완료 확인 버튼 클릭 - 이전 화면으로 이동');
    setShowAdCompleteModal(false);

    // history.back() 대신 navigation.goBack() 사용
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // 이전 화면이 없으면 지정된 화면으로 이동
      if (coinScreen) {
        navigation.replace(screenName, {
          sendActiveTab: 'Camera',
        });
      } else {
        navigation.replace(screenName);
      }
    }
  };

  /**
   * urlAD로 이동하는 함수
   * @param {string} url - 이동할 URL
   */
  const openUrlAD = async url => {
    try {
      console.log('URL 이동 시도:', url);

      // URL이 유효한지 확인
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        console.log('✅ URL 이동 성공');

        // URL을 열었음을 표시
        setHasOpenedUrl(true);
        setIsLoading(false);
      } else {
        console.error('❌ 지원하지 않는 URL:', url);
        throw new Error('지원하지 않는 URL입니다.');
      }
    } catch (error) {
      console.error('❌ URL 이동 실패:', error);
      throw error;
    }
  };

  /**
   * NStation 광고 API 호출
   * @returns {Promise<Object>} API 응답 결과
   */
  const getNasmobAds = async () => {
    try {
      console.log('=== NStation 광고 API 호출 시작 ===');

      // member 값을 직접 AsyncStorage에서 가져오기
      let currentMember = member;
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const userDataObject = JSON.parse(userData);
          currentMember = userDataObject.member;
          console.log(
            'AsyncStorage에서 가져온 member (API 호출용):',
            currentMember,
          );
        } else {
          console.log('userData가 없어 기본값 사용:', currentMember);
        }
      } catch (error) {
        console.error('member 가져오기 실패, 기본값 사용:', currentMember);
      }

      // 디바이스 정보 수집
      const deviceInfo = await collectDeviceInfo();
      console.log('수집된 디바이스 정보:', deviceInfo);

      // API 요청 body 구성
      const requestBody = {
        member: currentMember, // AsyncStorage에서 가져온 최신 member 값 사용
        adid: deviceInfo.adid || '', // ADID
        osver: deviceInfo.osVersion || '', // OS 버전
        ip: deviceInfo.ipAddress || '', // IP
        devid: deviceInfo.deviceId || '', // 디바이스 ID, IMEI
        devmodel: deviceInfo.model || '', // 기기 모델
        devbrand: deviceInfo.manufacturer || '', // 제조사
        mnetwork: deviceInfo.mnetwork || '4', // LTE, 5G 등
        carrier: deviceInfo.carrierCode || '1', // 네트워크 SK, LGU+ 등
      };

      console.log('NStation 광고 API 요청 body:', requestBody);
      console.log('member 값 확인:', {
        상태의member: member,
        API용member: currentMember,
        requestBodyMember: requestBody.member,
      });

      // API 호출
      const response = await fetch(`${URL_API_NODEJS}/getNasmobAds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('NStation 광고 API 응답:', result);

      // API 응답 구조에 맞게 성공/실패 판단
      if (response.ok && result.status === 'success' && result.code === 200) {
        console.log('✅ NStation 광고 API 호출 성공');
        console.log('캠페인 정보:', {
          캠페인ID: result.data?.campid,
          캠페인명: result.data?.name,
          리워드: result.data?.price,
          설명: result.data?.rewarddesc,
          참여설명: result.data?.joindesc,
          아이콘URL: result.data?.iconurl,
          CTVID: result.data?.ctvid,
          사용자정보: result.data?.memberinfo,
          urlAD: result.data?.urlAD,
          urlResult: result.data?.urlResult,
        });

        // urlResult 확인
        const urlResult = result.data?.urlResult;
        const urlAD = result.data?.urlAD;

        console.log('URL 결과 확인:', {
          urlResult: urlResult,
          urlAD: urlAD,
          재시도횟수: retryCount,
        });

        if (urlResult === 200 && urlAD) {
          console.log('✅ URL 성공 - 광고 페이지로 이동');
          // 캠페인 정보를 상태에 저장
          setCampaignData(result.data);

          // urlAD로 이동
          try {
            await openUrlAD(urlAD);
          } catch (urlError) {
            console.error('URL 이동 실패:', urlError);
            throw urlError;
          }

          return result;
        } else {
          console.log('❌ URL 실패 - 재시도 필요');
          throw new Error(`URL 결과 실패: ${urlResult}`);
        }
      } else {
        const errorMessage = result.message || 'NStation 광고 API 호출 실패';
        console.error('❌ NStation 광고 API 실패:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ NStation 광고 API 호출 실패:', error);
      crashlytics().recordError(new Error(error));
      crashlytics().log(error);
      throw error;
    }
  };

  const initNStationAd = async () => {
    try {
      console.log('NStation 광고 초기화 시작');
      setIsLoading(true);

      // NStation 광고 API 호출
      await getNasmobAds();

      // 성공 시 로딩은 openUrlAD에서 처리됨
      console.log('NStation 광고 초기화 성공');
    } catch (error) {
      console.error('NStation 광고 초기화 실패:', error);

      // 재시도 로직
      if (retryCount < maxRetries) {
        console.log(`재시도 ${retryCount + 1}/${maxRetries}`);
        setRetryCount(prev => prev + 1);

        // 2초 후 재시도
        setTimeout(() => {
          initNStationAd();
        }, 2000);
        return;
      }

      // 최대 재시도 횟수 초과
      console.error(`최대 재시도 횟수(${maxRetries}) 초과`);
      setIsLoading(false);

      // 에러 발생 시 사용자에게 알림
      setModalText(
        `광고 로딩 실패: ${error.message}\n\n최대 재시도 횟수를 초과했습니다.`,
      );
      setModalTextOK('확인');
      setModalVisible(true);

      // 에러 발생 시 이전 화면으로 이동
      try {
        if (coinScreen) {
          navigation.replace(screenName, {
            sendActiveTab: 'Camera',
          });
        } else {
          navigation.replace(screenName);
        }
      } catch (navError) {
        console.error('네비게이션 에러:', navError);
        // 최후의 수단으로 Home으로 이동
        navigation.replace('Home');
      }
    }
  };

  useEffect(() => {
    const fetchLanguageData = async () => {
      try {
        const currentLanguage = await AsyncStorage.getItem('currentLanguage');
        const screenLang = await getLanguage2(currentLanguage);
        setLang(screenLang);
      } catch (err) {
        crashlytics().recordError(new Error(err));
        crashlytics().log(err);
        console.error('Error fetching language data:', err);
        navigation.replace('Home');
      }
    };

    const initializeData = async () => {
      try {
        console.log('=== initializeData 시작 ===');

        // 1. AsyncStorage에서 userData 가져오기
        console.log('1. getUserData 실행 중...');
        await getUserData();

        // 2. 언어 데이터 가져오기
        console.log('2. fetchLanguageData 실행 중...');
        await fetchLanguageData();

        // 3. NStation 광고 초기화 (member가 설정된 후)
        console.log('3. initNStationAd 실행 중...');
        await initNStationAd();

        console.log('=== initializeData 완료 ===');
      } catch (error) {
        console.error('initializeData 실패:', error);
      }
    };

    initializeData();
  }, []);

  // 앱 상태 변화 감지
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      console.log('앱 상태 변화:', {
        이전상태: appState,
        현재상태: nextAppState,
        URL열었는지: hasOpenedUrl,
      });

      // 앱이 포그라운드로 돌아왔고, URL을 열었었다면 광고 완료 모달 표시
      if (
        appState.match(/inactive|background/) &&
        nextAppState === 'active' &&
        hasOpenedUrl
      ) {
        console.log('✅ 앱이 포그라운드로 돌아옴 - 광고 완료 모달 표시');
        setShowAdCompleteModal(true);
        setAdCompleted(true);
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
    };
  }, [appState, hasOpenedUrl]);

  // Realtime response listener
  useEffect(() => {
    if (lang?.screen_showad) {
      WebSocketInstance.addListener('app3100-01-response', data => {
        if (data.type === 'app3100-01-response') {
          setIsLoading(false);

          if (data && parseInt(data.data[0].count) === 1) {
            setModalText(lang?.screen_showad?.success);
          } else {
            setModalText(lang?.screen_showad?.failed);
          }

          console.log(
            'Coin acquisition response:',
            JSON.stringify(data.data[0]),
          );
          setModalVisible(true);
          setModalTextOK(lang?.screen_showad?.textOK);
        } else {
          console.log('Unhandled WebSocket message');
        }
      });

      return () => {
        WebSocketInstance.removeListener('app3100-01-response');
      };
    }
  }, [lang]);

  useEffect(() => {
    if (adCompleted) {
      const coinAcquiring = async () => {
        setIsProcessing(true);

        try {
          // member 값을 직접 AsyncStorage에서 가져오기
          let currentMember = member;
          try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              const userDataObject = JSON.parse(userData);
              currentMember = userDataObject.member;
              console.log('WebSocket용 member:', currentMember);
            }
          } catch (error) {
            console.error('WebSocket용 member 가져오기 실패:', error);
          }

          // Coin acquiring
          WebSocketInstance.sendMessage('app3100-01', {
            advertisement: advertisement || '',
            coin: coin || 0,
            member: currentMember, // AsyncStorage에서 가져온 최신 member 값 사용
            campaignId: campaignData?.campid || '',
            campaignName: campaignData?.name || '',
            rewardAmount: campaignData?.price || 0,
          });
        } catch (err) {
          crashlytics().recordError(new Error(err));
          crashlytics().log(err);
          console.error('Error in coin acquisition:', err);

          try {
            if (coinScreen) {
              navigation.replace(screenName, {
                sendActiveTab: 'Camera',
              });
            } else {
              navigation.replace(screenName);
            }
          } catch (navError) {
            console.error('네비게이션 에러:', navError);
            navigation.replace('Home');
          }
        }
      };

      coinAcquiring();
    } else {
      console.log('Ad not completed yet -> ' + adCompleted);
    }
  }, [adCompleted, navigation]);

  return (
    <View
      style={[
        styles.root,
        {backgroundColor: modalVisible ? '#000000A5' : 'white'},
      ]}>
      {(isLoading || isProcessing) && (
        <View style={{alignItems: 'center'}}>
          <FastImage
            style={{width: 150, height: 150}}
            source={{
              uri: 'https://www.xrun.run/assets/video/gif_loader.gif',
              priority: FastImage.priority.high,
            }}
          />
          <Text
            style={{
              fontFamily: getFontFam() + 'Regular',
              fontSize: fontSize('body'),
              color: 'grey',
              textAlign: 'center',
            }}>
            Loading
          </Text>
          {retryCount > 0 && (
            <Text
              style={{
                fontFamily: getFontFam() + 'Regular',
                fontSize: fontSize('note'),
                color: '#388Dc8',
                textAlign: 'center',
                marginTop: 10,
              }}>
              재시도 {retryCount}/{maxRetries}
            </Text>
          )}
        </View>
      )}

      {/* 캠페인 정보 표시 (로딩 완료 후) */}
      {!isLoading && !isProcessing && campaignData && (
        <View style={styles.campaignInfo}>
          <Text style={styles.campaignTitle}>
            {campaignData.name || '캠페인 정보'}
          </Text>
          <Text style={styles.campaignReward}>
            리워드: {campaignData.price || 0} 코인
          </Text>
          <Text style={styles.campaignDesc}>
            {campaignData.rewarddesc || '캠페인 설명'}
          </Text>
        </View>
      )}

      <CustomModal
        visible={modalVisible}
        text={modalText}
        onOK={handleOKPress}
        textOK={modalTextOK}
      />

      {/* 광고 완료 모달 */}
      <Modal transparent animationType="slide" visible={showAdCompleteModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              광고 보기를 완료했습니다!{'\n'}
              확인 버튼을 눌러 이전 화면으로 돌아가세요.
            </Text>
            <TouchableOpacity
              onPress={handleAdCompleteOK}
              style={styles.okButton}>
              <Text style={styles.okButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ShowNapAdScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000A5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    position: 'absolute',
    width: '85%',
    paddingTop: 24,
    marginHorizontal: 'auto',
  },
  modalText: {
    fontSize: fontSize('subtitle'),
    fontFamily: getFontFam() + 'Regular',
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#388Dc8',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    width: 110,
    alignSelf: 'center',
    marginTop: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  okButtonText: {
    fontSize: fontSize('body'),
    fontFamily: getFontFam() + 'Bold',
    color: 'white',
    textAlign: 'center',
  },
  campaignInfo: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 20,
  },
  campaignTitle: {
    fontSize: fontSize('subtitle'),
    fontFamily: getFontFam() + 'Bold',
    marginBottom: 10,
    color: '#343a59',
    textAlign: 'center',
  },
  campaignReward: {
    fontSize: fontSize('body'),
    fontFamily: getFontFam() + 'Medium',
    marginBottom: 10,
    color: '#388Dc8',
    textAlign: 'center',
  },
  campaignDesc: {
    fontSize: fontSize('note'),
    fontFamily: getFontFam() + 'Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});
