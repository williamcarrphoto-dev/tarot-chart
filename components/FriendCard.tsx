import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Friend } from '../types';
import { SIGN_SYMBOLS, getSignColor } from '../lib/astrology';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

interface Props {
  friend: Friend;
  onPress: () => void;
}

export default function FriendCard({ friend, onPress }: Props) {
  const sunColor = getSignColor(friend.sunSign);

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: sunColor + '80' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.topAccent, { backgroundColor: sunColor }]} />

      <View style={styles.symbolRow}>
        {friend.sunSign ? (
          <Text style={[styles.bigSymbol, { color: sunColor }]}>
            {SIGN_SYMBOLS[friend.sunSign]}
          </Text>
        ) : (
          <Text style={styles.bigSymbol}>✦</Text>
        )}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {friend.name}
      </Text>

      <View style={styles.signsRow}>
        {friend.sunSign ? (
          <SignBadge label="☀" value={friend.sunSign} color={sunColor} />
        ) : null}
        {friend.moonSign ? (
          <SignBadge label="☽" value={friend.moonSign} color="#7c9cbf" />
        ) : null}
        {friend.risingSign ? (
          <SignBadge label="↑" value={friend.risingSign} color="#9c7cbf" />
        ) : null}
      </View>

      {friend.birthDate ? (
        <Text style={styles.birthDate}>
          {formatDate(friend.birthDate)}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

function SignBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.badge, { borderColor: color + '60' }]}>
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
      <Text style={styles.badgeValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  const months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec',
  ];
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1e0d38',
    borderRadius: 16,
    borderWidth: 1,
    margin: 8,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  topAccent: {
    height: 4,
    width: '100%',
    opacity: 0.8,
  },
  symbolRow: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  bigSymbol: {
    fontSize: 36,
    color: '#7c5cbf',
  },
  name: {
    color: '#ede0ff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  signsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
    backgroundColor: '#2a1248',
  },
  badgeLabel: {
    fontSize: 10,
  },
  badgeValue: {
    color: '#c8b0e8',
    fontSize: 9,
    fontWeight: '600',
  },
  birthDate: {
    color: '#7c5cbf',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
});
