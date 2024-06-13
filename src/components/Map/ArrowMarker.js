import React from 'react';
import {Image} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

const ArrowMarker = ({coordinate, rotation}) => {
  console.log(`Rotasi : ${rotation}`);
  return (
    <Marker
      coordinate={coordinate}
      anchor={{x: 0.5, y: 0.5}}
      rotation={rotation}>
      <Image
        source={require('../../../assets/images/icon_arrowCircle.png')} // Ganti dengan path ikon tanda panah biru yang sesuai
        style={{width: 30, height: 30}} // Sesuaikan dengan ukuran ikon Anda
      />
    </Marker>
  );
};

export default ArrowMarker;
