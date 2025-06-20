// NStation API 설정
export const NAP_CONFIG = {
  // API 기본 URL
  API_BASE_URL: 'https://api.nstation.co.kr/v2',

  // 캠페인 목록 API URL
  CAMPAIGN_LIST_URL: 'https://partner.nstation.co.kr/api/campaign/lists',

  // API 키 (실제 API 키로 교체 필요)
  API_KEY: 'YOUR_API_KEY',

  // 타임아웃 설정 (밀리초)
  TIMEOUT: 30000,

  // 디바이스 정보 캐시 만료 시간 (24시간)
  DEVICE_INFO_CACHE_DURATION: 24 * 60 * 60 * 1000,

  // 재시도 횟수
  MAX_RETRY_COUNT: 3,

  // 재시도 간격 (밀리초)
  RETRY_DELAY: 1000,

  // NStation 파트너 키
  MKEY: '1191',
  MCKEY: '10737',

  // 기본 콜백 파라미터
  CB_PARAM: 'T015',
};

// 환경별 설정
export const getNapConfig = (environment = 'production') => {
  const configs = {
    development: {
      API_BASE_URL: 'https://api.nstation.co.kr/v2',
      CAMPAIGN_LIST_URL: 'https://partner.nstation.co.kr/api/campaign/lists',
      API_KEY: 'DEV_API_KEY',
    },
    staging: {
      API_BASE_URL: 'https://api.nstation.co.kr/v2',
      CAMPAIGN_LIST_URL: 'https://partner.nstation.co.kr/api/campaign/lists',
      API_KEY: 'STAGING_API_KEY',
    },
    production: {
      API_BASE_URL: 'https://api.nstation.co.kr/v2',
      CAMPAIGN_LIST_URL: 'https://partner.nstation.co.kr/api/campaign/lists',
      API_KEY: 'PRODUCTION_API_KEY',
    },
  };

  return {
    ...NAP_CONFIG,
    ...configs[environment],
  };
};
