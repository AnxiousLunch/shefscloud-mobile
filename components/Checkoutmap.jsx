import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function CheckoutMap({ onLocationSelected }) {
  const [region, setRegion] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const [marker, setMarker] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        setIsLoading(false);
        onLocationSelected && onLocationSelected({ 
          latitude: 24.8607, 
          longitude: 67.0011 
        });
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        setMarker({ latitude, longitude });
        onLocationSelected && onLocationSelected({ latitude, longitude });
      } catch (error) {
        console.log("Location error:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleMarkerDrag = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    onLocationSelected && onLocationSelected({ latitude, longitude });
  };

  const handlePlaceSelect = (data, details = null) => {
    if (!details || !details.geometry || !details.geometry.location) return;
    
    const { lat, lng } = details.geometry.location;
    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setRegion(newRegion);
    setMarker({ latitude: lat, longitude: lng });
    
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
    
    onLocationSelected && onLocationSelected({ latitude: lat, longitude: lng });
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <><GooglePlacesAutocomplete
            placeholder="Search address"
            fetchDetails
            onPress={handlePlaceSelect}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY, // REPLACE WITH ACTUAL KEY
              language: "en",
            }}
            styles={{
              container: { 
                flex: 0, 
                position: "absolute", 
                width: "90%", 
                zIndex: 1,
                top: 10,
                alignSelf: 'center',
              },
              textInputContainer: {
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 8,
                paddingHorizontal: 10,
              },
              textInput: {
                height: 44,
                color: '#5d5d5d',
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
              },
              listView: { 
                backgroundColor: "white",
                marginTop: 10,
                borderRadius: 8,
                elevation: 3,
              },
            }}
          />
          <GooglePlacesAutocomplete
            placeholder="Search address"
            fetchDetails
            onPress={handlePlaceSelect}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY, // REPLACE WITH ACTUAL KEY
              language: "en",
            }}
            styles={{
              container: { 
                flex: 0, 
                position: "absolute", 
                width: "90%", 
                zIndex: 1,
                top: 10,
                alignSelf: 'center',
              },
              textInputContainer: {
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 8,
                paddingHorizontal: 10,
              },
              textInput: {
                height: 44,
                color: '#5d5d5d',
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
              },
              listView: { 
                backgroundColor: "white",
                marginTop: 10,
                borderRadius: 8,
                elevation: 3,
              },
            }}
          />

          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
          >
            <Marker
              coordinate={marker}
              draggable
              onDragEnd={handleMarkerDrag}
            />
          </MapView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 1.5,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 2,
  },
});