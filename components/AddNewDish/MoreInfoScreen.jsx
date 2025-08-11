import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StepProps } from '@/types/ChefMenuTypes';
import { styles } from '@/styles/addNewDishStyles';

const MoreInfoScreen = ({
  prep_time,
  shelf_life,
  heating_instruction_id,
  updateFields,
  heatInstruction
}) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>More Information</Text>

      {/* Heating Instruction */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Heating Instructions</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={heating_instruction_id}
            onValueChange={(value) => updateFields({ heating_instruction_id: value })}
            style={styles.picker}
          >
            <Picker.Item label="--- Select Heating Instruction ---" value="" />
            {heatInstruction?.map((option) => (
              <Picker.Item
                key={option.id}
                label={option.title}
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
          onChangeText={(text) => updateFields({ prep_time: parseInt(text) || 0 })}
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
          onChangeText={(text) => updateFields({ shelf_life: parseInt(text) || 0 })}
          placeholder="e.g. 3"
          keyboardType="numeric"
        />
      </View>
    </View>
  );
};

export default MoreInfoScreen;