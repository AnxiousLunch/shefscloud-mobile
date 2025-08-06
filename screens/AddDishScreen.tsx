// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Image, TextInput, Alert } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/store/store';
// import { 
//   handleGetFoodType, 
//   handleGetSpiceLevel, 
//   handleGetTags, 
//   handleGetPortionType,
//   handleGetHeatingInstruction,
//   handleGetIngredients,
//   handleCreateMenu,
//   handleUpdateMenu
// } from '@/services/get_methods';
// import { Picker } from '@react-native-picker/picker';
// import * as ImagePicker from 'expo-image-picker';
// import { chefMenuInitialState } from '@/constants/initialStates';
// import { MultiSelect } from 'react-native-element-dropdown';
// import { formatDateForInput } from '@/utils/helpers';

// const AddDishScreen = ({ route }) => {
//   const { authToken } = useSelector((state: RootState) => state.user);
//   const navigation = useNavigation();
//   const { dishToEdit } = route.params || {};
  
//   const [chefMenu, setChefMenu] = useState(chefMenuInitialState);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isUpdateDish, setIsUpdateDish] = useState(false);
  
//   // Data for dropdowns
//   const [foodType, setFoodType] = useState([]);
//   const [spiceLevel, setSpiceLevel] = useState([]);
//   const [tagOptions, setTagOptions] = useState([]);
//   const [portionTypes, setPortionTypes] = useState([]);
//   const [heatInstruction, setHeatInstruction] = useState([]);
//   const [ingredientOptions, setIngredientOptions] = useState([]);
//   const [timeSlot, setTimeSlot] = useState([]);
  
//   // Selected values for multi-select
//   const [cusineSelectedOptions, setCusineSelectedOptions] = useState([]);
//   const [selectedAvailabilitySlot, setSelectedAvailabilitySlot] = useState([]);
//   const [selectedIngredients, setSelectedIngredients] = useState([]);
//   const [selectedCities, setSelectedCities] = useState([]);

//   // Serving size states
//   const [grams, setGrams] = useState('');
//   const [pieces, setPieces] = useState('');
//   const [customPortion, setCustomPortion] = useState('');
  
//   // Modal states
//   const [isServSizeModalOpen, setServSizeModalOpen] = useState(false);

//   // Steps configuration
//   const steps = [
//     { title: "Dish Details", component: DishDetailsScreen },
//     // { title: "Description", component: DescriptionScreen },
//     // { title: "More Information", component: MoreInfoScreen },
//     // { title: "Ingredients", component: IngredientsScreen },
//     // { title: "Dietary", component: DietaryScreen },
//     // { title: "Photo", component: PhotoScreen },
//   ];

//   useEffect(() => {
//     if (dishToEdit) {
//       setChefMenu(dishToEdit);
//       setIsUpdateDish(true);
      
//       // Set serving size based on base_type_id
//       if (dishToEdit.base_type_id === 1) {
//         setGrams(dishToEdit.portion_size || '');
//       } else if (dishToEdit.base_type_id === 2) {
//         setPieces(dishToEdit.portion_size || '');
//       } else if (dishToEdit.base_type_id === 3) {
//         setCustomPortion(dishToEdit.portion_size || '');
//       }
//     }
    
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       // Fetch all required data
//       const [
//         foodTypeRes, 
//         spiceLevelRes, 
//         tagsRes, 
//         portionTypesRes,
//         heatInstructionRes,
//         ingredientsRes,
//       ] = await Promise.all([
//         handleGetFoodType(authToken),
//         handleGetSpiceLevel(authToken),
//         handleGetTags(authToken),
//         handleGetPortionType(authToken),
//         handleGetHeatingInstruction(authToken),
//         handleGetIngredients(authToken),
//       ]);

//       setFoodType(foodTypeRes);
//       setSpiceLevel(spiceLevelRes);
      
//       // Format tags for multi-select
//       const formatedTags = tagsRes.map(tag => ({ 
//         id: tag.id, 
//         value: tag.name, 
//         label: tag.name 
//       }));
//       setTagOptions(formatedTags);
      
//       setPortionTypes(portionTypesRes);
//       setHeatInstruction(heatInstructionRes);
      
//       // Format ingredients for multi-select
//       const formatedIngredients = ingredientsRes.map(ing => ({
//         id: ing.id,
//         value: ing.name,
//         label: ing.name
//       }));
//       setIngredientOptions(formatedIngredients);

//       // If editing, set selected values
//       if (dishToEdit) {
//         // Set selected tags
//         if (dishToEdit.tags && dishToEdit.tags.length > 0) {
//           const temp = formatedTags.filter(item =>
//             dishToEdit.tags.split(", ").some(elem => elem === item.value)
//           );
//           setCusineSelectedOptions(temp);
//         }
        
//         // Set selected ingredients
//         if (dishToEdit.ingredients && dishToEdit.ingredients.length > 0) {
//           const ingredientsArray = formatedIngredients.filter(item =>
//             dishToEdit.ingredients.some(id => id === item.id)
//           );
//           setSelectedIngredients(ingredientsArray);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching initial data:", error);
//       Alert.alert("Error", "Failed to load required data");
//     }
//   };

//   const updateFields = (fields) => {
//     setChefMenu(prev => ({ ...prev, ...fields }));
//   };

//   const onNext = () => {
//     if (currentStep < steps.length - 1) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const onBack = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const onSubmit = async () => {
//     try {
//       // Prepare form data
//       const formData = new FormData();
      
//       // Append all fields
//       Object.keys(chefMenu).forEach(key => {
//         if (key === 'logo' && typeof chefMenu[key] !== 'string') {
//           formData.append('logo', {
//             uri: chefMenu.logo.uri,
//             name: chefMenu.logo.fileName || 'dish.jpg',
//             type: chefMenu.logo.type || 'image/jpeg'
//           });
//         } else if (Array.isArray(chefMenu[key])) {
//           chefMenu[key].forEach(item => formData.append(`${key}[]`, item));
//         } else {
//           formData.append(key, chefMenu[key]);
//         }
//       });

//       if (isUpdateDish) {
//         await handleUpdateMenu(chefMenu.id, authToken, formData);
//         Alert.alert("Success", "Dish updated successfully");
//       } else {
//         await handleCreateMenu(authToken, formData);
//         Alert.alert("Success", "Dish created successfully");
//       }
      
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error submitting dish:", error);
//       Alert.alert("Error", error.message || "Failed to submit dish");
//     }
//   };

//   const CurrentStepComponent = steps[currentStep].component;

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="close" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{steps[currentStep].title}</Text>
//         <View style={{ width: 24 }} />
//       </View>

//       <ScrollView style={styles.content}>
//         <CurrentStepComponent 
//           {...chefMenu} 
//           updateFields={updateFields}
//           isEdit={isUpdateDish}
//           foodType={foodType}
//           spiceLevel={spiceLevel}
//           tagOptions={tagOptions}
//           cusineSelectedOptions={cusineSelectedOptions}
//           setCusineSelectedOptions={setCusineSelectedOptions}
//           portionTypes={portionTypes}
//           grams={grams}
//           pieces={pieces}
//           customPortion={customPortion}
//           setGrams={setGrams}
//           setPieces={setPieces}
//           setCustomPortion={setCustomPortion}
//           isServSizeModalOpen={isServSizeModalOpen}
//           setServSizeModalOpen={setServSizeModalOpen}
//           heatInstruction={heatInstruction}
//           ingredientOptions={ingredientOptions}
//           selectedIngredients={selectedIngredients}
//           setSelectedIngredients={setSelectedIngredients}
//           timeSlot={timeSlot}
//           selectedAvailabilitySlot={selectedAvailabilitySlot}
//           setSelectedAvailabilitySlot={setSelectedAvailabilitySlot}
//         />
//       </ScrollView>

//       <View style={styles.footer}>
//         {currentStep > 0 && (
//           <TouchableOpacity style={styles.backButton} onPress={onBack}>
//             <Text style={styles.backButtonText}>Back</Text>
//           </TouchableOpacity>
//         )}

//         {currentStep < steps.length - 1 ? (
//           <TouchableOpacity style={styles.nextButton} onPress={onNext}>
//             <Text style={styles.nextButtonText}>Next</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
//             <Text style={styles.submitButtonText}>Finish</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Serving Size Modal */}
//       <ServingSizeModal
//         isOpen={isServSizeModalOpen}
//         onClose={() => setServSizeModalOpen(false)}
//         {...chefMenu}
//         updateFields={updateFields}
//         portionTypes={portionTypes}
//         grams={grams}
//         pieces={pieces}
//         customPortion={customPortion}
//         setGrams={setGrams}
//         setPieces={setPieces}
//         setCustomPortion={setCustomPortion}
//       />
//     </SafeAreaView>
//   );
// };

// const DishDetailsScreen = ({
//   name,
//   food_type_id,
//   side_item,
//   spice_level_id,
//   tags,
//   base_type_id,
//   portion_size,
//   portion_type_id,
//   chef_earning_fee,
//   platform_price,
//   delivery_price,
//   updateFields,
//   isEdit,
//   foodType,
//   spiceLevel,
//   tagOptions,
//   cusineSelectedOptions,
//   setCusineSelectedOptions,
//   portionTypes,
//   grams,
//   pieces,
//   customPortion,
//   setGrams,
//   setPieces,
//   setCustomPortion,
//   isServSizeModalOpen,
//   setServSizeModalOpen,
// }) => {
//   const handleCusineSelectChange = (selectedValues) => {
//     let tags_string = "";
//     selectedValues.forEach((element, index) => {
//       if (index === 0) {
//         tags_string += element.value;
//       } else {
//         tags_string += `, ${element.value}`;
//       }
//     });
//     setCusineSelectedOptions(selectedValues);
//     updateFields({ tags: tags_string });
//   };

//   const handleSpiceLevelChange = (value) => {
//     updateFields({ spice_level_id: value });
//   };

//   return (
//     <View>
//       <Text style={styles.sectionTitle}>Dish Detail</Text>
      
//       {/* Dish Name */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>Dish Name</Text>
//         <Text style={styles.inputSubLabel}>Example: Mama Maria's Lasagna</Text>
//         <TextInput
//           style={styles.input}
//           value={name}
//           onChangeText={(text) => updateFields({ name: text })}
//           placeholder="Name your Dish"
//           maxLength={50}
//         />
//       </View>

//       <View style={styles.divider} />

//       {/* Food Type */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>Food Type</Text>
//         <View style={styles.foodTypeContainer}>
//           {foodType.map((type) => (
//             <TouchableOpacity
//               key={type.id}
//               style={[
//                 styles.foodTypeButton,
//                 food_type_id === type.id && styles.foodTypeButtonSelected,
//               ]}
//               onPress={() => updateFields({ food_type_id: type.id })}
//             >
//               <Image
//                 source={{ uri: type.image }}
//                 style={styles.foodTypeIcon}
//               />
//               <Text style={styles.foodTypeText}>{type.name}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Side Item */}
//       <View style={styles.inputGroup}>
//         <View style={styles.sideItemContainer}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.inputLabel}>Does this main need a side?</Text>
//             <Text style={styles.inputSubLabel}>
//               Let us know if the customer needs to purchase a side item (e.g. rice, bread or a vegetable) separately for this dish.
//             </Text>
//           </View>
//           <View style={styles.switchContainer}>
//             <View style={styles.switchButtons}>
//               <TouchableOpacity
//                 style={[
//                   styles.switchButton,
//                   side_item === 1 && styles.switchButtonActive,
//                 ]}
//                 onPress={() => updateFields({ side_item: 1 })}
//               >
//                 <Text style={[
//                   styles.switchButtonText,
//                   side_item === 1 && styles.switchButtonTextActive,
//                 ]}>
//                   Yes
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[
//                   styles.switchButton,
//                   side_item === 0 && styles.switchButtonActive,
//                 ]}
//                 onPress={() => updateFields({ side_item: 0 })}
//               >
//                 <Text style={[
//                   styles.switchButtonText,
//                   side_item === 0 && styles.switchButtonTextActive,
//                 ]}>
//                   No
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       {/* Spice Level */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>Spice options</Text>
//         <Text style={styles.inputSubLabel}>Select a spice option for your dish</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={spice_level_id}
//             onValueChange={handleSpiceLevelChange}
//             style={styles.picker}
//           >
//             <Picker.Item label="--- Select Spice Option ---" value="" />
//             {spiceLevel.map((option) => (
//               <Picker.Item 
//                 key={option.id} 
//                 label={option.name} 
//                 value={option.id} 
//               />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       {/* Dish Cuisine Tags */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>Dish cuisine tags</Text>
//         <Text style={styles.inputSubLabel}>
//           Add up to 5 cuisine tags for your dish. You can arrange the tags in the order of importance.
//         </Text>
//         <View style={styles.multiSelectContainer}>
//           <MultiSelect
//             data={tagOptions}
//             labelField="label"
//             valueField="value"
//             placeholder="+ Add geographical cuisine tags"
//             value={cusineSelectedOptions}
//             onChange={handleCusineSelectChange}
//             style={styles.multiSelect}
//             placeholderStyle={styles.multiSelectPlaceholder}
//             selectedTextStyle={styles.multiSelectSelectedText}
//             containerStyle={styles.multiSelectDropdown}
//             itemTextStyle={styles.multiSelectItemText}
//             activeColor="#fef2f2"
//           />
//         </View>
//         <View style={styles.selectedTagsContainer}>
//           {cusineSelectedOptions.map((option) => (
//             <View key={option.value} style={styles.tag}>
//               <Text style={styles.tagText}>{option.label}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* Serving Size */}
//       <View style={styles.inputGroup}>
//         <View style={styles.servingSizeHeader}>
//           <View>
//             <Text style={styles.inputLabel}>Serving size options</Text>
//             <Text style={styles.inputSubLabel}>Base serving size</Text>
//           </View>
//           <TouchableOpacity 
//             style={styles.addServingButton}
//             onPress={() => setServSizeModalOpen(true)}
//           >
//             <Text style={styles.addServingButtonText}>
//               {isEdit ? "Edit Base Serving" : "Add Base Serving"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {base_type_id && portion_type_id && chef_earning_fee && (
//           <View style={styles.servingSizeTable}>
//             <View style={styles.tableRow}>
//               <Text style={styles.tableHeader}>Base Type</Text>
//               <Text style={styles.tableHeader}>Portion Size</Text>
//               <Text style={styles.tableHeader}>Serving</Text>
//               <Text style={styles.tableHeader}>Price</Text>
//             </View>
//             <View style={styles.tableRow}>
//               <Text style={styles.tableCell}>
//                 {base_type_id === 1 && "Container" ||
//                  base_type_id === 2 && "Pieces" ||
//                  base_type_id === 3 && "Other"}
//               </Text>
//               <Text style={styles.tableCell}>
//                 {base_type_id === 1 && `${grams} grams`}
//                 {base_type_id === 2 && `${pieces} pieces`}
//                 {base_type_id === 3 && customPortion}
//               </Text>
//               <Text style={styles.tableCell}>
//                 {portionTypes.find(item => item.id === portion_type_id)?.name || ""}
//               </Text>
//               <Text style={styles.tableCell}>
//                 {chef_earning_fee?.toLocaleString('en-PK', {
//                   style: 'currency',
//                   currency: 'PKR',
//                 })}
//               </Text>
//             </View>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// const ServingSizeModal = ({
//   isOpen,
//   onClose,
//   base_type_id,
//   portion_type_id,
//   portion_size,
//   delivery_price,
//   platform_price,
//   chef_earning_fee,
//   updateFields,
//   portionTypes,
//   grams,
//   pieces,
//   customPortion,
//   setGrams,
//   setPieces,
//   setCustomPortion,
// }) => {
//   const [localBaseType, setLocalBaseType] = useState(base_type_id || 1);
//   const [localPortionType, setLocalPortionType] = useState(portion_type_id || '');
//   const [localGrams, setLocalGrams] = useState(grams || '');
//   const [localPieces, setLocalPieces] = useState(pieces || '');
//   const [localCustomPortion, setLocalCustomPortion] = useState(customPortion || '');
//   const [localDeliveryPrice, setLocalDeliveryPrice] = useState(delivery_price || '');
//   const [localPlatformPrice, setLocalPlatformPrice] = useState(platform_price || '');
//   const [localChefEarning, setLocalChefEarning] = useState(chef_earning_fee || '');

//   useEffect(() => {
//     if (isOpen) {
//       setLocalBaseType(base_type_id || 1);
//       setLocalPortionType(portion_type_id || '');
//       setLocalGrams(grams || '');
//       setLocalPieces(pieces || '');
//       setLocalCustomPortion(customPortion || '');
//       setLocalDeliveryPrice(delivery_price || '');
//       setLocalPlatformPrice(platform_price || '');
//       setLocalChefEarning(chef_earning_fee || '');
//     }
//   }, [isOpen]);

//   const handleSave = () => {
//     let portionSize = '';
//     if (localBaseType === 1) {
//       portionSize = localGrams;
//     } else if (localBaseType === 2) {
//       portionSize = localPieces;
//     } else if (localBaseType === 3) {
//       portionSize = localCustomPortion;
//     }

//     updateFields({
//       base_type_id: localBaseType,
//       portion_type_id: localPortionType,
//       portion_size: portionSize,
//       delivery_price: localDeliveryPrice,
//       platform_price: localPlatformPrice,
//       chef_earning_fee: localChefEarning,
//     });

//     // Update local state for serving size
//     if (localBaseType === 1) {
//       setGrams(localGrams);
//     } else if (localBaseType === 2) {
//       setPieces(localPieces);
//     } else if (localBaseType === 3) {
//       setCustomPortion(localCustomPortion);
//     }

//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <Modal
//       visible={isOpen}
//       transparent={true}
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={modalStyles.overlay}>
//         <View style={modalStyles.container}>
//           <View style={modalStyles.header}>
//             <Text style={modalStyles.title}>Base Serving Size</Text>
//             <TouchableOpacity onPress={onClose}>
//               <Ionicons name="close" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={modalStyles.content}>
//             {/* Base Type Selection */}
//             <View style={modalStyles.inputGroup}>
//               <Text style={modalStyles.label}>Base Type</Text>
//               <View style={modalStyles.radioGroup}>
//                 <TouchableOpacity
//                   style={[
//                     modalStyles.radioButton,
//                     localBaseType === 1 && modalStyles.radioButtonSelected,
//                   ]}
//                   onPress={() => setLocalBaseType(1)}
//                 >
//                   <Text style={[
//                     modalStyles.radioText,
//                     localBaseType === 1 && modalStyles.radioTextSelected,
//                   ]}>
//                     Container
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[
//                     modalStyles.radioButton,
//                     localBaseType === 2 && modalStyles.radioButtonSelected,
//                   ]}
//                   onPress={() => setLocalBaseType(2)}
//                 >
//                   <Text style={[
//                     modalStyles.radioText,
//                     localBaseType === 2 && modalStyles.radioTextSelected,
//                   ]}>
//                     Pieces
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[
//                     modalStyles.radioButton,
//                     localBaseType === 3 && modalStyles.radioButtonSelected,
//                   ]}
//                   onPress={() => setLocalBaseType(3)}
//                 >
//                   <Text style={[
//                     modalStyles.radioText,
//                     localBaseType === 3 && modalStyles.radioTextSelected,
//                   ]}>
//                     Other
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Portion Size Input */}
//             <View style={modalStyles.inputGroup}>
//               <Text style={modalStyles.label}>Portion Size</Text>
//               {localBaseType === 1 && (
//                 <View style={modalStyles.inputWithUnit}>
//                   <TextInput
//                     style={modalStyles.input}
//                     keyboardType="numeric"
//                     value={localGrams}
//                     onChangeText={setLocalGrams}
//                     placeholder="Enter grams"
//                   />
//                   <Text style={modalStyles.unit}>grams</Text>
//                 </View>
//               )}
//               {localBaseType === 2 && (
//                 <View style={modalStyles.inputWithUnit}>
//                   <TextInput
//                     style={modalStyles.input}
//                     keyboardType="numeric"
//                     value={localPieces}
//                     onChangeText={setLocalPieces}
//                     placeholder="Enter pieces"
//                   />
//                   <Text style={modalStyles.unit}>pieces</Text>
//                 </View>
//               )}
//               {localBaseType === 3 && (
//                 <TextInput
//                   style={modalStyles.input}
//                   value={localCustomPortion}
//                   onChangeText={setLocalCustomPortion}
//                   placeholder="Enter custom portion"
//                 />
//               )}
//             </View>

//             {/* Portion Type Selection */}
//             <View style={modalStyles.inputGroup}>
//               <Text style={modalStyles.label}>Serving</Text>
//               <View style={modalStyles.pickerContainer}>
//                 <Picker
//                   selectedValue={localPortionType}
//                   onValueChange={setLocalPortionType}
//                   style={modalStyles.picker}
//                 >
//                   <Picker.Item label="Select Portion Type" value="" />
//                   {portionTypes.map((type) => (
//                     <Picker.Item 
//                       key={type.id} 
//                       label={type.name} 
//                       value={type.id} 
//                     />
//                   ))}
//                 </Picker>
//               </View>
//             </View>

//             {/* Pricing */}
//             <View style={modalStyles.inputGroup}>
//               <Text style={modalStyles.label}>Chef Earning Fee (PKR)</Text>
//               <TextInput
//                 style={modalStyles.input}
//                 keyboardType="numeric"
//                 value={localChefEarning}
//                 onChangeText={setLocalChefEarning}
//                 placeholder="Enter amount"
//               />
//             </View>

//             <View style={modalStyles.inputGroup}>
//               <Text style={modalStyles.label}>Platform Price (PKR)</Text>
//               <TextInput
//                 style={modalStyles.input}
//                 keyboardType="numeric"
//                 value={localPlatformPrice}
//                 onChangeText={setLocalPlatformPrice}
//                 placeholder="Enter amount"
//               />
//             </View>

//             <View style={modalStyles.inputGroup}>
//               <Text style={modalStyles.label}>Delivery Price (PKR)</Text>
//               <TextInput
//                 style={modalStyles.input}
//                 keyboardType="numeric"
//                 value={localDeliveryPrice}
//                 onChangeText={setLocalDeliveryPrice}
//                 placeholder="Enter amount"
//               />
//             </View>

//             <View style={modalStyles.priceSummary}>
//               <Text style={modalStyles.summaryLabel}>Total Price:</Text>
//               <Text style={modalStyles.summaryValue}>
//                 {(
//                   parseFloat(localChefEarning || 0) + 
//                   parseFloat(localPlatformPrice || 0) + 
//                   parseFloat(localDeliveryPrice || 0)
//                 ).toLocaleString('en-PK', {
//                   style: 'currency',
//                   currency: 'PKR',
//                 })}
//               </Text>
//             </View>
//           </ScrollView>

//           <View style={modalStyles.footer}>
//             <TouchableOpacity 
//               style={modalStyles.cancelButton}
//               onPress={onClose}
//             >
//               <Text style={modalStyles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={modalStyles.saveButton}
//               onPress={handleSave}
//             >
//               <Text style={modalStyles.saveButtonText}>Save</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const modalStyles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     width: '90%',
//     maxHeight: '80%',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   content: {
//     padding: 16,
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   radioGroup: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   radioButton: {
//     flex: 1,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 8,
//     marginRight: 8,
//     alignItems: 'center',
//   },
//   radioButtonSelected: {
//     borderColor: '#dc2626',
//     backgroundColor: '#fef2f2',
//   },
//   radioText: {
//     color: '#64748b',
//     fontWeight: '500',
//   },
//   radioTextSelected: {
//     color: '#dc2626',
//   },
//   inputWithUnit: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 8,
//     paddingLeft: 12,
//   },
//   input: {
//     flex: 1,
//     height: 48,
//     paddingHorizontal: 12,
//     color: '#333',
//   },
//   unit: {
//     paddingRight: 12,
//     color: '#64748b',
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   picker: {
//     height: 48,
//     width: '100%',
//     color: '#333',
//   },
//   priceSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: '#f8fafc',
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   summaryLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   summaryValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#dc2626',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#dc2626',
//     borderRadius: 8,
//     marginRight: 8,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: '#dc2626',
//     fontWeight: 'bold',
//   },
//   saveButton: {
//     flex: 1,
//     padding: 12,
//     backgroundColor: '#dc2626',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// // Individual Screen Components would go here (DishDetailsScreen, DescriptionScreen, etc.)
// // I'll provide these in the next message due to length limitations

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//   },
//   backButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderWidth: 1,
//     borderColor: '#dc2626',
//     borderRadius: 8,
//   },
//   backButtonText: {
//     color: '#dc2626',
//     fontWeight: 'bold',
//   },
//   nextButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     backgroundColor: '#dc2626',
//     borderRadius: 8,
//   },
//   nextButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   submitButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     backgroundColor: '#dc2626',
//     borderRadius: 8,
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default AddDishScreen;