import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Platform,
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
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  function handleFlip() {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  }

  // Front face: 0 → 90deg then hidden
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5],
    outputRange: [1, 1, 0],
  });

  // Back face: hidden until 90deg → 0deg
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-90deg', '-90deg', '0deg'],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.5, 0.51, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.card, { borderColor: sunColor + '80' }]}
        onPress={handleFlip}
        activeOpacity={0.9}
      >
        {/* Front Face - Clean card image */}
        <Animated.View
          style={[
            styles.face,
            {
              transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
              opacity: frontOpacity,
            },
          ]}
        >
          <Image source={design.image} style={styles.cardImage} resizeMode="cover" />
        </Animated.View>

        {/* Back Face - Details */}
        <Animated.View
          style={[
            styles.face,
            styles.backFace,
            {
              transform: [{ perspective: 1000 }, { rotateY: backRotate }],
              opacity: backOpacity,
            },
          ]}
        >
          <View style={styles.backContent}>
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

            <View style={styles.signsColumn}>
              {friend.sunSign ? (
                <SignRow icon="☀" label="Sun" value={friend.sunSign} color={sunColor} />
              ) : null}
              {friend.moonSign ? (
                <SignRow icon="☽" label="Moon" value={friend.moonSign} color="#7c9cbf" />
              ) : null}
              {friend.risingSign ? (
                <SignRow icon="↑" label="Rising" value={friend.risingSign} color="#9c7cbf" />
              ) : null}
            </View>

            {friend.birthDate ? (
              <Text style={styles.birthDate}>{formatDate(friend.birthDate)}</Text>
            ) : null}

            <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
              <Text style={styles.viewBtnText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Name below card */}
      <Text style={styles.name} numberOfLines={1}>
        {friend.name}
      </Text>
    </View>
  );
}

function SignRow({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.signRow}>
      <Text style={[styles.signIcon, { color }]}>{icon}</Text>
      <Text style={styles.signLabel}>{label}</Text>
      <Text style={[styles.signValue, { color }]}>{value}</Text>
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
  wrapper: {
    width: CARD_WIDTH,
    margin: 8,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#1e0d38',
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  },
  backFace: {
    backgroundColor: '#0e0520',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  backContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topAccent: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    opacity: 0.8,
  },
  symbolRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  bigSymbol: {
    fontSize: 40,
    color: '#7c5cbf',
  },
  signsColumn: {
    width: '100%',
    gap: 6,
  },
  signRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  signIcon: {
    fontSize: 14,
  },
  signLabel: {
    color: '#7c5cbf',
    fontSize: 11,
    fontWeight: '600',
    width: 42,
  },
  signValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  birthDate: {
    color: '#7c5cbf',
    fontSize: 11,
    textAlign: 'center',
  },
  viewBtn: {
    backgroundColor: '#5c2fa8',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#ede0ff',
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    color: '#ede0ff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'web' ? 'Cinzel Decorative, serif' : undefined,
  },
});
