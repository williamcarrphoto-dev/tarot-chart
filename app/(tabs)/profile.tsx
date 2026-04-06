import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, updateMyProfile, Profile } from '../../lib/supabase-storage';
import VideoBackground from '../../components/VideoBackground';
import { SIGN_SYMBOLS, getSunSign, getSignColor } from '../../lib/astrology';
import CardDesignSelector from '../../components/CardDesignSelector';
import { getCardDesign } from '../../lib/cardDesigns';
import { calculateAstrologicalSigns, canCalculateSigns } from '../../lib/astrologyCalculator';
import { ImageBackground } from 'react-native';

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [designModalVisible, setDesignModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    sun_sign: '',
    moon_sign: '',
    rising_sign: '',
    card_design: '',
  });

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  useEffect(() => {
    async function autoCalculateSigns() {
      if (canCalculateSigns(formData.birth_date, formData.birth_time, formData.birth_location)) {
        const signs = await calculateAstrologicalSigns({
          date: formData.birth_date,
          time: formData.birth_time,
          location: formData.birth_location,
        });
        
        setFormData(prev => ({
          ...prev,
          sun_sign: signs.sun || prev.sun_sign,
          moon_sign: signs.moon || prev.moon_sign,
          rising_sign: signs.rising || prev.rising_sign,
        }));
      }
    }

    if (editing) {
      autoCalculateSigns();
    }
  }, [formData.birth_date, formData.birth_time, formData.birth_location, editing]);

  async function loadProfile() {
    setLoading(true);
    const data = await getMyProfile();
    if (data) {
      console.log('📋 Profile loaded:', {
        name: data.name,
        card_design: data.card_design,
        hasCardDesign: !!data.card_design
      });
      setProfile(data);
      setFormData({
        name: data.name || '',
        birth_date: data.birth_date || '',
        birth_time: data.birth_time || '',
        birth_location: data.birth_location || '',
        sun_sign: data.sun_sign || '',
        moon_sign: data.moon_sign || '',
        rising_sign: data.rising_sign || '',
        card_design: data.card_design || '',
      });

      // Auto-calculate missing signs for existing users
      if (data.birth_date && data.birth_time && data.birth_location) {
        const needsCalculation = !data.moon_sign || !data.rising_sign;
        console.log('Checking if signs need calculation:', { 
          needsCalculation, 
          moon: data.moon_sign, 
          rising: data.rising_sign,
          hasDate: !!data.birth_date,
          hasTime: !!data.birth_time,
          hasLocation: !!data.birth_location
        });
        if (needsCalculation) {
          console.log('🌙 Recalculating missing signs for existing user...');
          await recalculateSigns(data);
        } else {
          console.log('✓ All signs already calculated');
        }
      } else {
        console.log('⚠️ Cannot auto-calculate signs - missing data:', {
          hasDate: !!data.birth_date,
          hasTime: !!data.birth_time,
          hasLocation: !!data.birth_location
        });
      }
    }
    setLoading(false);
  }

  async function recalculateSigns(profileData: Profile) {
    if (!canCalculateSigns(profileData.birth_date, profileData.birth_time, profileData.birth_location)) {
      console.log('Cannot calculate signs - missing data');
      return;
    }

    console.log('Calculating signs with:', {
      date: profileData.birth_date,
      time: profileData.birth_time,
      location: profileData.birth_location
    });

    const signs = await calculateAstrologicalSigns({
      date: profileData.birth_date!,
      time: profileData.birth_time!,
      location: profileData.birth_location!,
    });

    console.log('Calculated signs:', signs);

    // Only update if we got valid results
    if (signs.moon || signs.rising) {
      const updates: Partial<Profile> = {};
      if (signs.sun && !profileData.sun_sign) updates.sun_sign = signs.sun;
      if (signs.moon && !profileData.moon_sign) updates.moon_sign = signs.moon;
      if (signs.rising && !profileData.rising_sign) updates.rising_sign = signs.rising;

      console.log('Updating profile with:', updates);

      if (Object.keys(updates).length > 0) {
        await updateMyProfile(updates);
        await loadProfile(); // Reload to show updated data
        
        // Show success message to user
        const updatedSigns = [];
        if (updates.moon_sign) updatedSigns.push('Moon');
        if (updates.rising_sign) updatedSigns.push('Rising');
        if (updatedSigns.length > 0) {
          Alert.alert(
            '✨ Signs Calculated',
            `Your ${updatedSigns.join(' and ')} sign${updatedSigns.length > 1 ? 's have' : ' has'} been automatically calculated!`,
            [{ text: 'OK' }]
          );
        }
      }
    } else {
      console.log('❌ No valid signs calculated - check birth data');
    }
  }

  async function handleCardDesignSelect(designId: string) {
    setSaving(true);
    await updateMyProfile({ card_design: designId });
    await loadProfile();
    setSaving(false);
  }

  async function handleSave() {
    console.log('💾 Saving profile...', formData);
    setSaving(true);
    const { error } = await updateMyProfile(formData);
    console.log('Save result:', { error });
    if (!error) {
      console.log('✓ Profile saved successfully');
      await loadProfile();
      setEditing(false);
    } else {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
    setSaving(false);
  }

  async function handleLogout() {
    await signOut();
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <VideoBackground opacity={0.25} />
        <ActivityIndicator color="#7c5cbf" style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VideoBackground opacity={0.25} />
      
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Card Preview */}
        {!editing && profile && (
          <View style={styles.cardPreviewSection}>
            <Text style={styles.sectionTitle}>Your Tarot Card</Text>
            <View style={styles.cardPreviewContainer}>
              {profile.card_design ? (
                <ImageBackground
                  source={getCardDesign(profile.card_design)?.image}
                  style={styles.cardPreview}
                  imageStyle={styles.cardPreviewImage}
                >
                  <View style={styles.cardPreviewOverlay}>
                    <View style={[styles.cardPreviewAccent, { backgroundColor: getSignColor(profile.sun_sign as any) }]} />
                    <View style={styles.cardPreviewContent}>
                      <Text style={styles.cardPreviewSymbol}>
                        {profile.sun_sign && SIGN_SYMBOLS[profile.sun_sign as any] ? SIGN_SYMBOLS[profile.sun_sign as any] : '✦'}
                      </Text>
                      <Text style={styles.cardPreviewName}>{profile.name || 'Your Name'}</Text>
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={styles.cardPreviewPlaceholder}>
                  <Text style={styles.cardPreviewSymbol}>
                    {profile.sun_sign && SIGN_SYMBOLS[profile.sun_sign as any] ? SIGN_SYMBOLS[profile.sun_sign as any] : '✦'}
                  </Text>
                  <Text style={styles.cardPreviewName}>{profile.name || 'Your Name'}</Text>
                  <Text style={styles.cardPreviewHint}>Choose a card design below</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changeCardButton}
              onPress={() => setDesignModalVisible(true)}
            >
              <Text style={styles.changeCardButtonText}>
                {profile.card_design ? '🎨 Change Card Design' : '🎨 Choose Card Design'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Share Code Card */}
        <View style={styles.shareCard}>
          <Text style={styles.shareLabel}>Your Share Code</Text>
          <Text style={styles.shareCode}>{profile?.share_code || 'Loading...'}</Text>
          <Text style={styles.shareHint}>Share this code with friends to connect</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {editing ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#7c5cbf"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Birth Date (YYYY-MM-DD)"
                placeholderTextColor="#7c5cbf"
                value={formData.birth_date}
                onChangeText={(text) => setFormData({ ...formData, birth_date: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Birth Time (HH:MM)"
                placeholderTextColor="#7c5cbf"
                value={formData.birth_time}
                onChangeText={(text) => setFormData({ ...formData, birth_time: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Birth Location"
                placeholderTextColor="#7c5cbf"
                value={formData.birth_location}
                onChangeText={(text) => setFormData({ ...formData, birth_location: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Sun Sign"
                placeholderTextColor="#7c5cbf"
                value={formData.sun_sign}
                onChangeText={(text) => setFormData({ ...formData, sun_sign: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Moon Sign"
                placeholderTextColor="#7c5cbf"
                value={formData.moon_sign}
                onChangeText={(text) => setFormData({ ...formData, moon_sign: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Rising Sign"
                placeholderTextColor="#7c5cbf"
                value={formData.rising_sign}
                onChangeText={(text) => setFormData({ ...formData, rising_sign: text })}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setEditing(false)}
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
            </>
          ) : (
            <>
              <View style={styles.symbolRow}>
                {profile?.sun_sign && SIGN_SYMBOLS[profile.sun_sign] ? (
                  <Text style={styles.bigSymbol}>{SIGN_SYMBOLS[profile.sun_sign]}</Text>
                ) : (
                  <Text style={styles.bigSymbol}>✦</Text>
                )}
              </View>

              <Text style={styles.profileName}>{profile?.name || 'Set your name'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>

              {profile?.birth_date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Birth Date:</Text>
                  <Text style={styles.infoValue}>{profile.birth_date}</Text>
                </View>
              )}

              {profile?.birth_time && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Birth Time:</Text>
                  <Text style={styles.infoValue}>{profile.birth_time}</Text>
                </View>
              )}

              {profile?.birth_location && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <Text style={styles.infoValue}>{profile.birth_location}</Text>
                </View>
              )}

              <View style={styles.signsRow}>
                {profile?.sun_sign && (
                  <View style={styles.signBadge}>
                    <Text style={styles.signLabel}>☀ Sun</Text>
                    <Text style={styles.signValue}>{profile.sun_sign}</Text>
                  </View>
                )}
                {profile?.moon_sign && (
                  <View style={styles.signBadge}>
                    <Text style={styles.signLabel}>☽ Moon</Text>
                    <Text style={styles.signValue}>{profile.moon_sign}</Text>
                  </View>
                )}
                {profile?.rising_sign && (
                  <View style={styles.signBadge}>
                    <Text style={styles.signLabel}>↑ Rising</Text>
                    <Text style={styles.signValue}>{profile.rising_sign}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              {profile && canCalculateSigns(profile.birth_date, profile.birth_time, profile.birth_location) && (
                <TouchableOpacity
                  style={styles.recalculateButton}
                  onPress={() => profile && recalculateSigns(profile)}
                  disabled={saving}
                >
                  <Text style={styles.recalculateButtonText}>
                    ♈ Recalculate Signs
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <CardDesignSelector
        visible={designModalVisible}
        currentDesign={profile?.card_design}
        onSelect={handleCardDesignSelect}
        onClose={() => setDesignModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0520',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e0d38',
  },
  headerTitle: {
    color: '#ede0ff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'web' ? 'Cinzel Decorative, serif' : undefined,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a1248',
    borderRadius: 8,
  },
  logoutText: {
    color: '#d4b8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: '#d4b8f0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardPreviewSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  cardPreviewContainer: {
    marginBottom: 16,
  },
  cardPreview: {
    width: 200,
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#5c2fa8',
  },
  cardPreviewImage: {
    borderRadius: 14,
  },
  cardPreviewOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(14, 5, 32, 0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  cardPreviewAccent: {
    height: 4,
    width: '100%',
    opacity: 0.8,
    borderRadius: 2,
  },
  cardPreviewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPreviewSymbol: {
    fontSize: 64,
    color: '#d4b8f0',
    marginBottom: 16,
  },
  cardPreviewName: {
    color: '#ede0ff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  cardPreviewPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 16,
    backgroundColor: '#1a0a2e',
    borderWidth: 2,
    borderColor: '#2a1248',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardPreviewHint: {
    color: '#7c5cbf',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  changeCardButton: {
    backgroundColor: '#5c2fa8',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  changeCardButtonText: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
  },
  shareCard: {
    backgroundColor: '#1a0a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a1248',
    alignItems: 'center',
  },
  shareLabel: {
    color: '#7c5cbf',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  shareCode: {
    color: '#ede0ff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  shareHint: {
    color: '#4a2f7a',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#1a0a2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a1248',
  },
  symbolRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bigSymbol: {
    fontSize: 64,
    color: '#7c5cbf',
  },
  profileName: {
    color: '#ede0ff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#7c5cbf',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a1248',
  },
  infoLabel: {
    color: '#7c5cbf',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: '#ede0ff',
    fontSize: 14,
  },
  signsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  signBadge: {
    backgroundColor: '#2a1248',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  signLabel: {
    color: '#7c5cbf',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  signValue: {
    color: '#ede0ff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#5c2fa8',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  editButtonText: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
  },
  designButton: {
    backgroundColor: '#2a1248',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  designButtonText: {
    color: '#d4b8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  recalculateButton: {
    backgroundColor: '#1e0d38',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4a2f7a',
  },
  recalculateButtonText: {
    color: '#9c7cbf',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#120826',
    borderWidth: 1,
    borderColor: '#2a1248',
    borderRadius: 12,
    padding: 14,
    color: '#ede0ff',
    fontSize: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a1248',
  },
  saveButton: {
    backgroundColor: '#5c2fa8',
  },
  buttonText: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
  },
});
