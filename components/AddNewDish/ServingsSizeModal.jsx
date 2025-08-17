import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { modalStyles } from '@/styles/addNewDishStyles';

const ServingSizeModal = ({
  isOpen,
  onClose,
  base_type_id,
  portion_type_id,
  delivery_price,
  platform_price,
  chef_earning_fee,
  updateFields,
  portionTypes,
  grams,
  pieces,
  customPortion,
  setGrams,
  setPieces,
  setCustomPortion,
}) => {
  const [localBaseType, setLocalBaseType] = useState(base_type_id || 1);
  const [localPortionType, setLocalPortionType] = useState(portion_type_id || '');
  const [localGrams, setLocalGrams] = useState(grams || '');
  const [localPieces, setLocalPieces] = useState(pieces || '');
  const [localCustomPortion, setLocalCustomPortion] = useState(customPortion || '');
  const [localDeliveryPrice, setLocalDeliveryPrice] = useState(delivery_price?.toString() || '');
  const [localPlatformPrice, setLocalPlatformPrice] = useState(platform_price?.toString() || '');
  const [localChefEarning, setLocalChefEarning] = useState(chef_earning_fee?.toString() || '');

  useEffect(() => {
    if (isOpen) {
      setLocalBaseType(base_type_id || 1);
      setLocalPortionType(portion_type_id || '');
      setLocalGrams(grams || '');
      setLocalPieces(pieces || '');
      setLocalCustomPortion(customPortion || '');
      setLocalDeliveryPrice(delivery_price?.toString() || '');
      setLocalPlatformPrice(platform_price?.toString() || '');
      setLocalChefEarning(chef_earning_fee?.toString() || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    let portionSize = '';
    if (localBaseType === 1) {
      portionSize = localGrams;
    } else if (localBaseType === 2) {
      portionSize = localPieces;
    } else if (localBaseType === 3) {
      portionSize = localCustomPortion;
    }

    updateFields({
      base_type_id: localBaseType,
      portion_type_id: Number(localPortionType),
      portion_size: portionSize,
      delivery_price: parseFloat(localDeliveryPrice) || 0,
      platform_price: parseFloat(localPlatformPrice) || 0,
      chef_earning_fee: parseFloat(localChefEarning) || 0,
    });

    // Update local state
    if (localBaseType === 1) setGrams?.(localGrams);
    else if (localBaseType === 2) setPieces?.(localPieces);
    else if (localBaseType === 3) setCustomPortion?.(localCustomPortion);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Base Serving Size</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.content}>
            {/* Base Type Selection */}
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Base Type</Text>
              <View style={modalStyles.radioGroup}>
                <TouchableOpacity
                  style={[
                    modalStyles.radioButton,
                    localBaseType === 1 && modalStyles.radioButtonSelected,
                  ]}
                  onPress={() => setLocalBaseType(1)}
                >
                  <Text style={[
                    modalStyles.radioText,
                    localBaseType === 1 && modalStyles.radioTextSelected,
                  ]}>
                    Container
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    modalStyles.radioButton,
                    localBaseType === 2 && modalStyles.radioButtonSelected,
                  ]}
                  onPress={() => setLocalBaseType(2)}
                >
                  <Text style={[
                    modalStyles.radioText,
                    localBaseType === 2 && modalStyles.radioTextSelected,
                  ]}>
                    Pieces
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    modalStyles.radioButton,
                    localBaseType === 3 && modalStyles.radioButtonSelected,
                  ]}
                  onPress={() => setLocalBaseType(3)}
                >
                  <Text style={[
                    modalStyles.radioText,
                    localBaseType === 3 && modalStyles.radioTextSelected,
                  ]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Portion Size Input */}
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Portion Size</Text>
              {localBaseType === 1 && (
                <View style={modalStyles.inputWithUnit}>
                  <TextInput
                    style={modalStyles.input}
                    keyboardType="numeric"
                    value={localGrams}
                    onChangeText={setLocalGrams}
                    placeholder="Enter grams"
                  />
                  <Text style={modalStyles.unit}>grams</Text>
                </View>
              )}
              {localBaseType === 2 && (
                <View style={modalStyles.inputWithUnit}>
                  <TextInput
                    style={modalStyles.input}
                    keyboardType="numeric"
                    value={localPieces}
                    onChangeText={setLocalPieces}
                    placeholder="Enter pieces"
                  />
                  <Text style={modalStyles.unit}>pieces</Text>
                </View>
              )}
              {localBaseType === 3 && (
                <TextInput
                  style={modalStyles.input}
                  value={localCustomPortion}
                  onChangeText={setLocalCustomPortion}
                  placeholder="Enter custom portion"
                />
              )}
            </View>

            {/* Portion Type Selection */}
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Serving</Text>
              <View style={modalStyles.pickerContainer}>
                <Picker
                  selectedValue={localPortionType}
                  onValueChange={(value) => setLocalPortionType(value)}
                  style={modalStyles.picker}
                >
                  <Picker.Item label="Select Portion Type" value="" />
                  {portionTypes?.map((type) => (
                    <Picker.Item 
                      key={type.id} 
                      label={type.name} 
                      value={type.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Pricing */}
            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Chef Earning Fee (PKR)</Text>
              <TextInput
                style={modalStyles.input}
                keyboardType="numeric"
                value={localChefEarning}
                onChangeText={setLocalChefEarning}
                placeholder="Enter amount"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Platform Price (PKR)</Text>
              <TextInput
                style={modalStyles.input}
                keyboardType="numeric"
                value={localPlatformPrice}
                onChangeText={setLocalPlatformPrice}
                placeholder="Enter amount"
              />
            </View>

            <View style={modalStyles.inputGroup}>
              <Text style={modalStyles.label}>Delivery Price (PKR)</Text>
              <TextInput
                style={modalStyles.input}
                keyboardType="numeric"
                value={localDeliveryPrice}
                onChangeText={setLocalDeliveryPrice}
                placeholder="Enter amount"
              />
            </View>

            <View style={modalStyles.priceSummary}>
              <Text style={modalStyles.summaryLabel}>Total Price:</Text>
              <Text style={modalStyles.summaryValue}>
                {(
                  parseFloat(localChefEarning || '0') + 
                  parseFloat(localPlatformPrice || '0') + 
                  parseFloat(localDeliveryPrice || '0')
                ).toLocaleString('en-PK', {
                  style: 'currency',
                  currency: 'PKR',
                })}
              </Text>
            </View>
          </ScrollView>

          <View style={modalStyles.footer}>
            <TouchableOpacity 
              style={modalStyles.cancelButton}
              onPress={onClose}
            >
              <Text style={modalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={modalStyles.saveButton}
              onPress={handleSave}
            >
              <Text style={modalStyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ServingSizeModal;