import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Friend, ZodiacSign } from '../../types';
import { getFriendProfileById, saveFriendProfile, deleteFriendProfile } from '../../lib/supabase-storage';
import { SIGN_SYMBOLS, SIGN_ELEMENTS, getSignColor } from '../../lib/astrology';
import { getCardDesign } from '../../lib/cardDesigns';
import AddFriendModal from '../../components/AddFriendModal';
import CardDesignSelector from '../../components/CardDesignSelector';

export default function FriendDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [editing, setEditing] = useState(false);
  const [showCardPicker, setShowCardPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) loadFriend(id);
    }, [id])
  );

  async function loadFriend(friendId: string) {
    const data = await getFriendProfileById(friendId);
    if (data) {
      setFriend({
        id: data.id,
        name: data.name,
        birthDate: data.birth_date || '',
        birthTime: data.birth_time || '',
        birthLocation: data.birth_location || '',
        sunSign: (data.sun_sign as ZodiacSign) || '',
        moonSign: (data.moon_sign as ZodiacSign) || '',
        risingSign: (data.rising_sign as ZodiacSign) || '',
        notes: data.notes,
        createdAt: new Date().toISOString(),
        cardDesign: data.card_design,
      });
    }
  }

  async function handleSave(updated: Friend) {
    await saveFriendProfile({
      id: updated.id,
      name: updated.name,
      birth_date: updated.birthDate,
      birth_time: updated.birthTime,
      birth_location: updated.birthLocation,
      sun_sign: updated.sunSign,
      moon_sign: updated.moonSign,
      rising_sign: updated.risingSign,
      notes: updated.notes,
    });
    if (id) await loadFriend(id);
    setEditing(false);
  }

  async function handleCardSelect(designId: string) {
    if (!id) return;
    await saveFriendProfile({ id, card_design: designId });
    if (friend) {
      setFriend({ ...friend, cardDesign: designId });
    }
    setShowCardPicker(false);
  }

  function handleDelete() {
    Alert.alert(
      'Remove profile',
      `Are you sure you want to remove ${friend?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (id) await deleteFriendProfile(id);
            router.back();
          },
        },
      ]
    );
  }

  if (!friend) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const sunColor = getSignColor(friend.sunSign);
  const cardDesign = getCardDesign(friend.cardDesign);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Card Design Preview */}
        <TouchableOpacity
          style={styles.cardPreview}
          onPress={() => setShowCardPicker(true)}
        >
          <Image source={cardDesign.image} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.cardOverlay}>
            <Text style={styles.cardOverlayText}>Tap to change card</Text>
          </View>
        </TouchableOpacity>

        {/* Hero */}
        <View style={[styles.hero, { borderColor: sunColor + '60' }]}>
          <Text style={[styles.bigSymbol, { color: sunColor }]}>
            {friend.sunSign ? SIGN_SYMBOLS[friend.sunSign] : '✦'}
          </Text>
          <Text style={styles.heroName}>{friend.name}</Text>
          {friend.sunSign ? (
            <Text style={[styles.heroSign, { color: sunColor }]}>
              {friend.sunSign} · {SIGN_ELEMENTS[friend.sunSign]}
            </Text>
          ) : null}
        </View>

        {/* Birth details */}
        <Section title="Birth Details">
          <DetailRow icon="📅" label="Date" value={formatDate(friend.birthDate)} />
          <DetailRow icon="🕐" label="Time" value={friend.birthTime || '—'} />
          <DetailRow icon="📍" label="Location" value={friend.birthLocation || '—'} />
        </Section>

        {/* Signs */}
        <Section title="Astrological Signs">
          <SignDetailRow
            icon="☀"
            label="Sun Sign"
            sign={friend.sunSign}
          />
          <SignDetailRow
            icon="☽"
            label="Moon Sign"
            sign={friend.moonSign}
          />
          <SignDetailRow
            icon="↑"
            label="Rising Sign"
            sign={friend.risingSign}
          />
        </Section>

        {/* Notes */}
        {friend.notes ? (
          <Section title="Notes">
            <Text style={styles.notes}>{friend.notes}</Text>
          </Section>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cardBtn}
            onPress={() => setShowCardPicker(true)}
          >
            <Text style={styles.cardBtnText}>🎴 Change Card Design</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddFriendModal
        visible={editing}
        existing={friend}
        onSave={handleSave}
        onClose={() => setEditing(false)}
      />

      <CardDesignSelector
        visible={showCardPicker}
        currentDesign={friend.cardDesign}
        onSelect={handleCardSelect}
        onClose={() => setShowCardPicker(false)}
      />
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function SignDetailRow({
  icon,
  label,
  sign,
}: {
  icon: string;
  label: string;
  sign: ZodiacSign | '';
}) {
  const color = sign ? getSignColor(sign) : '#4a2f7a';
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailIcon, { color }]}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.signValueRow}>
        {sign ? (
          <>
            <Text style={[styles.signSymbol, { color }]}>
              {SIGN_SYMBOLS[sign]}
            </Text>
            <Text style={[styles.detailValue, { color }]}>{sign}</Text>
          </>
        ) : (
          <Text style={styles.detailValueMuted}>Not set</Text>
        )}
      </View>
    </View>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-');
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0520',
  },
  loading: {
    color: '#7c5cbf',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: '#1a0a2e',
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    borderWidth: 1,
  },
  bigSymbol: {
    fontSize: 60,
    marginBottom: 8,
  },
  heroName: {
    color: '#ede0ff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSign: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#7c5cbf',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: '#1a0a2e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a1248',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#2a1248',
    gap: 12,
  },
  detailIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    color: '#9c7cbf',
  },
  detailLabel: {
    color: '#7c5cbf',
    fontSize: 14,
    fontWeight: '600',
    width: 90,
  },
  detailValue: {
    color: '#ede0ff',
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
  },
  detailValueMuted: {
    color: '#4a2f7a',
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  signValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  signSymbol: {
    fontSize: 18,
  },
  notes: {
    color: '#c8b0e8',
    fontSize: 14,
    lineHeight: 20,
    padding: 16,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  cardPreview: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    height: 280,
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(14, 5, 32, 0.7)',
    padding: 10,
    alignItems: 'center',
  },
  cardOverlayText: {
    color: '#9c7cbf',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBtn: {
    backgroundColor: '#1a0a2e',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  cardBtnText: {
    color: '#c8b0e8',
    fontSize: 16,
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: '#5c2fa8',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e05c2a40',
  },
  deleteBtnText: {
    color: '#e05c2a',
    fontSize: 15,
    fontWeight: '600',
  },
});
