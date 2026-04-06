import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface Props {
  visible: boolean;
  onAdd: (code: string) => Promise<{ error: any }>;
  onClose: () => void;
}

export default function AddByCodeModal({ visible, onAdd, onClose }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd() {
    if (!code.trim()) {
      setError('Please enter a share code');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onAdd(code.trim());

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setCode('');
      setError('');
      setLoading(false);
    }
  }

  function handleClose() {
    setCode('');
    setError('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Friend by Code</Text>
          <Text style={styles.subtitle}>Enter your friend's share code</Text>

          <TextInput
            style={styles.input}
            placeholder="Share Code"
            placeholderTextColor="#7c5cbf"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAdd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ede0ff" />
              ) : (
                <Text style={styles.buttonText}>Add Friend</Text>
              )}
            </TouchableOpacity>
          </View>
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
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  title: {
    color: '#ede0ff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#7c5cbf',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#120826',
    borderWidth: 1,
    borderColor: '#2a1248',
    borderRadius: 12,
    padding: 16,
    color: '#ede0ff',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 16,
  },
  error: {
    color: '#e05c2a',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: '#2a1248',
    padding: 12,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a1248',
  },
  addButton: {
    backgroundColor: '#5c2fa8',
  },
  buttonText: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
  },
});
