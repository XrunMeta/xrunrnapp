import React from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import {fontSize} from '../../../utils';

const FilterModal = React.memo(
  ({
    visible,
    onClose,
    selectedType,
    setSelectedType,
    selectedDays,
    setSelectedDays,
    onConfirm,
  }) => {
    // Handle type selection
    const handleTypeSelect = type => {
      setSelectedType(type);
    };

    // Handle days selection
    const handleDaysSelect = days => {
      setSelectedDays(days);
    };

    // Reset filters to default
    const handleReset = () => {
      setSelectedType('All');
      setSelectedDays('7 Days');
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={onClose}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContent}
              onPress={e => e.stopPropagation()}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter</Text>
                <TouchableOpacity onPress={onClose}>
                  <Image
                    source={require('./../../../assets/images/icon_close.png')}
                    style={styles.closeIcon}
                  />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Type Selection Row */}
              <View style={styles.filterRow}>
                <View style={styles.buttonGroup}>
                  {['All', 'Send', 'Receive'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterButton,
                        selectedType === type && styles.selectedFilterButton,
                      ]}
                      onPress={() => handleTypeSelect(type)}>
                      <Text
                        style={[
                          styles.filterButtonText,
                          selectedType === type &&
                            styles.selectedFilterButtonText,
                        ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Days Selection Row */}
              <View style={styles.filterRow}>
                <View style={styles.buttonGroup}>
                  {['7 Days', '14 Days', '30 Days'].map(days => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.filterButton,
                        selectedDays === days && styles.selectedFilterButton,
                      ]}
                      onPress={() => handleDaysSelect(days)}>
                      <Text
                        style={[
                          styles.filterButtonText,
                          selectedDays === days &&
                            styles.selectedFilterButtonText,
                        ]}>
                        {days}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={onConfirm}>
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: fontSize('title'),
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedFilterButton: {
    backgroundColor: '#F5F5F5',
  },
  filterButtonText: {
    fontSize: fontSize('body'),
    color: '#666',
  },
  selectedFilterButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  divider: {
    height: 3,
    backgroundColor: '#E5E5E5',
    marginVertical: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    color: 'black',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#FFDC04',
    alignItems: 'center',
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'black',
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fontSize('title'),
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
    textAlign: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  tabButton: {
    paddingVertical: 10,
    flex: 1,
    borderBottomWidth: 5,
    borderBottomColor: '#DEDEDE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 5,
    borderBottomColor: '#FFDC04',
  },
  tabText: {
    fontSize: fontSize('title'),
    color: '#B8B8B8',
  },
  activeTabText: {
    color: 'black',
    fontWeight: 'bold',
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabContent: {
    minHeight: 200,
  },
  tokenItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    gap: 15,
  },
  selectedToken: {
    backgroundColor: '#F5F5FF',
  },
  tokenSymbol: {
    fontSize: fontSize('subtitle'),
    color: 'black',
  },
  inputLabel: {
    fontSize: fontSize('body'),
    color: '#B8B8B8',
    marginBottom: 5,
  },
  input: {
    borderColor: '#FAFAFA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: fontSize('subtitle'),
  },
  nextButton: {
    backgroundColor: '#FFDC04',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    marginTop: 40,
    width: 150,
    marginHorizontal: 'auto',
    alignSelf: 'center',
  },
  nextButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: fontSize('subtitle'),
  },
  confirmRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  confirmLabel: {
    fontSize: fontSize('subtitle'),
    color: '#B8B8B8',
  },
  confirmValue: {
    fontSize: fontSize('subtitle'),
    color: 'black',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#5F59E0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  addButtonText: {
    color: 'black',
    fontSize: fontSize('subtitle'),
    fontWeight: 'bold',
  },
});

export default FilterModal;
