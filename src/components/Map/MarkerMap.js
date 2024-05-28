import React from 'react';
import {Image, Text, View} from 'react-native';
import {Marker, Callout} from 'react-native-maps';
import {fontSize, getFontFam} from '../../../utils';

const MarkerMap = ({item, onClick, currentRange, lang, logoMarker}) => {
  const handleMarkerClick = () => {
    onClick(item);
  };

  return (
    // Marker of Coin
    <Marker
      key={item.coin}
      coordinate={{
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lng),
      }}
      title={item.title}
      onPress={() => {
        handleMarkerClick(item);
      }}>
      <Image
        // source={{uri: `file://${adThumbnail}`}}
        source={logoMarker}
        style={{width: 15, height: 15}}
      />
      <Callout tooltip>
        <View
          style={{
            backgroundColor: 'white',
            borderColor: '#ffdc04',
            borderWidth: 3,
            flexDirection: 'row',
            width: 200,
            height: 80,
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderTopLeftRadius: 50,
            borderTopRightRadius: 15,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 15,
            gap: 7,
            elevation: 4,
          }}>
          <View
            style={{
              justifyContent: 'space-between',
              marginLeft: 10,
            }}>
            <Text
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                marginTop: -10,
              }}>
              <Image
                // source={{uri: `file://${brandLogo}`}}
                source={logoMarker}
                style={{
                  width: 37,
                  height: 37,
                }}
                onError={err => console.log('Error Bgst! : ', err)}
              />
            </Text>
            <Text
              style={{
                fontSize: fontSize('note'),
                fontFamily: getFontFam() + 'Medium',
              }}>
              {currentRange.toFixed(2)}m
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontSize: fontSize('note'),
                fontFamily: getFontFam() + 'Medium',
                marginTop: 3,
              }}>
              {lang && lang.screen_map && lang.screen_map.section_marker
                ? lang.screen_map.section_marker.desc1 + ' '
                : ''}
              {item.brand}
              {'\n'}
              {lang && lang.screen_map && lang.screen_map.section_marker
                ? lang.screen_map.section_marker.desc2 + ' '
                : ''}
              {item.brand + '.'}
            </Text>
            <Text
              style={{
                fontSize: fontSize('subtitle'),
                fontFamily: getFontFam() + 'Medium',
                marginBottom: -5,
                color: 'black',
              }}>
              {item.coins} {item.brand}
            </Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
};

export default MarkerMap;
