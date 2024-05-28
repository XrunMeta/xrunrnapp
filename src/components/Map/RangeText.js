import {Text} from 'react-native';
import React from 'react';
import {fontSize, getFontFam} from '../../../utils';

const RangeText = ({range}) => {
  return (
    <Text
      style={{
        fontSize: fontSize('note'),
        fontFamily: getFontFam() + 'Medium',
      }}>
      {range}m
    </Text>
  );
};

export default RangeText;
