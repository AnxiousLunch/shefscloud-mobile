import React from 'react';
import { View, Text, Switch } from 'react-native';
import { StepProps } from '@/types/ChefMenuTypes';
import { styles } from '@/styles/addNewDishStyles';

const DietaryScreen: React.FC<StepProps> = ({
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

export default DietaryScreen;