import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const MapWithConditionalRendering = ({ coordinates, onDragEnd, showMap }) => {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (showMap) {
      setMapReady(false); // reset map state when shown
    }
  }, [showMap]);

  const handleMapReady = () => {
    setTimeout(() => setMapReady(true), 500); // simulate delay
  };

  const handleMarkerDragEnd = (e) => {
    const newCoords = e.nativeEvent.coordinate;
    if (onDragEnd) {
      onDragEnd(newCoords);
    }
  };

  if (!showMap) {
    return <Text>Map is hidden</Text>;
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...coordinates,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onMapReady={handleMapReady}
      >
        {mapReady && (
          <Marker
            ref={markerRef}
            coordinate={coordinates}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 400,
  },
  map: {
    flex: 1,
  },
});

export default MapWithConditionalRendering;
