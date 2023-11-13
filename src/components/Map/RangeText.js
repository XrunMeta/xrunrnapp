import {Text} from 'react-native';
import React from 'react';

const RangeText = ({range}) => {
  return (
    <Text
      style={{
        fontSize: 11,
        fontFamily: 'Poppins-Medium',
      }}>
      {range}m
    </Text>
  );
};

export default RangeText;
