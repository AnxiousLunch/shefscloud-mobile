import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Image, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  handleGetFoodType, 
  handleGetSpiceLevel, 
  handleGetTags, 
  handleGetPortionType,
  handleGetHeatingInstruction,
  handleGetIngredients,
  handleCreateMenu,
  handleUpdateMenu,
} from '@/services/get_methods';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { chefMenuInitialState } from '@/constants/initialStates';
import { MultiSelect } from 'react-native-element-dropdown';
import { formatDateForInput } from '@/utils/helpers';
import {handleAvailabilityTimeSlot} from '@/services/shef'

const AddNewDishScreen = () => {
  const params = useLocalSearchParams();
  const { authToken } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  
  // Safely parse dishToEdit from params
  const dishToEdit = params.dishToEdit ? JSON.parse(params.dishToEdit as string) : null;
  
  const [chefMenu, setChefMenu] = useState(chefMenuInitialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [isUpdateDish, setIsUpdateDish] = useState(false);
  
  // Data for dropdowns
  const [foodType, setFoodType] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [portionTypes, setPortionTypes] = useState([]);
  const [heatInstruction, setHeatInstruction] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [timeSlot, setTimeSlot] = useState([]);
  
  // Selected values for multi-select
  const [cusineSelectedOptions, setCusineSelectedOptions] = useState([]);
  const [selectedAvailabilitySlot, setSelectedAvailabilitySlot] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

  // Serving size states
  const [grams, setGrams] = useState('');
  const [pieces, setPieces] = useState('');
  const [customPortion, setCustomPortion] = useState('');
  
  // Modal states
  const [isServSizeModalOpen, setServSizeModalOpen] = useState(false);

  // Steps configuration
  const steps = [
    { title: "Dish Details", component: DishDetailsScreen },
    { title: "Description", component: DescriptionScreen },
    { title: "More Information", component: MoreInfoScreen },
    { title: "Ingredients", component: IngredientsScreen },
    { title: "Dietary", component: DietaryScreen },
    { title: "Photo", component: PhotoScreen },
  ];

useEffect(() => {
  const init = async () => {
    if (dishToEdit) {
      console.log("Loaded dish to edit:", dishToEdit);
      setChefMenu(dishToEdit);
      setIsUpdateDish(true);

      // Portion logic
      if (dishToEdit.base_type_id === 1) {
        setGrams(dishToEdit.portion_size || '');
      } else if (dishToEdit.base_type_id === 2) {
        setPieces(dishToEdit.portion_size || '');
      } else if (dishToEdit.base_type_id === 3) {
        setCustomPortion(dishToEdit.portion_size || '');
      }

      // Optional: log after slight delay
      setTimeout(() => {
        console.log("chefMenu after setting:", dishToEdit);
      }, 500);
    }

    await fetchInitialData();
  };

  init();
}, []);


  const fetchInitialData = async () => {
  try {
    const [
      foodTypeRes, 
      spiceLevelRes, 
      tagsRes, 
      portionTypesRes,
      heatInstructionRes,
      ingredientsRes,
    ] = await Promise.all([
      handleGetFoodType(authToken),
      handleGetSpiceLevel(authToken),
      handleGetTags(authToken),
      handleGetPortionType(authToken),
      handleGetHeatingInstruction(authToken),
      handleGetIngredients(authToken),
    ]);

    // ⬇️ Add this after previous data
    const timeSlotRes = await handleGetAvailabilityTimeSlot();
    const formattedTimeSlots = timeSlotRes.map(slot => ({
      id: slot.id,
      label: `${slot.start_time} - ${slot.end_time}`,
    }));
    setTimeSlot(formattedTimeSlots);

    // ⬇️ Selected availability slots if editing
    if (dishToEdit?.availability_time_slots?.length > 0) {
      const selected = formattedTimeSlots.filter(slot =>
        dishToEdit.availability_time_slots.includes(slot.id)
      );
      setSelectedAvailabilitySlot(selected);
    }

      setFoodType(foodTypeRes);
      setSpiceLevel(spiceLevelRes);
      
      // Format tags for multi-select
      const formatedTags = tagsRes.map(tag => ({ 
        id: tag.id, 
        value: tag.name, 
        label: tag.name 
      }));
      setTagOptions(formatedTags);
      
      setPortionTypes(portionTypesRes);
      setHeatInstruction(heatInstructionRes);
      
      // Format ingredients for multi-select
      const formatedIngredients = ingredientsRes.map(ing => ({
        id: ing.id,
        value: ing.name,
        label: ing.name
      }));
      setIngredientOptions(formatedIngredients);

      // If editing, set selected values
      if (dishToEdit) {
        // Set selected tags
        if (dishToEdit.tags && dishToEdit.tags.length > 0) {
          const temp = formatedTags.filter(item =>
            dishToEdit.tags.split(", ").some(elem => elem === item.value)
          );
          setCusineSelectedOptions(temp);
        }
        
        // Set selected ingredients
        if (dishToEdit.ingredients && dishToEdit.ingredients.length > 0) {
          const ingredientsArray = formatedIngredients.filter(item =>
            dishToEdit.ingredients.some(id => id === item.id)
          );
          setSelectedIngredients(ingredientsArray);
        }
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      Alert.alert("Error", "Failed to load required data");
    }
  };

  const updateFields = (fields) => {
    setChefMenu(prev => ({ ...prev, ...fields }));
  };

  const onNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const onBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

const onSubmit = async () => {
  try {
    const formData = new FormData();

    // Handle availability_time_slots
   // ✅ Updated code block
if (Array.isArray(selectedAvailabilitySlot)) {
  selectedAvailabilitySlot
    .filter(slot => slot?.id !== undefined && slot?.id !== null)
    .forEach(slot => {
      formData.append('availability_time_slots[]', String(slot.id));
    });
}


    // Handle days of week
    const days = [
      'is_monday', 'is_tuesday', 'is_wednesday',
      'is_thursday', 'is_friday', 'is_saturday', 'is_sunday'
    ];
    
    days.forEach(day => {
      formData.append(day, chefMenu[day] ? '1' : '0');
    });

    // Handle other fields
    const fieldsToInclude = [
      'name', 'description', 'food_type_id', 'side_item',
      'spice_level_id', 'base_type_id', 'portion_size',
      'portion_type_id', 'chef_earning_fee', 'platform_price',
      'delivery_price', 'heating_instruction_id', 'prep_time',
      'shelf_life', 'is_vegetarian', 'is_vegan', 'is_gluten_free',
      'is_halal', 'item_limit', 'limit_item_availibility',
      'limit_start', 'limit_end'
    ];

    fieldsToInclude.forEach(field => {
      const value = chefMenu[field];
      if (value !== undefined && value !== null) {
        formData.append(field, String(value));
      }
    });

    // Handle tags
    if (cusineSelectedOptions.length > 0) {
      const tagsString = cusineSelectedOptions.map(opt => opt.label).join(', ');
      formData.append('tags', tagsString);
    }

    // Handle ingredients
    const ingredientIds = selectedIngredients.map(ing => ing.id);
    ingredientIds.forEach(id => {
      formData.append('ingredients[]', String(id));
    });

    // Submit data
    if (isUpdateDish) {
      await handleUpdateMenu(chefMenu.id, authToken, formData);
    } else {
      await handleCreateMenu(authToken, formData);
    }
    
    router.back();
  } catch (error) {
    console.error("Error fetching initial data:", error);
    Alert.alert("Error", "Failed to load required data");
  }
};

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{steps[currentStep].title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <CurrentStepComponent 
          {...chefMenu} 
          updateFields={updateFields}
          isEdit={isUpdateDish}
          foodType={foodType}
          spiceLevel={spiceLevel}
          tagOptions={tagOptions}
          cusineSelectedOptions={cusineSelectedOptions}
          setCusineSelectedOptions={setCusineSelectedOptions}
          portionTypes={portionTypes}
          grams={grams}
          pieces={pieces}
          customPortion={customPortion}
          setGrams={setGrams}
          setPieces={setPieces}
          setCustomPortion={setCustomPortion}
          isServSizeModalOpen={isServSizeModalOpen}
          setServSizeModalOpen={setServSizeModalOpen}
          heatInstruction={heatInstruction}
          ingredientOptions={ingredientOptions}
          selectedIngredients={selectedIngredients}
          setSelectedIngredients={setSelectedIngredients}
          timeSlot={timeSlot}
          selectedAvailabilitySlot={selectedAvailabilitySlot}
          setSelectedAvailabilitySlot={setSelectedAvailabilitySlot}
        />
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < steps.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.submitButtonText}>Finish</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Serving Size Modal */}
      <ServingSizeModal
        isOpen={isServSizeModalOpen}
        onClose={() => setServSizeModalOpen(false)}
        {...chefMenu}
        updateFields={updateFields}
        portionTypes={portionTypes}
        grams={grams}
        pieces={pieces}
        customPortion={customPortion}
        setGrams={setGrams}
        setPieces={setPieces}
        setCustomPortion={setCustomPortion}
      />
    </SafeAreaView>
  );
};

// Step 1: Dish Details
const DishDetailsScreen = ({
  name,
  food_type_id,
  side_item,
  spice_level_id,
  tags,
  base_type_id,
  portion_size,
  portion_type_id,
  chef_earning_fee,
  platform_price,
  delivery_price,
  updateFields,
  isEdit,
  foodType,
  spiceLevel,
  tagOptions,
  cusineSelectedOptions,
  setCusineSelectedOptions,
  portionTypes,
  grams,
  pieces,
  customPortion,
  setGrams,
  setPieces,
  setCustomPortion,
  isServSizeModalOpen,
  setServSizeModalOpen,
}) => {
  const handleCusineSelectChange = (selectedValues) => {
    let tags_string = "";
    selectedValues.forEach((element, index) => {
      if (index === 0) {
        tags_string += element.value;
      } else {
        tags_string += `, ${element.value}`;
      }
    });
    setCusineSelectedOptions(selectedValues);
    updateFields({ tags: tags_string });
  };

  const handleSpiceLevelChange = (value) => {
    updateFields({ spice_level_id: value });
  };

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
          {foodType.map((type) => (
            <TouchableOpacity
              key={type.id}
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
              Let us know if the customer needs to purchase a side item (e.g. rice, bread or a vegetable) separately for this dish.
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
        <Text style={styles.inputSubLabel}>Select a spice option for your dish</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={spice_level_id}
            onValueChange={handleSpiceLevelChange}
            style={styles.picker}
          >
            <Picker.Item label="--- Select Spice Option ---" value="" />
            {spiceLevel.map((option) => (
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
        <Text style={styles.inputSubLabel}>
          Add up to 5 cuisine tags for your dish. You can arrange the tags in the order of importance.
        </Text>
        <View style={styles.multiSelectContainer}>
          <MultiSelect
            data={tagOptions}
            labelField="label"
            valueField="value"
            placeholder="+ Add geographical cuisine tags"
            value={cusineSelectedOptions}
            onChange={handleCusineSelectChange}
            style={styles.multiSelect}
            placeholderStyle={styles.multiSelectPlaceholder}
            selectedTextStyle={styles.multiSelectSelectedText}
            containerStyle={styles.multiSelectDropdown}
            itemTextStyle={styles.multiSelectItemText}
            activeColor="#fef2f2"
          />
        </View>
        <View style={styles.selectedTagsContainer}>
          {cusineSelectedOptions.map((option) => (
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
            onPress={() => setServSizeModalOpen(true)}
          >
            <Text style={styles.addServingButtonText}>
              {isEdit ? "Edit Base Serving" : "Add Base Serving"}
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
                {base_type_id === 1 && "Container" ||
                 base_type_id === 2 && "Pieces" ||
                 base_type_id === 3 && "Other"}
              </Text>
              <Text style={styles.tableCell}>
                {base_type_id === 1 && `${grams} grams`}
                {base_type_id === 2 && `${pieces} pieces`}
                {base_type_id === 3 && customPortion}
              </Text>
              <Text style={styles.tableCell}>
                {portionTypes.find(item => item.id === portion_type_id)?.name || ""}
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

// Step 2: Description
// Updated DescriptionScreen component
const DescriptionScreen = ({
  description,
  item_limit,
  is_monday,
  is_tuesday,
  is_wednesday,
  is_thursday,
  is_friday,
  is_saturday,
  is_sunday,
  availability_time_slots,
  limit_item_availibility,
  limit_start,
  limit_end,
  updateFields,
  selectedAvailabilitySlot,
  setSelectedAvailabilitySlot,
}) => {
  const [timeSlot, setTimeSlot] = useState([]);

  // ✅ Fetch time slots on mount
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const slots = await handleGetAvailabilityTimeSlot();
        const formattedSlots = slots?.map((slot) => ({
          id: slot.id,
          label: slot.name,
        })) || [];
        setTimeSlot(formattedSlots);
      } catch (error) {
        console.error("Error fetching availability time slots:", error.message);
      }
    };
    fetchTimeSlots();
  }, []);

  const handleAvailabilitySlotChange = (selectedIds) => {
    const selectedItems = timeSlot.filter((slot) =>
      selectedIds.includes(slot.id)
    );
    setSelectedAvailabilitySlot(selectedItems);
    const ids = selectedItems.map((item) => item.id);
    updateFields({ availability_time_slots: ids });
  };

  const handleLimitItemAvailabilityChange = (value) => {
    updateFields({ limit_item_availibility: value });
    if (!value) {
      updateFields({ limit_start: "", limit_end: "" });
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Description & Dish Availability</Text>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={description}
          onChangeText={(text) => updateFields({ description: text })}
          placeholder="Description of Dish..."
          multiline
          numberOfLines={4}
          maxLength={400}
        />
        <Text style={styles.charCount}>{description?.length || 0} / 400</Text>
      </View>

      {/* Dish Order Limit */}
      <View style={styles.divider} />
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Dish Order Limit</Text>
        <TextInput
          style={styles.input}
          value={item_limit ? String(item_limit) : ""}
          onChangeText={(text) => {
            const value = parseInt(text, 10);
            updateFields({
              item_limit: isNaN(value)
                ? ""
                : value > 0 && value <= 100
                ? value
                : item_limit,
            });
          }}
          placeholder="1 / 100"
          keyboardType="numeric"
        />
      </View>

      {/* Day-based Availability */}
      <View style={styles.divider} />
      <Text style={styles.inputLabel}>Dish Availability (Days)</Text>
      <View style={styles.daysContainer}>
        {[
          { id: "monday", label: "Mon", value: is_monday },
          { id: "tuesday", label: "Tue", value: is_tuesday },
          { id: "wednesday", label: "Wed", value: is_wednesday },
          { id: "thursday", label: "Thu", value: is_thursday },
          { id: "friday", label: "Fri", value: is_friday },
          { id: "saturday", label: "Sat", value: is_saturday },
          { id: "sunday", label: "Sun", value: is_sunday },
        ].map((day) => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayButton,
              day.value === 1 && styles.dayButtonActive,
            ]}
            onPress={() =>
              updateFields({ [`is_${day.id}`]: day.value === 1 ? 0 : 1 })
            }
          >
            <Text
              style={[
                styles.dayButtonText,
                day.value === 1 && styles.dayButtonTextActive,
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Availability Slot (MultiSelect) */}
      <Text style={[styles.inputLabel, { marginTop: 20 }]}>Availability Slot</Text>
      <View style={styles.multiSelectContainer}>
        <MultiSelect
          data={timeSlot}
          labelField="label"
          valueField="id"
          placeholder="+ Select Availability Time"
          value={selectedAvailabilitySlot.map((item) => item.id)}
          onChange={handleAvailabilitySlotChange}
          style={styles.multiSelect}
          placeholderStyle={styles.multiSelectPlaceholder}
          selectedTextStyle={styles.multiSelectSelectedText}
          containerStyle={styles.multiSelectDropdown}
          itemTextStyle={styles.multiSelectItemText}
        />
      </View>
      <View style={styles.selectedTagsContainer}>
        {selectedAvailabilitySlot.map((option) => (
          <View key={option.id} style={styles.tag}>
            <Text style={styles.tagText}>{option.label}</Text>
          </View>
        ))}
      </View>

      {/* Limit Item Availability */}
      <View style={styles.divider} />
      <Text style={styles.inputLabel}>Limit Item Availability</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={limit_item_availibility || ""}
          onValueChange={handleLimitItemAvailabilityChange}
          style={styles.picker}
        >
          <Picker.Item label="No Limit" value="" />
          <Picker.Item label="Available On" value="Available On" />
          <Picker.Item label="Unavailable On" value="Unavailable On" />
          <Picker.Item label="Available During" value="Available During" />
          <Picker.Item label="Unavailable During" value="Unavailable During" />
        </Picker>
      </View>

      {/* Limit Date Range */}
      <View style={styles.dateContainer}>
        <View style={styles.dateInput}>
          <Text style={styles.dateLabel}>Start Date</Text>
          <TextInput
            style={styles.input}
            value={formatDateForInput(limit_start)}
            onChangeText={(text) => updateFields({ limit_start: text })}
            placeholder="YYYY-MM-DD"
            editable={!!limit_item_availibility}
          />
        </View>
        <View style={styles.dateInput}>
          <Text style={styles.dateLabel}>End Date</Text>
          <TextInput
            style={styles.input}
            value={formatDateForInput(limit_end)}
            onChangeText={(text) => updateFields({ limit_end: text })}
            placeholder="YYYY-MM-DD"
            editable={!!limit_item_availibility}
          />
        </View>
      </View>
    </View>
  );
};

// Step 3: More Information
const MoreInfoScreen = ({
  prep_time,
  shelf_life,
  heating_instruction_id,
  updateFields,
  heatInstruction
}) => {
  // Ensure heatInstruction is always an array
  const safeHeatInstruction = heatInstruction || [];

  return (
    <View>
      <Text style={styles.sectionTitle}>More Information</Text>

      {/* Heating Instruction Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Heating Instructions</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={heating_instruction_id || ""}
            onValueChange={(value) =>
              updateFields({ heating_instruction_id: value })
            }
            style={styles.picker}
          >
            <Picker.Item label="--- Select Heating Instruction ---" value="" />
            {safeHeatInstruction.map((option) => (
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

      {/* Preparation Time */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Preparation Time (minutes)</Text>
        <TextInput
          style={styles.input}
          value={prep_time ? String(prep_time) : ''}
          onChangeText={(text) =>
            updateFields({ prep_time: parseInt(text) || 0 })
          }
          placeholder="e.g. 30"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.divider} />

      {/* Shelf Life */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Shelf Life (days)</Text>
        <TextInput
          style={styles.input}
          value={shelf_life ? String(shelf_life) : ''}
          onChangeText={(text) =>
            updateFields({ shelf_life: parseInt(text) || 0 })
          }
          placeholder="e.g. 3"
          keyboardType="numeric"
        />
      </View>
    </View>
  );
};

// Step 4: Ingredients
const IngredientsScreen = ({
  ingredients,
  updateFields,
  ingredientOptions,
  selectedIngredients,
  setSelectedIngredients
}) => {
  const handleIngredientChange = (selectedItems) => {
    setSelectedIngredients(selectedItems);
    const ingredientIds = selectedItems.map(item => item.id);
    updateFields({ ingredients: ingredientIds });
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Select Ingredients</Text>
        <Text style={styles.inputSubLabel}>
          Select all ingredients used in this dish
        </Text>
        <View style={styles.multiSelectContainer}>
          <MultiSelect
            data={ingredientOptions}
            labelField="label"
            valueField="value"
            placeholder="+ Add ingredients"
            value={selectedIngredients}
            onChange={handleIngredientChange}
            style={styles.multiSelect}
            placeholderStyle={styles.multiSelectPlaceholder}
            selectedTextStyle={styles.multiSelectSelectedText}
            containerStyle={styles.multiSelectDropdown}
            itemTextStyle={styles.multiSelectItemText}
            activeColor="#fef2f2"
          />
        </View>
        <View style={styles.selectedTagsContainer}>
          {selectedIngredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.tag}>
              <Text style={styles.tagText}>{ingredient.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Step 5: Dietary
const DietaryScreen = ({
  is_vegetarian,
  is_vegan,
  is_gluten_free,
  is_halal,
  updateFields
}) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Dietary Information</Text>
      
      <View style={styles.dietaryRow}>
        <Text style={styles.dietaryLabel}>Vegetarian</Text>
        <Switch
          value={is_vegetarian === 1}
          onValueChange={(value) => updateFields({ is_vegetarian: value ? 1 : 0 })}
        />
      </View>
      
      <View style={styles.dietaryRow}>
        <Text style={styles.dietaryLabel}>Vegan</Text>
        <Switch
          value={is_vegan === 1}
          onValueChange={(value) => updateFields({ is_vegan: value ? 1 : 0 })}
        />
      </View>
      
      <View style={styles.dietaryRow}>
        <Text style={styles.dietaryLabel}>Gluten Free</Text>
        <Switch
          value={is_gluten_free === 1}
          onValueChange={(value) => updateFields({ is_gluten_free: value ? 1 : 0 })}
        />
      </View>
      
      <View style={styles.dietaryRow}>
        <Text style={styles.dietaryLabel}>Halal</Text>
        <Switch
          value={is_halal === 1}
          onValueChange={(value) => updateFields({ is_halal: value ? 1 : 0 })}
        />
      </View>
    </View>
  );
};

// Step 6: Photo
const PhotoScreen = ({ logo, updateFields }) => {
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "Please enable camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      updateFields({ 
        logo: {
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          fileName: selectedImage.fileName || 'dish.jpg'
        }
      });
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Dish Photo</Text>
      <View style={styles.photoContainer}>
        {logo ? (
          <Image 
            source={{ uri: typeof logo === 'string' ? logo : logo.uri }} 
            style={styles.dishImage} 
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="camera" size={40} color="#ccc" />
          </View>
        )}
        
        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
          <Text style={styles.addPhotoButtonText}>
            {logo ? "Change Photo" : "Add Photo"}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.photoNote}>
          Add an attractive photo of your dish (max 5MB)
        </Text>
      </View>
    </View>
  );
};

const ServingSizeModal = ({
  isOpen,
  onClose,
  base_type_id,
  portion_type_id,
  portion_size,
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
  const [localDeliveryPrice, setLocalDeliveryPrice] = useState(delivery_price || '');
  const [localPlatformPrice, setLocalPlatformPrice] = useState(platform_price || '');
  const [localChefEarning, setLocalChefEarning] = useState(chef_earning_fee || '');

  useEffect(() => {
    if (isOpen) {
      setLocalBaseType(base_type_id || 1);
      setLocalPortionType(portion_type_id || '');
      setLocalGrams(grams || '');
      setLocalPieces(pieces || '');
      setLocalCustomPortion(customPortion || '');
      setLocalDeliveryPrice(delivery_price || '');
      setLocalPlatformPrice(platform_price || '');
      setLocalChefEarning(chef_earning_fee || '');
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
      portion_type_id: localPortionType,
      portion_size: portionSize,
      delivery_price: localDeliveryPrice,
      platform_price: localPlatformPrice,
      chef_earning_fee: localChefEarning,
    });

    // Update local state for serving size
    if (localBaseType === 1) {
      setGrams(localGrams);
    } else if (localBaseType === 2) {
      setPieces(localPieces);
    } else if (localBaseType === 3) {
      setCustomPortion(localCustomPortion);
    }

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
                  onValueChange={setLocalPortionType}
                  style={modalStyles.picker}
                >
                  <Picker.Item label="Select Portion Type" value="" />
                  {portionTypes.map((type) => (
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
                  parseFloat(localChefEarning || 0) + 
                  parseFloat(localPlatformPrice || 0) + 
                  parseFloat(localDeliveryPrice || 0)
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  radioText: {
    color: '#64748b',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#dc2626',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    color: '#333',
  },
  unit: {
    paddingRight: 12,
    color: '#64748b',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#333',
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginTop: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  inputSubLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#333',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  foodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodTypeButton: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 12,
  },
  foodTypeButtonSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  foodTypeIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  foodTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  sideItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    marginLeft: 12,
  },
  switchButtons: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  switchButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchButtonActive: {
    backgroundColor: '#dc2626',
  },
  switchButtonText: {
    color: '#64748b',
    fontWeight: '500',
  },
  switchButtonTextActive: {
    color: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#333',
  },
  multiSelectContainer: {
    marginTop: 8,
  },
  multiSelect: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  multiSelectPlaceholder: {
    color: '#64748b',
  },
  multiSelectSelectedText: {
    color: '#333',
  },
  multiSelectDropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  multiSelectItemText: {
    color: '#333',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#fef2f2',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  tagText: {
    color: '#dc2626',
    fontSize: 12,
  },
  servingSizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addServingButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#dc2626',
    borderRadius: 20,
  },
  addServingButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  servingSizeTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeader: {
    flex: 1,
    padding: 12,
    fontWeight: 'bold',
    backgroundColor: '#f8fafc',
    color: '#333',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    color: '#333',
  },
  dietaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dietaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  dishImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  addPhotoButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    marginBottom: 16,
  },
   daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayButtonActive: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ff8c00',
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayButtonTextActive: {
    color: '#ff8c00',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#888',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dateInput: {
    width: '48%',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addPhotoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photoNote: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AddNewDishScreen;