import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { CARD_DESIGNS } from '../lib/cardDesigns';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  visible: boolean;
  currentDesign?: string;
  onSelect: (designId: string) => void;
  onUploadCustom?: (uri: string) => void;
  onClose: () => void;
}

export default function CardDesignSelector({ visible, currentDesign, onSelect, onUploadCustom, onClose }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            if (onUploadCustom) {
              onUploadCustom(event.target.result);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 1,
      });

      if (!result.canceled && onUploadCustom) {
        onUploadCustom(result.assets[0].uri);
      }
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Choose Card Design</Text>
          
          <ScrollView style={styles.scroll} contentContainerStyle={styles.grid}>
            {CARD_DESIGNS.map((design) => (
              <TouchableOpacity
                key={design.id}
                style={[
                  styles.designCard,
                  currentDesign === design.id && styles.selectedCard,
                ]}
                onPress={() => {
                  onSelect(design.id);
                  onClose();
                }}
              >
                <Image source={design.image} style={styles.designImage} resizeMode="cover" />
                <Text style={styles.designName}>{design.name}</Text>
                {currentDesign === design.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {onUploadCustom && (
              <TouchableOpacity
                style={[styles.designCard, styles.uploadCard]}
                onPress={handleUpload}
              >
                <Text style={styles.uploadIcon}>+</Text>
                <Text style={styles.designName}>Custom Upload</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 5, 32, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a0a2e',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  title: {
    color: '#ede0ff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  scroll: {
    maxHeight: 400,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  designCard: {
    width: 100,
    backgroundColor: '#120826',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a1248',
    overflow: 'hidden',
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#5c2fa8',
    borderWidth: 3,
  },
  designImage: {
    width: '100%',
    height: 140,
  },
  designName: {
    color: '#c8b0e8',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    padding: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#5c2fa8',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ede0ff',
    fontSize: 14,
    fontWeight: '700',
  },
  uploadCard: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    color: '#7c5cbf',
    fontSize: 48,
    fontWeight: '300',
  },
  closeButton: {
    backgroundColor: '#2a1248',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#d4b8f0',
    fontSize: 16,
    fontWeight: '700',
  },
});
