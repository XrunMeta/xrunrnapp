import {ActivityIndicator, FlatList, Text, View} from 'react-native';

export const itemSavedRoutes = (
  lang,
  styles,
  itemSavedLoading,
  itemSavedData,
  itemSavedKeyExtractor,
  renderItemCallback, // Callback render item
) => (
  <View style={{flex: 1}}>
    {itemSavedLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#343a59" />
        <Text style={[styles.normalText, {color: 'grey'}]}>
          {lang?.screen_advertise?.loading || ''}
        </Text>
      </View>
    ) : itemSavedData.length === 0 ? (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {lang?.screen_advertise?.nodata || ''}
        </Text>
      </View>
    ) : (
      <FlatList
        data={itemSavedData}
        keyExtractor={itemSavedKeyExtractor}
        renderItem={({item}) =>
          renderItemCallback({item, styles, onPress: () => console.log(item)})
        } // Kirim parameter ke renderItemCallback
      />
    )}
  </View>
);
