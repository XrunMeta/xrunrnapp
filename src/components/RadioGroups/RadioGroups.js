import {useMemo} from 'react';
import {StyleSheet, Text} from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';
import {fontSize, getFontFam} from '../../../utils';

const RadioGroups = ({
  lang,
  type,
  setSelectedType,
  setIsShowPopupFloating,
  selectedId,
  setSelectedId,
}) => {
  const setValueAdType = (value, label) => {
    console.log(`Value: ${value} | selectedId: ${selectedId}`);

    setSelectedType({
      value,
      label: `: ${label}`,
    });
    setIsShowPopupFloating(false);
  };

  const generateRadioButtons = options =>
    options.map(({id, label, value}) => ({
      id,
      label,
      value,
      borderColor: '#009484',
      color: '#009484',
      labelStyle: {
        color: 'black',
        fontFamily: `${getFontFam()}Regular`,
        fontSize: fontSize('subtitle'),
        width: 200,
      },
    }));

  const radioButtonsAdType = useMemo(
    () =>
      generateRadioButtons([
        {id: '1', label: lang?.screen_indAds?.image || 'Image', value: 10501},
        {id: '2', label: lang?.screen_indAds?.coupon || 'Coupon', value: 10502},
        {
          id: '3',
          label: lang?.screen_indAds?.response || 'Response',
          value: 10503,
        },
      ]),
    [lang],
  );

  const radioButtonsExposeCount = useMemo(
    () =>
      generateRadioButtons([
        {id: '1', label: '1000', value: 1000},
        {id: '2', label: '2000', value: 2000},
        {id: '3', label: '3000', value: 3000},
      ]),
    [],
  );

  const radioButtonsRewardCoin = useMemo(
    () =>
      generateRadioButtons([
        {id: '1', label: 'XRUN', value: 'xrun'},
        {id: '2', label: 'ETH', value: 'eth'},
      ]),
    [],
  );

  const handleRadioButtonPress = (radioButtons, id) => {
    setSelectedId(id);
    const selectedRadioButton = radioButtons.find(button => button.id === id);
    if (selectedRadioButton) {
      setValueAdType(selectedRadioButton.value, selectedRadioButton.label);
    }
  };

  const radioButtonGroups = {
    ad_type: {
      title: lang && lang ? lang.screen_indAds.ad_type : 'AD Type',
      value: radioButtonsAdType,
    },
    expose_count: {
      title: lang && lang ? lang.screen_indAds.expose_count : 'Expose Count',
      value: radioButtonsExposeCount,
    },
    reward_coin: {
      title: lang && lang ? lang.screen_indAds.reward_coin : 'Reward Coin',
      value: radioButtonsRewardCoin,
    },
  };

  return type in radioButtonGroups ? (
    <>
      <Text style={styles.titleRadioButton}>
        Select {radioButtonGroups[type]['title']}
      </Text>
      <RadioGroup
        radioButtons={radioButtonGroups[type]['value']}
        onPress={id =>
          handleRadioButtonPress(radioButtonGroups[type]['value'], id)
        }
        selectedId={selectedId}
        containerStyle={{alignItems: 'flex-start', rowGap: 10}}
      />
    </>
  ) : (
    <Text>Not Found</Text>
  );
};

export default RadioGroups;

const styles = StyleSheet.create({
  titleRadioButton: {
    fontFamily: getFontFam() + 'Medium',
    fontSize: fontSize('subtitle'),
    marginBottom: 16,
    color: 'black',
    marginLeft: 10,
  },
});
