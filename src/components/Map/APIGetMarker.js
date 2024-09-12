import {URL_API_NODEJS, authcode} from '../../../utils';

// Get Coin as Lat Lng
export const fetchMarkerData = async (latitude, longitude, member) => {
  try {
    const response = await fetch(`${URL_API_NODEJS}/app2000-01`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authcode}`,
      },
      body: JSON.stringify({
        member,
        lat: latitude,
        lng: longitude,
        limit: 120,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      // Filter only the properties you need
      const filteredData = data.data.map(item => ({
        coin: item.coin,
        // cointype: item.cointype,
        // amount: item.amount,
        // countlimit: item.countlimit,
        lat: item.lat,
        lng: item.lng,
        distance: item.distance,
        advertisement: item.advertisement,
        brand: item.brand,
        title: item.title,
        // contents: item.contents,
        // currency: item.currency,
        // adcolor1: item.adcolor1,
        // adcolor2: item.adcolor2,
        coins: item.coins,
        adthumbnail: item.adthumbnail,
        adthumbnail2: item.adthumbnail2,
        // tracking: item.tracking,
        isbigcoin: item.isbigcoin,
        // symbol: item.symbol,
        brandlogo: item.brandlogo,
        // symbolimg: item.symbolimg,
        // exad: item.exad,
        // exco: item.exco,
        // member: item.member,
        // lv: item.lv,
      }));

      // console.log(JSON.stringify(filteredData));

      return {data: filteredData};
    } else {
      console.error('Gagal mengambil data dari API');
      return null;
    }
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    return null;
  }
};
