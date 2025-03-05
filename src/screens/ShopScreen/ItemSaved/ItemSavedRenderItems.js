import {Image, Text, TouchableOpacity, View} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import {URL_API_NODEJS, authcode} from '../../../../utils';

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

export const itemSavedRenderItems = ({member, item, styles, onPress}) => {
  const timeLeft = calculateDaysLeft(item.created);

  // Fungsi untuk menandai item sebagai expired di backend
  const markAsExpired = async storageID => {
    try {
      const request = await fetch(`${URL_API_NODEJS}/useInappStorage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authcode}`,
        },
        body: JSON.stringify({
          member,
          storage: storageID,
        }),
      });
      const response = await request.json();

      if (response.status === 'success' && response.code === 200) {
        console.log('Subscription expired and updated in DB');
      } else {
        console.error('Failed to update Subscription in DB:', response.message);
      }
    } catch (err) {
      console.error('Error update Subscription in DB: ', err);
      crashlytics().recordError(new Error(err));
      crashlytics().log(err);
    }
  };

  // Cek apakah item sudah expired
  if (timeLeft === 'Expired') {
    markAsExpired(item.id); // Panggil tanpa await supaya gak ngerusak render
    return null; // Jangan render kalau expired
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
          {item.type == 10152 ? `${timeLeft} ` : ''}
          {item.saveddesc}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
