import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import {useNap} from '../../context/NapContext';

const NapCampaignExample = () => {
  const {
    deviceInfo,
    campaigns,
    loading,
    error,
    joinCampaign,
    fetchCampaigns,
    fetchCampaignDetail,
    getParticipationRecords,
    refreshDeviceInfo,
    clearError,
  } = useNap();

  const [participationRecords, setParticipationRecords] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [userAge, setUserAge] = useState('22');
  const [userGender, setUserGender] = useState('1');
  const [userId, setUserId] = useState('3016VVC');

  useEffect(() => {
    loadParticipationRecords();
  }, []);

  const loadParticipationRecords = async () => {
    try {
      const records = await getParticipationRecords();
      setParticipationRecords(records);
    } catch (error) {
      console.error('참여 기록 로드 실패:', error);
    }
  };

  const handleJoinCampaign = async () => {
    try {
      if (!selectedCampaignId) {
        Alert.alert('오류', '캠페인을 선택해주세요.');
        return;
      }

      const userInfo = {
        age: userAge,
        gender: userGender,
      };

      const result = await joinCampaign(selectedCampaignId, userId, userInfo);

      // lurl이 있으면 브라우저로 열기
      if (result.lurl) {
        Alert.alert('캠페인 참여 성공!', '광고 페이지를 열까요?', [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '열기',
            onPress: () => {
              Linking.openURL(result.lurl);
            },
          },
        ]);
      } else {
        Alert.alert('성공', '캠페인 참여가 완료되었습니다!');
      }

      // 참여 기록 새로고침
      await loadParticipationRecords();
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  const handleFetchCampaigns = async () => {
    try {
      const campaignList = await fetchCampaigns();
      Alert.alert('성공', `${campaignList.length}개의 캠페인을 찾았습니다.`);
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  const handleRefreshDeviceInfo = async () => {
    try {
      await refreshDeviceInfo();
      Alert.alert('성공', '디바이스 정보가 새로고침되었습니다.');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  const handleClearError = () => {
    clearError();
  };

  const handleCampaignSelect = campaignId => {
    setSelectedCampaignId(campaignId);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>NStation API 테스트</Text>

      {/* 로딩 상태 */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      )}

      {/* 에러 표시 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>에러: {error}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={handleClearError}>
            <Text style={styles.errorButtonText}>에러 지우기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 사용자 정보 입력 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>사용자 정보</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>사용자 ID:</Text>
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            placeholder="사용자 ID 입력"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>나이:</Text>
          <TextInput
            style={styles.input}
            value={userAge}
            onChangeText={setUserAge}
            placeholder="나이 입력"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>성별:</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userGender === '1' && styles.genderButtonActive,
              ]}
              onPress={() => setUserGender('1')}>
              <Text
                style={[
                  styles.genderButtonText,
                  userGender === '1' && styles.genderButtonTextActive,
                ]}>
                남성
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                userGender === '2' && styles.genderButtonActive,
              ]}
              onPress={() => setUserGender('2')}>
              <Text
                style={[
                  styles.genderButtonText,
                  userGender === '2' && styles.genderButtonTextActive,
                ]}>
                여성
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 디바이스 정보 표시 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>디바이스 정보</Text>
        {deviceInfo ? (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              디바이스 ID: {deviceInfo.deviceId}
            </Text>
            <Text style={styles.infoText}>모델: {deviceInfo.model}</Text>
            <Text style={styles.infoText}>
              제조사: {deviceInfo.manufacturer}
            </Text>
            <Text style={styles.infoText}>OS 버전: {deviceInfo.osVersion}</Text>
            <Text style={styles.infoText}>
              네트워크: {deviceInfo.networkType}
            </Text>
            <Text style={styles.infoText}>
              네트워크 코드: {deviceInfo.mnetwork}
            </Text>
            <Text style={styles.infoText}>IP 주소: {deviceInfo.ipAddress}</Text>
            <Text style={styles.infoText}>캐리어: {deviceInfo.carrier}</Text>
            <Text style={styles.infoText}>
              캐리어 코드: {deviceInfo.carrierCode}
            </Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>디바이스 정보가 없습니다.</Text>
        )}
      </View>

      {/* 액션 버튼들 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>액션</Text>

        <TouchableOpacity style={styles.button} onPress={handleFetchCampaigns}>
          <Text style={styles.buttonText}>캠페인 목록 조회</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRefreshDeviceInfo}>
          <Text style={styles.buttonText}>디바이스 정보 새로고침</Text>
        </TouchableOpacity>
      </View>

      {/* 캠페인 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          캠페인 목록 ({campaigns.length})
        </Text>
        {campaigns.length > 0 ? (
          campaigns.map((campaign, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.campaignItem,
                selectedCampaignId === campaign.campid.toString() &&
                  styles.campaignItemSelected,
              ]}
              onPress={() => handleCampaignSelect(campaign.campid.toString())}>
              <Text style={styles.campaignTitle}>{campaign.name}</Text>
              <Text style={styles.campaignText}>ID: {campaign.campid}</Text>
              <Text style={styles.campaignText}>
                리워드: {campaign.price}원
              </Text>
              <Text style={styles.campaignText}>
                설명: {campaign.rewarddesc}
              </Text>
              <Text style={styles.campaignText}>
                참여방법: {campaign.joindesc}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>캠페인이 없습니다.</Text>
        )}
      </View>

      {/* 캠페인 참여 버튼 */}
      {selectedCampaignId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>선택된 캠페인</Text>
          <Text style={styles.selectedCampaignText}>
            캠페인 ID: {selectedCampaignId}
          </Text>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinCampaign}>
            <Text style={styles.joinButtonText}>캠페인 참여하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 참여 기록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          참여 기록 ({participationRecords.length})
        </Text>
        {participationRecords.length > 0 ? (
          participationRecords.map((record, index) => (
            <View key={index} style={styles.recordItem}>
              <Text style={styles.recordText}>
                캠페인 ID: {record.campaignId}
              </Text>
              <Text style={styles.recordText}>사용자 ID: {record.userId}</Text>
              <Text style={styles.recordText}>
                나이: {record.userInfo?.age || 'N/A'}
              </Text>
              <Text style={styles.recordText}>
                성별: {record.userInfo?.gender === '1' ? '남성' : '여성'}
              </Text>
              <Text style={styles.recordText}>
                참여 시간: {new Date(record.timestamp).toLocaleString()}
              </Text>
              {record.result?.lurl && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(record.result.lurl)}>
                  <Text style={styles.linkButtonText}>광고 링크 열기</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>참여 기록이 없습니다.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 8,
  },
  errorButton: {
    backgroundColor: '#c62828',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  errorButtonText: {
    color: 'white',
    fontSize: 12,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#333',
  },
  genderButtonTextActive: {
    color: 'white',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  campaignItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  campaignItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  campaignText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  selectedCampaignText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recordItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  recordText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  linkButton: {
    backgroundColor: '#17a2b8',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NapCampaignExample;
