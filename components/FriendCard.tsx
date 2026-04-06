import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Friend } from '../types';
import { SIGN_SYMBOLS, getSignColor } from '../lib/astrology';
import { getCardDesign } from '../lib/cardDesigns';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth < 400 ? (screenWidth - 32) / 2 : (screenWidth - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.5; // Tarot card aspect ratio 2:3

interface Props {
  friend: Friend;
  onPress: () => void;
  cardDesign?: string;
}

export default function FriendCard({ friend, onPress, cardDesign }: Props) {
  const sunColor = getSignColor(friend.sunSign);
  const design = getCardDesign(cardDesign);

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: sunColor + '80' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {design ? (
        <ImageBackground
          source={design.image}
          style={styles.cardBackground}
          imageStyle={styles.cardBackgroundImage}
        >
          <View style={styles.cardOverlay}>
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
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.cardBackground}>
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
        </View>
      )}
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
    height: CARD_HEIGHT,
    backgroundColor: '#1e0d38',
    borderRadius: 16,
    borderWidth: 2,
    margin: 8,
    overflow: 'hidden',
  },
  cardBackground: {
    width: '100%',
    height: '100%',
  },
  cardBackgroundImage: {
    borderRadius: 14,
  },
  cardOverlay: {
    backgroundColor: 'rgba(14, 5, 32, 0.4)',
    width: '100%',
    height: '100%',
    padding: 12,
    justifyContent: 'space-between',
  },
  topAccent: {
    height: 4,
    width: '100%',
    opacity: 0.8,
  },
  symbolRow: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  bigSymbol: {
    fontSize: 48,
    color: '#7c5cbf',
  },
  name: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
    marginBottom: 12,
    letterSpacing: 0.5,
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
