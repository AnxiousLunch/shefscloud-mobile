import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const MapWithConditionalRendering = ({ coordinates, onDragEnd, showMap }) => {
  const mapRef = useRef(null);

  // This handler is now correctly attached to the Marker
  const handleMarkerDragEnd = (e) => {
    const newCoords = e.nativeEvent.coordinate;
    if (onDragEnd) {
      onDragEnd(newCoords);
    }
  };

  if (!showMap) {
    return <Text>Map is hidden</Text>;
  }

  // Fallback coordinates in case the props are initially null/undefined
  const latitude = Number(coordinates?.latitude) || 24.8607;
  const longitude = Number(coordinates?.longitude) || 67.0011;

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map} // Fixed: Style is now applied
        initialRegion={{   // Recommended: Use initialRegion for better UX
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          draggable // Fixed: Marker is now draggable
          coordinate={{
            latitude: latitude,
            longitude: longitude,
          }}
          onDragEnd={handleMarkerDragEnd} // Fixed: Handler is attached
          title="Your Location"
          description="Drag to change your delivery location"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    // This style is in your CheckoutLogic component, but keeping it here for clarity
    // You can remove it if the parent already provides dimensions
    width: '100%',
    height: 300, 
  },
  map: {
    // This makes the map fill its container
    flex: 1, 
  },
});

export default MapWithConditionalRendering;