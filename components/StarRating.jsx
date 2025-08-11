// StarRating.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const StarRating = ({ rating, reviewCount, starSize = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.ratingBadge}>
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <MaterialIcons key={`full-${i}`} name="star" size={starSize} color="#FFD700" />
        ))}
        
        {hasHalfStar && (
          <MaterialIcons key="half" name="star-half" size={starSize} color="#FFD700" />
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <MaterialIcons key={`empty-${i}`} name="star-border" size={starSize} color="#FFD700" />
        ))}
      </View>
      <Text style={styles.ratingText}>
        {rating} ({reviewCount})
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ratingBadge: {
    flexDirection: 'row',
    backgroundColor: '#ffc00047',
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default StarRating;