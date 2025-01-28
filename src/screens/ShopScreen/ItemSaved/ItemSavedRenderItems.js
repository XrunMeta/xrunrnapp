import {Image, Text, TouchableOpacity, View} from 'react-native';

export const itemSavedRenderItems = ({
  item, // Data item yang akan dirender
  styles, // Gaya custom yang digunakan
  onPress, // Callback untuk event ketika item ditekan
}) => {
  return (
    <TouchableOpacity
      key={item.transaction}
      style={[styles.list, {flexDirection: 'row', gap: 10}]}
      onPress={() => onPress(item)} // Callback saat item ditekan
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
            item.icon
              ? {uri: item.icon}
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
          {item.title}
        </Text>
        <Text style={[styles.normalText, {marginTop: 0, fontWeight: 'bold'}]}>
          {item.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
