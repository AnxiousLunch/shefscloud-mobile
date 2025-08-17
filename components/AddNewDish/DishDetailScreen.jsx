import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MultiSelect } from 'react-native-element-dropdown';
import { styles } from '@/styles/addNewDishStyles';

const DishDetailsScreen = ({
  name,
  food_type_id,
  side_item,
  spice_level_id,
  base_type_id,
  portion_type_id,
  chef_earning_fee,
  updateFields,
  foodType,
  spiceLevel,
  tagOptions,
  cusineSelectedOptions,
  setCusineSelectedOptions,
  portionTypes,
  grams,
  pieces,
  customPortion,
  setServSizeModalOpen,
}) => {
  const handleCusineSelectChange = (selectedValues) => {
  // selectedValues is an array of "value" strings from MultiSelect
  const selectedObjects = tagOptions.filter(tag =>
    selectedValues.includes(tag.value)
  );

  // Create tags string for backend
  const tags_string = selectedObjects.map(tag => tag.value).join(", ");

  // Update both states
  setCusineSelectedOptions?.(selectedObjects);
  updateFields({ tags: tags_string });
};


  const handleSpiceLevelChange = (value) => {
    updateFields({ spice_level_id: value });
  };

  console.log("spice", spiceLevel)

  return (
    <View>
      <Text style={styles.sectionTitle}>Dish Detail</Text>
      
      {/* Dish Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dish Name</Text>
        <Text style={styles.inputSubLabel}>Example: Mama Maria's Lasagna</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(text) => updateFields({ name: text })}
          placeholder="Name your Dish"
          maxLength={50}
        />
      </View>

      <View style={styles.divider} />

      {/* Food Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Food Type</Text>
        <View style={styles.foodTypeContainer}>
          {foodType?.map((type) => (
            <TouchableOpacity
              key={`food-type-${type.id}`}
              style={[
                styles.foodTypeButton,
                food_type_id === type.id && styles.foodTypeButtonSelected,
              ]}
              onPress={() => updateFields({ food_type_id: type.id })}
            >
              <Image
                source={{ uri: type.image }}
                style={styles.foodTypeIcon}
              />
              <Text style={styles.foodTypeText}>{type.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Side Item */}
      <View style={styles.inputGroup}>
        <View style={styles.sideItemContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Does this main need a side?</Text>
            <Text style={styles.inputSubLabel}>
              Let us know if the customer needs to purchase a side item separately
            </Text>
          </View>
          <View style={styles.switchContainer}>
            <View style={styles.switchButtons}>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  side_item === 1 && styles.switchButtonActive,
                ]}
                onPress={() => updateFields({ side_item: 1 })}
              >
                <Text style={[
                  styles.switchButtonText,
                  side_item === 1 && styles.switchButtonTextActive,
                ]}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  side_item === 0 && styles.switchButtonActive,
                ]}
                onPress={() => updateFields({ side_item: 0 })}
              >
                <Text style={[
                  styles.switchButtonText,
                  side_item === 0 && styles.switchButtonTextActive,
                ]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Spice Level */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Spice options</Text>
        <Text style={styles.inputSubLabel}>Select a spice option</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={spice_level_id}
            onValueChange={handleSpiceLevelChange}
            style={styles.picker}
          >
            <Picker.Item label="--- Select Spice Option ---" value="" />
            {spiceLevel?.map((option) => (
              <Picker.Item 
                key={option.id} 
                label={option.name} 
                value={option.id} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Dish Cuisine Tags */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dish cuisine tags</Text>
        <Text style={styles.inputSubLabel}>Add up to 5 cuisine tags</Text>
        <View style={styles.multiSelectContainer}>
          <MultiSelect
  data={tagOptions || []}
  labelField="label"
  valueField="value"
  placeholder="+ Add geographical cuisine tags"
  value={cusineSelectedOptions.map(tag => tag.value)} // Only send the values
  onChange={(selectedValues) => {
    // Convert values to objects
    const selectedObjects = tagOptions.filter(tag =>
      selectedValues.includes(tag.value)
    );

    // Save to parent as full objects
    setCusineSelectedOptions?.(selectedObjects);

    // Also save to chefMenu
    updateFields({ tags: selectedObjects.map(tag => tag.value).join(', ') });
  }}
  style={styles.multiSelect}
  placeholderStyle={styles.multiSelectPlaceholder}
  selectedTextStyle={styles.multiSelectSelectedText}
  containerStyle={styles.multiSelectDropdown}
  itemTextStyle={styles.multiSelectItemText}
  activeColor="#fef2f2"
/>
        </View>
        <View style={styles.selectedTagsContainer}>
          {cusineSelectedOptions?.map((option) => (
            <View key={option.id} style={styles.tag}>
              <Text style={styles.tagText}>{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Serving Size */}
      <View style={styles.inputGroup}>
        <View style={styles.servingSizeHeader}>
          <View>
            <Text style={styles.inputLabel}>Serving size options</Text>
            <Text style={styles.inputSubLabel}>Base serving size</Text>
          </View>
          <TouchableOpacity 
            style={styles.addServingButton}
            onPress={() => setServSizeModalOpen?.(true)}
          >
            <Text style={styles.addServingButtonText}>
              {"Edit Base Serving"}
            </Text>
          </TouchableOpacity>
        </View>

        {base_type_id && portion_type_id && chef_earning_fee && (
          <View style={styles.servingSizeTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Base Type</Text>
              <Text style={styles.tableHeader}>Portion Size</Text>
              <Text style={styles.tableHeader}>Serving</Text>
              <Text style={styles.tableHeader}>Price</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {base_type_id === 1 ? "Container" : 
                 base_type_id === 2 ? "Pieces" : "Other"}
              </Text>
              <Text style={styles.tableCell}>
                {base_type_id === 1 ? `${grams} grams` :
                 base_type_id === 2 ? `${pieces} pieces` : customPortion}
              </Text>
              <Text style={styles.tableCell}>
                {portionTypes?.find(item => item.id === portion_type_id)?.name || ""}
              </Text>
              <Text style={styles.tableCell}>
                {chef_earning_fee?.toLocaleString('en-PK', {
                  style: 'currency',
                  currency: 'PKR',
                })}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default DishDetailsScreen;