import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {fontSize, getFontFam} from '../../../utils';

const LabelWithBoxReadOnly = ({label, value, isTextarea = false}) => {
  return (
    <View>
      {label && (
        <Text
          style={{
            color: 'black',
            fontFamily: getFontFam() + 'Bold',
            fontSize: fontSize('body'),
            flex: 1,
            marginLeft: 10,
          }}>
          {label}
        </Text>
      )}
      <View style={styles.containerBox(isTextarea)}>
        {isTextarea ? (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.textBox}>{value}</Text>
          </ScrollView>
        ) : (
          <Text style={styles.textBox}>{value}</Text>
        )}
      </View>
    </View>
  );
};

export default LabelWithBoxReadOnly;

const styles = StyleSheet.create({
  containerBox: isTextarea => ({
    minHeight: 50,
    maxHeight: isTextarea && 300,
    padding: 12,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.16,
    shadowRadius: 1.51,
    elevation: 1,
  }),
  scrollContainer: {
    flexGrow: 1,
  },
  textBox: {
    flex: 1,
    fontFamily: getFontFam() + 'Regular',
    fontSize: fontSize('body'),
    color: 'black',
    textAlignVertical: 'center',
  },
});
