import {URL_API} from '../../../utils';

const fetchImageFromApi = async adthumbnail => {
  try {
    const apiAdthumbnail = `${URL_API}&act=getImageFromFileNumber&file=${adthumbnail}`;
    const response = await fetch(apiAdthumbnail);
    if (response.ok) {
      const imageData = await response.json();
      // Mengambil attachment pertama jika tersedia
      const attachment = imageData.data[0]?.attachments || '';
      return attachment;
    } else {
      console.error('Gagal mengambil data gambar dari API');
      return null;
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data gambar:', error);
    return null;
  }
};

// Get Coin as Lat Lng
export const fetchMarkerData = async (latitude, longitude, member) => {
  try {
    const apiUrl = `${URL_API}&act=coinmapping&member=${member}&lat=${latitude}&lng=${longitude}&limit=30`;
    const response = await fetch(apiUrl);

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

// export const fetchMarkerData = async (latitude, longitude, member) => {
//   try {
//     const apiUrl = `${URL_API}&act=coinmapping&member=${member}&lat=${latitude}&lng=${longitude}&limit=30`;
//     const response = await fetch(apiUrl);
//     if (response.ok) {
//       const data = await response.json();

//       const filteredData = await Promise.all(
//         data.data.map(async item => {
//           // Mengambil attachment dari API tambahan
//           const adthumbnail2 = await fetchImageFromApi(item.adthumbnail);

//           return {
//             coin: item.coin,
//             lat: item.lat,
//             lng: item.lng,
//             distance: item.distance,
//             advertisement: item.advertisement,
//             brand: item.brand,
//             title: item.title,
//             coins: item.coins,
//             adthumbnail2: adthumbnail2,
//             isbigcoin: item.isbigcoin,
//             brandlogo: item.brandlogo,
//           };
//         }),
//       );

//       console.log(JSON.stringify(filteredData));

//       return {data: filteredData};
//     } else {
//       console.error('Gagal mengambil data dari API');
//       return null;
//     }
//   } catch (error) {
//     console.error('Terjadi kesalahan:', error);
//     return null;
//   }
// };
