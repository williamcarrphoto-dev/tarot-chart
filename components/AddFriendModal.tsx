import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Friend, ZodiacSign } from '../types';
import { ZODIAC_SIGNS, getSunSign } from '../lib/astrology';
import { calculateAstrologicalSigns, canCalculateSigns } from '../lib/astrologyCalculator';
import LocationSearch from './LocationSearch';

interface Props {
  visible: boolean;
  existing?: Friend | null;
  onSave: (friend: Friend) => void;
  onClose: () => void;
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function AddFriendModal({
  visible,
  existing,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState('');
  const [day, setDay] = useState('01');
  const [month, setMonth] = useState('01');
  const [year, setYear] = useState(String(new Date().getFullYear() - 25));
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [birthLocation, setBirthLocation] = useState('');
  const [sunSign, setSunSign] = useState<ZodiacSign | ''>('');
  const [moonSign, setMoonSign] = useState<ZodiacSign | ''>('');
  const [risingSign, setRisingSign] = useState<ZodiacSign | ''>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existing) {
      const [ey, em, ed] = existing.birthDate.split('-');
      setDay(ed);
      setMonth(em);
      setYear(ey);
      const [eh, emin] = existing.birthTime.split(':');
      setHour(eh);
      setMinute(emin);
      setName(existing.name);
      setBirthLocation(existing.birthLocation);
      setSunSign(existing.sunSign);
      setMoonSign(existing.moonSign);
      setRisingSign(existing.risingSign);
      setNotes(existing.notes ?? '');
    } else {
      setName('');
      setDay('01');
      setMonth('01');
      setYear(String(new Date().getFullYear() - 25));
      setHour('12');
      setMinute('00');
      setBirthLocation('');
      setSunSign('');
      setMoonSign('');
      setRisingSign('');
      setNotes('');
    }
  }, [existing, visible]);

  // Auto-calculate all signs when birth data changes
  useEffect(() => {
    async function autoCalculateSigns() {
      const birthDate = `${year}-${month}-${day}`;
      const birthTime = `${hour}:${minute}`;
      
      if (canCalculateSigns(birthDate, birthTime, birthLocation)) {
        const signs = await calculateAstrologicalSigns({
          date: birthDate,
          time: birthTime,
          location: birthLocation,
        });
        
        if (signs.sun) setSunSign(signs.sun);
        if (signs.moon) setMoonSign(signs.moon);
        if (signs.rising) setRisingSign(signs.rising);
      } else {
        // Fallback to just sun sign if we don't have all data
        const derived = getSunSign(birthDate);
        if (derived) setSunSign(derived);
      }
    }
    
    autoCalculateSigns();
  }, [day, month, year, hour, minute, birthLocation]);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this person.');
      return;
    }
    const friend: Friend = {
      id: existing?.id ?? uuid(),
      name: name.trim(),
      birthDate: `${year}-${month}-${day}`,
      birthTime: `${hour}:${minute}`,
      birthLocation: birthLocation.trim(),
      sunSign,
      moonSign,
      risingSign,
      notes: notes.trim() || undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    onSave(friend);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {existing ? 'Edit Profile' : 'New Profile'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Field label="Name *">
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Luna"
                placeholderTextColor="#5c3d8f"
                autoCapitalize="words"
              />
            </Field>

            <Field label="Birth Date">
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Day</Text>
                  <ScrollPicker values={DAYS} selected={day} onSelect={setDay} />
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Month</Text>
                  <ScrollPicker values={MONTHS} selected={MONTHS[parseInt(month, 10) - 1]} onSelect={(v) => setMonth(String(MONTHS.indexOf(v) + 1).padStart(2, '0'))} />
                </View>
                <View style={[styles.rowItem, { flex: 1.4 }]}>
                  <Text style={styles.rowLabel}>Year</Text>
                  <ScrollPicker values={YEARS} selected={year} onSelect={setYear} />
                </View>
              </View>
            </Field>

            <Field label="Birth Time">
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Hour</Text>
                  <ScrollPicker values={HOURS} selected={hour} onSelect={setHour} />
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.rowLabel}>Minute</Text>
                  <ScrollPicker values={MINUTES} selected={minute} onSelect={setMinute} />
                </View>
              </View>
            </Field>

            <Field label="Birth Location">
              <LocationSearch
                value={birthLocation}
                onSelect={(location, coords) => {
                  console.log('📍 Location selected:', location, coords);
                  setBirthLocation(location);
                }}
                placeholder="Search for birth location..."
              />
            </Field>

            <Text style={styles.sectionHeader}>Astrology</Text>

            <Field label="☀ Sun Sign (auto-calculated)">
              <SignPicker value={sunSign} onChange={setSunSign} />
            </Field>

            <Field label="☽ Moon Sign">
              <SignPicker value={moonSign} onChange={setMoonSign} />
            </Field>

            <Field label="↑ Rising Sign">
              <SignPicker value={risingSign} onChange={setRisingSign} />
            </Field>

            <Field label="Notes">
              <TextInput
                style={[styles.input, styles.multiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any notes..."
                placeholderTextColor="#5c3d8f"
                multiline
                numberOfLines={3}
              />
            </Field>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {existing ? 'Save Changes' : 'Add to Stars ✦'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ScrollPicker({
  values,
  selected,
  onSelect,
}: {
  values: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <ScrollView
      style={styles.pickerScroll}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {values.map((v) => (
        <TouchableOpacity
          key={v}
          style={[styles.pickerItem, v === selected && styles.pickerItemActive]}
          onPress={() => onSelect(v)}
        >
          <Text style={[styles.pickerText, v === selected && styles.pickerTextActive]}>
            {v}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function SignPicker({
  value,
  onChange,
}: {
  value: ZodiacSign | '';
  onChange: (s: ZodiacSign | '') => void;
}) {
  const all: (ZodiacSign | '')[] = ['', ...ZODIAC_SIGNS];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.signScroll}
      contentContainerStyle={{ gap: 6, paddingVertical: 4 }}
    >
      {all.map((sign) => (
        <TouchableOpacity
          key={sign || 'none'}
          style={[
            styles.signChip,
            value === sign && styles.signChipActive,
          ]}
          onPress={() => onChange(sign)}
        >
          <Text
            style={[
              styles.signChipText,
              value === sign && styles.signChipTextActive,
            ]}
          >
            {sign || '—'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#160830',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: '#3a1f5e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a1248',
  },
  title: {
    color: '#ede0ff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#7c5cbf',
    fontSize: 18,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: '#9c7cbf',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: '#9c7cbf',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
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
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowItem: {
    flex: 1,
  },
  rowLabel: {
    color: '#5c3d8f',
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  pickerScroll: {
    height: 120,
    backgroundColor: '#1e0d38',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#3a1f5e',
  },
  pickerText: {
    color: '#7c5cbf',
    fontSize: 14,
    fontWeight: '500',
  },
  pickerTextActive: {
    color: '#ede0ff',
    fontWeight: '700',
  },
  signScroll: {
    flexGrow: 0,
  },
  signChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1e0d38',
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  signChipActive: {
    backgroundColor: '#3a1f5e',
    borderColor: '#d4b8f0',
  },
  signChipText: {
    color: '#7c5cbf',
    fontSize: 13,
    fontWeight: '600',
  },
  signChipTextActive: {
    color: '#ede0ff',
  },
  saveBtn: {
    backgroundColor: '#5c2fa8',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
