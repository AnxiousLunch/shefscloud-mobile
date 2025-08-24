import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  StyleSheet,
  Checkbox
} from 'react-native';

const CitiesSelectionModal = ({
  visible,
  onClose,
  cities,
  selectedCities,
  toggleSelection
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Cities</Text>
          
          <FlatList
            data={cities}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.cityItem}
                onPress={() => toggleSelection(item)}
              >
                <Checkbox
                  value={selectedCities.some(c => c.id === item.id)}
                  onValueChange={() => toggleSelection(item)}
                />
                <Text style={styles.cityText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityText: {
    marginLeft: 10,
    fontSize: 16,
  },
  doneButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  doneButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CitiesSelectionModal;