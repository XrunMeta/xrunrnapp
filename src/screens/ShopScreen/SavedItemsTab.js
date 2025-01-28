import {ActivityIndicator, FlatList, Text, View} from 'react-native';

export const savedItemsTab = (
  lang,
  styles,
  savedItemsLoading,
  savedItems,
  savedItemsKeyExtractor,
  savedRenderItem,
) => {
  return (
    <View style={{flex: 1}}>
      {/* List Empty */}
      {savedItemsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#343a59" />
          <Text style={[styles.normalText, {color: 'grey'}]}>
            {lang && lang.screen_advertise && lang.screen_advertise.loading
              ? lang.screen_advertise.loading
              : ''}
          </Text>
        </View>
      ) : savedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {lang && lang.screen_advertise && lang.screen_advertise.nodata
              ? lang.screen_advertise.nodata
              : ''}
          </Text>
        </View>
      ) : (
        <View>
          <FlatList
            data={savedItems}
            keyExtractor={savedItemsKeyExtractor}
            renderItem={savedRenderItem}
          />
        </View>
      )}
    </View>
  );
};
