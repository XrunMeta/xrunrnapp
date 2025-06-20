import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collectDeviceInfo,
  sendCampaignJoinRequest,
  getCampaignList,
  getCampaignDetail,
} from '../../utils/napApiUtils';

const NapContext = createContext();

export const NapProvider = ({children}) => {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 앱 시작 시 디바이스 정보 수집 및 저장
  useEffect(() => {
    initializeDeviceInfo();
  }, []);

  /**
   * 디바이스 정보 초기화
   */
  const initializeDeviceInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // AsyncStorage에서 저장된 디바이스 정보 확인
      const savedDeviceInfo = await AsyncStorage.getItem('napDeviceInfo');

      if (savedDeviceInfo) {
        const parsedInfo = JSON.parse(savedDeviceInfo);
        // 24시간이 지났으면 다시 수집
        const isExpired =
          Date.now() - parsedInfo.timestamp * 1000 > 24 * 60 * 60 * 1000;

        if (!isExpired) {
          setDeviceInfo(parsedInfo);
          console.log('저장된 디바이스 정보 사용:', parsedInfo);
          return;
        }
      }

      // 새로운 디바이스 정보 수집
      const newDeviceInfo = await collectDeviceInfo();
      setDeviceInfo(newDeviceInfo);

      // AsyncStorage에 저장
      await AsyncStorage.setItem(
        'napDeviceInfo',
        JSON.stringify(newDeviceInfo),
      );
      console.log('새로운 디바이스 정보 저장 완료');
    } catch (error) {
      console.error('디바이스 정보 초기화 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 캠페인 참여 요청
   * @param {string} campaignId - 캠페인 ID
   * @param {string} userId - 사용자 ID
   * @param {Object} userInfo - 사용자 추가 정보 (age, gender 등)
   * @returns {Promise<Object>} 참여 결과 (lurl 포함)
   */
  const joinCampaign = async (campaignId, userId, userInfo = {}) => {
    try {
      setLoading(true);
      setError(null);

      if (!deviceInfo) {
        throw new Error('디바이스 정보가 없습니다. 앱을 재시작해주세요.');
      }

      const result = await sendCampaignJoinRequest(
        campaignId,
        userId,
        userInfo,
      );

      // 참여 기록을 AsyncStorage에 저장
      const participationRecord = {
        campaignId,
        userId,
        timestamp: Date.now(),
        deviceInfo: deviceInfo,
        userInfo: userInfo,
        result: result, // lurl 포함된 전체 결과 저장
      };

      const existingRecords = await AsyncStorage.getItem(
        'napParticipationRecords',
      );
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      records.push(participationRecord);
      await AsyncStorage.setItem(
        'napParticipationRecords',
        JSON.stringify(records),
      );

      return result;
    } catch (error) {
      console.error('캠페인 참여 실패:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 캠페인 목록 조회
   * @returns {Promise<Array>} 캠페인 목록
   */
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const campaignList = await getCampaignList();
      setCampaigns(campaignList);
      return campaignList;
    } catch (error) {
      console.error('캠페인 목록 조회 실패:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 캠페인 상세 정보 조회
   * @param {string} campaignId - 캠페인 ID
   * @returns {Promise<Object>} 캠페인 상세 정보
   */
  const fetchCampaignDetail = async campaignId => {
    try {
      setLoading(true);
      setError(null);

      const campaignDetail = await getCampaignDetail(campaignId);
      return campaignDetail;
    } catch (error) {
      console.error('캠페인 상세 정보 조회 실패:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 참여 기록 조회
   * @returns {Promise<Array>} 참여 기록 목록
   */
  const getParticipationRecords = async () => {
    try {
      const records = await AsyncStorage.getItem('napParticipationRecords');
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('참여 기록 조회 실패:', error);
      return [];
    }
  };

  /**
   * 디바이스 정보 새로고침
   */
  const refreshDeviceInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const newDeviceInfo = await collectDeviceInfo();
      setDeviceInfo(newDeviceInfo);

      await AsyncStorage.setItem(
        'napDeviceInfo',
        JSON.stringify(newDeviceInfo),
      );
      console.log('디바이스 정보 새로고침 완료');
    } catch (error) {
      console.error('디바이스 정보 새로고침 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 에러 초기화
   */
  const clearError = () => {
    setError(null);
  };

  const contextValue = {
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
    initializeDeviceInfo,
  };

  return (
    <NapContext.Provider value={contextValue}>{children}</NapContext.Provider>
  );
};

export const useNap = () => {
  const context = useContext(NapContext);
  if (!context) {
    throw new Error('useNap must be used within a NapProvider');
  }
  return context;
};
