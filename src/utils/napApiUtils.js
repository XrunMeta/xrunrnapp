import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {NetworkInfo} from 'react-native-network-info';
import {getNapConfig} from '../config/napConfig';

// NStation API 설정 가져오기
const NAP_CONFIG = getNapConfig();

/**
 * 캠페인 목록 조회 API
 * @returns {Promise<Array>} 캠페인 목록
 */
export async function getCampaignList() {
  try {
    const url = `${NAP_CONFIG.CAMPAIGN_LIST_URL}?mkey=${NAP_CONFIG.MKEY}&mckey=${NAP_CONFIG.MCKEY}`;

    console.log('NStation 캠페인 목록 요청:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.result !== 200) {
      throw new Error(result.message || '캠페인 목록 조회 실패');
    }

    console.log('NStation 캠페인 목록 성공:', result);
    return result.camp || [];
  } catch (error) {
    console.error('NStation 캠페인 목록 조회 실패:', error.message);
    throw error;
  }
}

/**
 * 캠페인 참여 요청 API
 * @param {string} campaignId - 캠페인 ID
 * @param {string} userId - 사용자 ID
 * @param {Object} userInfo - 사용자 추가 정보 (age, gender 등)
 * @returns {Promise<Object>} API 응답 결과 (lurl 포함)
 */
export async function sendCampaignJoinRequest(
  campaignId,
  userId,
  userInfo = {},
) {
  try {
    // 디바이스 정보 수집
    const deviceId = await DeviceInfo.getUniqueId();
    const adid =
      Platform.OS === 'android'
        ? await DeviceInfo.getAndroidId()
        : await DeviceInfo.getUniqueId();
    const ipAddress = await NetworkInfo.getIPAddress();
    const model = DeviceInfo.getModel();
    const manufacturer = await DeviceInfo.getManufacturer();
    const osVersion = DeviceInfo.getSystemVersion();
    const carrier = await DeviceInfo.getCarrier();

    // 네트워크 정보 수집
    const netState = await NetInfo.fetch();
    let networkType = '4'; // 기본값
    if (netState.type === 'cellular') {
      networkType =
        netState.details.cellularGeneration === '5g'
          ? '5'
          : netState.details.cellularGeneration === '4g'
          ? '4'
          : netState.details.cellularGeneration === '3g'
          ? '3'
          : '2';
    } else if (netState.type === 'wifi') {
      networkType = '1';
    }

    // 캠리어 정보 변환
    let carrierCode = '1'; // 기본값
    if (carrier) {
      if (carrier.includes('SKT') || carrier.includes('SK')) carrierCode = '1';
      else if (carrier.includes('KT')) carrierCode = '2';
      else if (carrier.includes('LG') || carrier.includes('U+'))
        carrierCode = '3';
    }

    // 캠페인 상세 정보 조회 (ctvid 필요)
    const campaigns = await getCampaignList();
    const campaign = campaigns.find(
      c => c.campid.toString() === campaignId.toString(),
    );

    if (!campaign) {
      throw new Error('캠페인을 찾을 수 없습니다.');
    }

    const payload = {
      mkey: NAP_CONFIG.MKEY,
      mckey: NAP_CONFIG.MCKEY,
      cbparam: NAP_CONFIG.CB_PARAM,
      userid: userId,
      campid: campaignId,
      ip: ipAddress,
      adid: adid,
      mnetwork: networkType,
      carrier: carrierCode,
      age: userInfo.age || '22',
      gender: userInfo.gender || '1',
      ctvid: campaign.ctvid,
    };

    console.log('NStation 캠페인 참여 요청:', payload);

    // URL 파라미터로 변환
    const queryParams = new URLSearchParams(payload).toString();
    const url = `${NAP_CONFIG.API_BASE_URL}/join?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.result !== 200) {
      throw new Error(result.message || '캠페인 참여 실패');
    }

    console.log('NStation 캠페인 참여 성공:', result);
    return result;
  } catch (error) {
    console.error('NStation 캠페인 참여 요청 실패:', error.message);
    throw error;
  }
}

/**
 * 디바이스 정보를 전역 변수로 저장
 * @returns {Promise<Object>} 수집된 디바이스 정보
 */
export async function collectDeviceInfo() {
  try {
    const deviceInfo = {
      deviceId: await DeviceInfo.getUniqueId(),
      adid:
        Platform.OS === 'android'
          ? await DeviceInfo.getAndroidId()
          : await DeviceInfo.getUniqueId(),
      ipAddress: await NetworkInfo.getIPAddress(),
      model: DeviceInfo.getModel(),
      manufacturer: await DeviceInfo.getManufacturer(),
      osVersion: DeviceInfo.getSystemVersion(),
      carrier: await DeviceInfo.getCarrier(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
      deviceName: await DeviceInfo.getDeviceName(),
      userAgent: await DeviceInfo.getUserAgent(),
      isTablet: DeviceInfo.isTablet(),
      isLocationEnabled: await DeviceInfo.isLocationEnabled(),
      timestamp: Math.floor(Date.now() / 1000),
    };

    // 네트워크 정보 추가
    const netState = await NetInfo.fetch();
    deviceInfo.networkType =
      netState.type === 'cellular'
        ? netState.details.cellularGeneration?.toUpperCase() || 'CELLULAR'
        : netState.type === 'wifi'
        ? 'WIFI'
        : 'UNKNOWN';
    deviceInfo.isConnected = netState.isConnected;
    deviceInfo.isInternetReachable = netState.isInternetReachable;

    // NStation용 네트워크 코드 추가
    if (netState.type === 'cellular') {
      deviceInfo.mnetwork =
        netState.details.cellularGeneration === '5g'
          ? '5'
          : netState.details.cellularGeneration === '4g'
          ? '4'
          : netState.details.cellularGeneration === '3g'
          ? '3'
          : '2';
    } else if (netState.type === 'wifi') {
      deviceInfo.mnetwork = '1';
    } else {
      deviceInfo.mnetwork = '4'; // 기본값
    }

    // 캐리어 코드 추가
    if (deviceInfo.carrier) {
      if (
        deviceInfo.carrier.includes('SKT') ||
        deviceInfo.carrier.includes('SK')
      ) {
        deviceInfo.carrierCode = '1';
      } else if (deviceInfo.carrier.includes('KT')) {
        deviceInfo.carrierCode = '2';
      } else if (
        deviceInfo.carrier.includes('LG') ||
        deviceInfo.carrier.includes('U+')
      ) {
        deviceInfo.carrierCode = '3';
      } else {
        deviceInfo.carrierCode = '1'; // 기본값
      }
    } else {
      deviceInfo.carrierCode = '1';
    }

    console.log('수집된 디바이스 정보:', deviceInfo);
    return deviceInfo;
  } catch (error) {
    console.error('디바이스 정보 수집 실패:', error);
    throw error;
  }
}

/**
 * 캠페인 상세 정보 조회 API
 * @param {string} campaignId - 캠페인 ID
 * @returns {Promise<Object>} 캠페인 상세 정보
 */
export async function getCampaignDetail(campaignId) {
  try {
    const campaigns = await getCampaignList();
    const campaign = campaigns.find(
      c => c.campid.toString() === campaignId.toString(),
    );

    if (!campaign) {
      throw new Error('캠페인을 찾을 수 없습니다.');
    }

    return campaign;
  } catch (error) {
    console.error('캠페인 상세 정보 조회 실패:', error.message);
    throw error;
  }
}
