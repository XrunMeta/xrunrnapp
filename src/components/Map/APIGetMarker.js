// Get Coin as Lat Lng
export const fetchMarkerData = async (latitude, longitude) => {
  try {
    const apiUrl = `https://app.xrun.run/gateway.php?act=coinmapping&member=1102&lat=${latitude}&lng=${longitude}&limit=30`;
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Gagal mengambil data dari API');
      return null;
    }
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    return null;
  }
};
