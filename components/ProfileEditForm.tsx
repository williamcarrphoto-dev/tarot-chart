import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Profile } from '../lib/supabase-storage';
import { ZodiacSign } from '../types';
import { ZODIAC_SIGNS } from '../lib/astrology';
import { calculateAstrologicalSigns, canCalculateSigns } from '../lib/astrologyCalculator';
import LocationSearch from './LocationSearch';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

interface Props {
  profile: Profile;
  onSave: (data: Partial<Profile>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function ProfileEditForm({ profile, onSave, onCancel, saving }: Props) {
  const [name, setName] = useState(profile.name || '');
  const [day, setDay] = useState('01');
  const [month, setMonth] = useState('01');
  const [year, setYear] = useState(String(new Date().getFullYear() - 25));
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [birthLocation, setBirthLocation] = useState(profile.birth_location || '');
  const [sunSign, setSunSign] = useState<ZodiacSign | ''>((profile.sun_sign as ZodiacSign) || '');
  const [moonSign, setMoonSign] = useState<ZodiacSign | ''>((profile.moon_sign as ZodiacSign) || '');
  const [risingSign, setRisingSign] = useState<ZodiacSign | ''>((profile.rising_sign as ZodiacSign) || '');

  // Parse existing birth date and time on mount
  useEffect(() => {
    if (profile.birth_date) {
      const [y, m, d] = profile.birth_date.split('-');
      setYear(y);
      setMonth(m);
      setDay(d);
    }
    if (profile.birth_time) {
      const [h, min] = profile.birth_time.split(':');
      setHour(h);
      setMinute(min);
    }
  }, [profile]);

  // Auto-calculate signs when birth data changes
  useEffect(() => {
    async function autoCalculate() {
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
      }
    }
    autoCalculate();
  }, [day, month, year, hour, minute, birthLocation]);

  async function handleSave() {
    const birthDate = `${year}-${month}-${day}`;
    const birthTime = `${hour}:${minute}`;
    
    await onSave({
      name,
      birth_date: birthDate,
      birth_time: birthTime,
      birth_location: birthLocation,
      sun_sign: sunSign,
      moon_sign: moonSign,
      rising_sign: risingSign,
    });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Field label="Name">
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#5c3d8f"
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
            <ScrollPicker 
              values={MONTHS} 
              selected={MONTHS[parseInt(month, 10) - 1]} 
              onSelect={(v) => setMonth(String(MONTHS.indexOf(v) + 1).padStart(2, '0'))} 
            />
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
          placeholder="Search for your birth location..."
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

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ede0ff" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ScrollPicker({ values, selected, onSelect }: { values: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
      {values.map((v) => (
        <TouchableOpacity
          key={v}
          style={[styles.pickerItem, v === selected && styles.pickerItemActive]}
          onPress={() => onSelect(v)}
        >
          <Text style={[styles.pickerText, v === selected && styles.pickerTextActive]}>{v}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function SignPicker({ value, onChange }: { value: ZodiacSign | ''; onChange: (s: ZodiacSign | '') => void }) {
  const all: (ZodiacSign | '')[] = ['', ...ZODIAC_SIGNS];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.signScroll} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
      {all.map((sign) => (
        <TouchableOpacity
          key={sign || 'none'}
          style={[styles.signChip, value === sign && styles.signChipActive]}
          onPress={() => onChange(sign)}
        >
          <Text style={[styles.signChipText, value === sign && styles.signChipTextActive]}>
            {sign || '—'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowItem: {
    flex: 1,
  },
  rowLabel: {
    color: '#7c5cbf',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: 120,
    backgroundColor: '#1e0d38',
    borderWidth: 1,
    borderColor: '#3a1f5e',
    borderRadius: 10,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  pickerItemActive: {
    backgroundColor: '#2a1248',
  },
  pickerText: {
    color: '#7c5cbf',
    fontSize: 14,
    textAlign: 'center',
  },
  pickerTextActive: {
    color: '#ede0ff',
    fontWeight: '600',
  },
  signScroll: {
    flexGrow: 0,
  },
  signChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1e0d38',
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  signChipActive: {
    backgroundColor: '#7c5cbf',
    borderColor: '#7c5cbf',
  },
  signChipText: {
    color: '#7c5cbf',
    fontSize: 13,
    fontWeight: '600',
  },
  signChipTextActive: {
    color: '#ede0ff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a1248',
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  saveButton: {
    backgroundColor: '#7c5cbf',
  },
  buttonText: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '600',
  },
});
