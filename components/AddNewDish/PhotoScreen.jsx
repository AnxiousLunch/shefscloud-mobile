import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/styles/addNewDishStyles'; 

const PhotoScreen = ({ logo, updateFields }) => {
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll permissions needed');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        updateFields({
          logo: {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            fileName: asset.fileName || `dish_${Date.now()}.jpg`
          }
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Dish Photo</Text>
      <View style={styles.photoContainer}>
        {logo?.uri ? (
          <Image 
            source={{ uri: logo.uri }} 
            style={styles.dishImage} 
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="camera" size={40} color="#ccc" />
          </View>
        )}
        
        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
          <Text style={styles.addPhotoButtonText}>
            {logo?.uri ? "Change Photo" : "Add Photo"}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.photoNote}>
          Add an attractive photo of your dish (max 5MB)
        </Text>
      </View>
    </View>
  );
};

export default PhotoScreen;