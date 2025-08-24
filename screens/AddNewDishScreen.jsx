import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { handleGetAvailabilityTimeSlot } from '@/services/shef'; 
import { 
  handleGetFoodType, 
  handleGetSpiceLevel, 
  handleGetTags, 
  handleGetPortionType,
  handleGetHeatingInstruction,
  handleGetIngredients,
  handleCreateMenu,
} from '@/services/get_methods';
import { chefMenuInitialState } from '@/constants/initialStates';
import DishDetailsScreen from '@/components/AddNewDish/DishDetailScreen';
import DescriptionScreen from '@/components/AddNewDish/DescriptionScreen';
import MoreInfoScreen from '@/components/AddNewDish/MoreInfoScreen';
import IngredientsScreen from '@/components/AddNewDish/IngredientsScreen';
import DietaryScreen from '@/components/AddNewDish/DietaryScreen';
import PhotoScreen from '@/components/AddNewDish/PhotoScreen';
import ServingSizeModal from '@/components/AddNewDish/ServingsSizeModal';
import { styles } from '@/styles/addNewDishStyles';
import { handleGetCitites } from '@/services/get_methods';

const AddNewDishScreen = () => {
  const authToken = useSelector((state) => state.user.userInfo?.access_token);
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [dishToEdit, setDishToEdit] = useState(null);
  const [chefMenu, setChefMenu] = useState(chefMenuInitialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [isUpdateDish, setIsUpdateDish] = useState(false);
  
  const [foodType, setFoodType] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [portionTypes, setPortionTypes] = useState([]);
  const [heatInstruction, setHeatInstruction] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [timeSlot, setTimeSlot] = useState([]);
  
  const [cusineSelectedOptions, setCusineSelectedOptions] = useState([]);
  const [selectedAvailabilitySlot, setSelectedAvailabilitySlot] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const [grams, setGrams] = useState('');
  const [pieces, setPieces] = useState('');
  const [customPortion, setCustomPortion] = useState('');
  const [isServSizeModalOpen, setServSizeModalOpen] = useState(false);

  const [citiesOption, setCitiesOption] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);


  const steps = [
    { title: "Dish Details", component: DishDetailsScreen },
    { title: "Description", component: DescriptionScreen },
    { title: "More Information", component: MoreInfoScreen },
    { title: "Ingredients", component: IngredientsScreen },
    { title: "Dietary", component: DietaryScreen },
    { title: "Photo", component: PhotoScreen },
  ];

  useEffect(() => {
    if (params.dishToEdit) {
      try {
        const parsed = JSON.parse(params.dishToEdit);
        setDishToEdit(parsed);
      } catch (error) {
        console.error("Error parsing dishToEdit:", error);
      }
    }
  }, [params.dishToEdit]);

  useEffect(() => {
    const init = async () => {
      if (dishToEdit) {
        setChefMenu(dishToEdit);
        setIsUpdateDish(true);

        if (dishToEdit.base_type_id === 1) setGrams(dishToEdit.portion_size || '');
        else if (dishToEdit.base_type_id === 2) setPieces(dishToEdit.portion_size || '');
        else if (dishToEdit.base_type_id === 3) setCustomPortion(dishToEdit.portion_size || '');
      }

      await fetchInitialData();
    };
    init();
  }, [dishToEdit]);

  const fetchInitialData = async () => {
    try {
      const [
        foodTypeRes,
        spiceLevelRes,
        tagsRes,
        portionTypesRes,
        heatInstructionRes,
        ingredientsRes,
        timeSlotRes,
        citiesRes
      ] = await Promise.all([
        handleGetFoodType(authToken),
        handleGetSpiceLevel(authToken),
        handleGetTags(authToken),
        handleGetPortionType(authToken),
        handleGetHeatingInstruction(authToken),
        handleGetIngredients(authToken),
        handleGetAvailabilityTimeSlot(),
        handleGetCitites()
      ]);

      const formattedTimeSlots = timeSlotRes.map((slot) => ({
        id: slot.id,
        label: `${slot.start_time} - ${slot.end_time}`,
        start_time: slot.start_time,
        end_time: slot.end_time
      }));
      setTimeSlot(formattedTimeSlots);

      if (dishToEdit?.availability_time_slots?.length) {
        const selected = formattedTimeSlots.filter(slot => 
          dishToEdit.availability_time_slots.includes(slot.id)
        );
        setSelectedAvailabilitySlot(selected);
      }

      const formattedCities = citiesRes.map(city => ({
        id: city.id,
        value: city.name,
        label: city.name,
        country_id: city.country_id
      }));
      setCitiesOption(formattedCities);

      if (dishToEdit?.cities?.length) {
        const citiesArray = formattedCities.filter(city => 
          dishToEdit.cities.includes(city.id)
        );
        setSelectedCities(citiesArray);
      }

      setFoodType(foodTypeRes);
      setSpiceLevel(spiceLevelRes);

      const formatedTags = tagsRes.map((tag) => ({
        id: tag.id,
        value: tag.name,
        label: tag.name,
      }));
      setTagOptions(formatedTags);

      setPortionTypes(portionTypesRes);
      setHeatInstruction(heatInstructionRes);

      const formatedIngredients = ingredientsRes.map((ing) => ({
        id: ing.id,
        value: ing.name,
        label: ing.name,
      }));
      setIngredientOptions(formatedIngredients);

      if (dishToEdit) {
        if (dishToEdit.tags) {
          const temp = formatedTags.filter(item => 
            dishToEdit.tags.split(", ").some(elem => elem === item.value)
          );
          setCusineSelectedOptions(temp);
        }

        if (dishToEdit.ingredients) {
          const ingredientsArray = formatedIngredients.filter(item => 
            dishToEdit.ingredients.some(id => id === item.id)
          );
          setSelectedIngredients(ingredientsArray);
        }
      }
    } catch (error) {
      console.error("Error in fetchInitialData:", error);
      Alert.alert("Error", "Failed to load required data");
    }
  };

  const updateFields = (fields) => {
    setChefMenu(prev => ({ ...prev, ...fields }));
  };

  const onNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const onBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

    const toggleCitySelection = (city) => {
    setSelectedCities(prev => {
      const isSelected = prev.some(c => c.id === city.id);
      if (isSelected) {
        return prev.filter(c => c.id !== city.id);
      } else {
        return [...prev, city];
      }
    });
  };

  const onSubmit = async () => {
    try {
      if (!authToken) {
        Alert.alert('Error', 'Authentication token missing');
        return;
      }

      if (!chefMenu.logo?.uri) {
        Alert.alert('Warning', 'Please select an image');
        return;
      }

      const formData = new FormData();

      // Add time slots
      selectedAvailabilitySlot.forEach(slot => {
        formData.append('availability_time_slots[]', String(slot.id));
      });

      // Add days of week
      const days = ['is_monday', 'is_tuesday', 'is_wednesday', 'is_thursday', 
                   'is_friday', 'is_saturday', 'is_sunday'];
      days.forEach(day => {
        formData.append(day, chefMenu[day] ? '1' : '0');
      });

      // Add other fields
      const fields = {
        name: chefMenu.name,
        description: chefMenu.description,
        food_type_id: chefMenu.food_type_id,
        side_item: chefMenu.side_item,
        spice_level_id: chefMenu.spice_level_id,
        base_type_id: chefMenu.base_type_id,
        portion_size: chefMenu.portion_size,
        portion_type_id: chefMenu.portion_type_id,
        chef_earning_fee: chefMenu.chef_earning_fee,
        platform_price: chefMenu.platform_price,
        delivery_price: chefMenu.delivery_price,
        heating_instruction_id: chefMenu.heating_instruction_id,
        prep_time: chefMenu.prep_time,
        shelf_life: chefMenu.shelf_life,
        is_halal: chefMenu.is_halal ? '1' : '0',
        item_limit: chefMenu.item_limit,
        limit_item_availibility: chefMenu.limit_item_availibility ? '1' : '0',
        expiry_days: chefMenu.expiry_days,
        packaging: '1',
        user_id: '74'
      };

      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Add tags
      const tagsValue = cusineSelectedOptions.length > 0 
        ? cusineSelectedOptions.map(opt => opt.label).join(',')
        : 'general';
      formData.append('tags', tagsValue);

      selectedCities.forEach(city => {
        formData.append('cities[]', String(city.id));
      });


      // Add image
      const uriParts = chefMenu.logo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('logo', {
        uri: chefMenu.logo.uri,
        name: `dish_${Date.now()}.${fileType}`,
        type: `image/${fileType}`
      });

      // Make API call
      const response = await handleCreateMenu(authToken, formData);
      Alert.alert('Success', 'Dish created successfully!');
      router.back();
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to create dish');
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

      <ScrollView style={styles.content} nestedScrollEnabled={true}>
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
          citiesOption={citiesOption}
          selectedCities={selectedCities}
          toggleCitySelection={toggleCitySelection}
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

export default AddNewDishScreen;