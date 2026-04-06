import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    suburb?: string;
    state?: string;
    country?: string;
  };
}

interface Props {
  value: string;
  onSelect: (location: string, coords: { lat: number; lng: number }) => void;
  placeholder?: string;
}

export default function LocationSearch({ value, onSelect, placeholder = 'Search location...' }: Props) {
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setSearchText(value);
  }, [value]);

  useEffect(() => {
    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchText.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true); // Show modal when user starts typing
    debounceTimer.current = setTimeout(() => {
      searchLocation(searchText);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchText]);

  async function searchLocation(query: string) {
    if (query.length < 3) return;

    setLoading(true);
    try {
      // Using Nominatim with CORS proxy workaround
      // We'll use photon API which is CORS-friendly
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const results: LocationResult[] = data.features.map((feature: any) => ({
          display_name: formatDisplayName(feature.properties),
          lat: feature.geometry.coordinates[1].toString(),
          lon: feature.geometry.coordinates[0].toString(),
          address: feature.properties,
        }));
        
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDisplayName(props: any): string {
    const parts = [];
    if (props.name) parts.push(props.name);
    if (props.city) parts.push(props.city);
    else if (props.town) parts.push(props.town);
    if (props.state) parts.push(props.state);
    if (props.country) parts.push(props.country);
    return parts.join(', ');
  }

  function handleSelect(result: LocationResult) {
    const displayName = result.display_name;
    setSearchText(displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    onSelect(displayName, {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={placeholder}
          placeholderTextColor="#5c3d8f"
        />
        {loading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#7c5cbf" />
          </View>
        )}
      </View>

      {/* Modal for suggestions dropdown */}
      <Modal
        visible={showSuggestions && suggestions.length > 0 && searchText.length >= 3}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.suggestionsContainer}>
              <ScrollView 
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
              >
                {suggestions.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSelect(result)}
                  >
                    <Text style={styles.suggestionText}>{result.display_name}</Text>
                    <Text style={styles.suggestionCoords}>
                      {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSuggestions(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#1e0d38',
    borderWidth: 1,
    borderColor: '#3a1f5e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ede0ff',
    fontSize: 15,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 5, 32, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
  },
  suggestionsContainer: {
    backgroundColor: '#0e0520',
    borderWidth: 2,
    borderColor: '#7c5cbf',
    borderRadius: 12,
    maxHeight: 400,
    shadowColor: '#7c5cbf',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  suggestionsList: {
    maxHeight: 320,
  },
  suggestionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a1248',
    backgroundColor: '#1a0d30',
  },
  suggestionText: {
    color: '#ede0ff',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  suggestionCoords: {
    color: '#9c7cbf',
    fontSize: 11,
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3a1f5e',
    backgroundColor: '#0e0520',
  },
  closeButtonText: {
    color: '#7c5cbf',
    fontSize: 13,
    fontWeight: '600',
  },
});
