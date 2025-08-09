import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MultiSelect } from 'react-native-element-dropdown';
import { StepProps } from '@/types/ChefMenuTypes';
import { styles } from '@/styles/addNewDishStyles';
import { handleGetAvailabilityTimeSlot } from '@/services/shef';
import { formatDateForInput } from '@/utils/helpers';

const DescriptionScreen: React.FC<StepProps> = ({
  description,
  item_limit,
  is_monday,
  is_tuesday,
  is_wednesday,
  is_thursday,
  is_friday,
  is_saturday,
  is_sunday,
  limit_item_availibility,
  limit_start,
  limit_end,
  updateFields,
  selectedAvailabilitySlot,
  setSelectedAvailabilitySlot,
}) => {
  const [timeSlot, setTimeSlot] = useState<any[]>([]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const slots = await handleGetAvailabilityTimeSlot();
        const formattedSlots = slots?.map((slot: any) => ({
          id: slot.id,
          label: `${slot.start_time} - ${slot.end_time}`,
          start_time: slot.start_time,
          end_time: slot.end_time
        })) || [];
        setTimeSlot(formattedSlots);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };
    fetchTimeSlots();
  }, []);

  const handleAvailabilitySlotChange = (selectedIds: any[]) => {
    const selectedItems = timeSlot.filter((slot) => selectedIds.includes(slot.id));
    setSelectedAvailabilitySlot?.(selectedItems);
    const ids = selectedItems.map((item) => item.id);
    updateFields({ availability_time_slots: ids });
  };

  const handleLimitItemAvailabilityChange = (value: string) => {
    const boolValue = value === "true";
    updateFields({ limit_item_availibility: boolValue });
    if (!boolValue) {
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
              item_limit: isNaN(value) ? null : 
                value > 0 && value <= 100 ? value : item_limit,
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
              day.value && styles.dayButtonActive,
            ]}
            onPress={() => updateFields({ [`is_${day.id}`]: !day.value })}
          >
            <Text
              style={[
                styles.dayButtonText,
                day.value && styles.dayButtonTextActive,
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Availability Slot */}
      <Text style={[styles.inputLabel, { marginTop: 20 }]}>Availability Slot</Text>
      <View style={styles.multiSelectContainer}>
        <MultiSelect
          data={timeSlot}
          labelField="label"
          valueField="id"
          placeholder="+ Select Availability Time"
          value={selectedAvailabilitySlot?.map(item => item.id)}
          onChange={handleAvailabilitySlotChange}
          style={styles.multiSelect}
          placeholderStyle={styles.multiSelectPlaceholder}
          selectedTextStyle={styles.multiSelectSelectedText}
          containerStyle={styles.multiSelectDropdown}
          itemTextStyle={styles.multiSelectItemText}
        />
      </View>
      <View style={styles.selectedTagsContainer}>
        {selectedAvailabilitySlot?.map((option) => (
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
          selectedValue={limit_item_availibility?.toString() || ""}
          onValueChange={handleLimitItemAvailabilityChange}
          style={styles.picker}
        >
          <Picker.Item label="No Limit" value="" />
          <Picker.Item label="Available On" value="true" />
          <Picker.Item label="Unavailable On" value="false" />
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
            editable={limit_item_availibility !== undefined}
          />
        </View>
        <View style={styles.dateInput}>
          <Text style={styles.dateLabel}>End Date</Text>
          <TextInput
            style={styles.input}
            value={formatDateForInput(limit_end)}
            onChangeText={(text) => updateFields({ limit_end: text })}
            placeholder="YYYY-MM-DD"
            editable={limit_item_availibility !== undefined}
          />
        </View>
      </View>
    </View>
  );
};

export default DescriptionScreen;