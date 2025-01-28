import {ActivityIndicator, FlatList, Text, View} from 'react-native';

export const itemExpiredRoutes = (
  lang,
  styles,
  itemExpiredLoading,
  itemExpiredData,
  itemExpiredKeyExtractor,
  renderItemCallback, // Callback render item
) => (
  <View style={{flex: 1}}>
    {itemExpiredLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#343a59" />
        <Text style={[styles.normalText, {color: 'grey'}]}>
          {lang?.screen_advertise?.loading || ''}
        </Text>
      </View>
    ) : itemExpiredData.length === 0 ? (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {lang?.screen_advertise?.nodata || ''}
        </Text>
      </View>
    ) : (
      <FlatList
        data={itemExpiredData}
        keyExtractor={itemExpiredKeyExtractor}
        renderItem={({item}) =>
          renderItemCallback({item, styles, onPress: () => console.log(item)})
        } // Kirim parameter ke renderItemCallback
      />
    )}
  </View>
);
