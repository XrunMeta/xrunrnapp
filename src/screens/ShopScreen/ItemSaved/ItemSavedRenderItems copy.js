import {Image, Text, TouchableOpacity, View} from 'react-native';
export const itemSavedRenderItems = ({item, styles, onPress}) => {
  const calculateDaysLeft = (createdDate, duration = 30) => {
    if (!createdDate) return '';

    const created = new Date(createdDate);
    const now = new Date();

    const expiredDate = new Date(created);
    expiredDate.setDate(created.getDate() + duration); // Tambah durasi ke tanggal expired

    const diffTime = expiredDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Selisih hari, dibulatkan ke atas

    return diffDays > 0 ? diffDays : `Expired`;
  };

  // Cek apakah item sudah Expired, jika iya maka hentikan render
  if (calculateDaysLeft(item.created) === 'Expired') {
    return null; // Tidak menampilkan komponen ini
  }

  return (
    <TouchableOpacity
      key={item.id}
      style={[styles.list, {flexDirection: 'row', gap: 10}]}
      onPress={() => onPress(item)}
      disabled>
      {/* Image Container */}
      <View
        style={{
          borderColor: '#d9d9d9',
          borderWidth: 1,
          borderRadius: 5,
          height: 50,
          width: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={
            item.icon_blob
              ? {
                  uri: `data:image/png;base64,${item.icon_blob.replace(
                    /(\r\n|\n|\r)/gm,
                    '',
                  )}`,
                }
              : require('../../../../assets/images/logo_xrun.png')
          }
          resizeMode="contain"
          style={{height: 25, width: 25}}
        />
      </View>

      {/* Text Content */}
      <View style={{justifyContent: 'center'}}>
        <Text
          style={[styles.normalText, {color: 'grey'}]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.normalText, {marginTop: 0, fontWeight: 'bold'}]}>
          {item.type == 10152 ? `${calculateDaysLeft(item.created)} ` : ''}
          {item.saveddesc}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
