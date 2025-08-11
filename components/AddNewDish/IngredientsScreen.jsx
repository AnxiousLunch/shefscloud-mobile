import React from 'react';
import { View, Text } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { styles } from '@/styles/addNewDishStyles';

const IngredientsScreen = ({
  updateFields,
  ingredientOptions,
  selectedIngredients,
  setSelectedIngredients
}) => {
  const handleIngredientChange = (selectedItems) => {
    setSelectedIngredients?.(selectedItems);
    const ingredientIds = selectedItems.map(item => item.id);
    updateFields({ ingredients: ingredientIds });
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Select Ingredients</Text>
        <Text style={styles.inputSubLabel}>Select all ingredients used</Text>
        <View style={styles.multiSelectContainer}>
          <MultiSelect
            data={ingredientOptions || []}
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
          {selectedIngredients?.map((ingredient) => (
            <View key={`ingredient-${ingredient.id}`} style={styles.tag}>
              <Text style={styles.tagText}>{ingredient.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default IngredientsScreen;