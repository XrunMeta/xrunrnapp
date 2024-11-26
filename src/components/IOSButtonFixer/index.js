import React from 'react';
import {Platform} from 'react-native';
import {BottomComponentFixer} from '../../../utils';

const IOSButtonFixer = ({count}) => {
  if (Platform.OS !== 'ios') return null;

  return <BottomComponentFixer count={count} />;
};

export default IOSButtonFixer;
