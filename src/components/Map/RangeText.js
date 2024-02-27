import {Text} from 'react-native';
import React from 'react';
import {getFontFam} from '../../../utils';

const RangeText = ({range}) => {
  return (
    <Text
      style={{
        fontSize: 11,
        fontFamily: getFontFam() + 'Medium',
      }}>
      {range}m
    </Text>
  );
};

export default RangeText;
