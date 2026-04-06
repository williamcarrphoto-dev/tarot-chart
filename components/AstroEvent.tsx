import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlanetaryEvent } from '../types';

const TYPE_ICONS: Record<PlanetaryEvent['type'], string> = {
  ingress: '→',
  retrograde: '℞',
  direct: '↻',
  eclipse: '◎',
  conjunction: '☌',
  other: '✦',
};

const TYPE_COLORS: Record<PlanetaryEvent['type'], string> = {
  ingress: '#5ba8c9',
  retrograde: '#e05c2a',
  direct: '#6b8f3e',
  eclipse: '#c940c0',
  conjunction: '#d4a017',
  other: '#9c7cbf',
};

interface Props {
  event: PlanetaryEvent;
  compact?: boolean;
}

export default function AstroEvent({ event, compact = false }: Props) {
  const color = TYPE_COLORS[event.type];
  const icon = TYPE_ICONS[event.type];

  if (compact) {
    return (
      <View style={[styles.compactRow, { borderLeftColor: color }]}>
        <Text style={[styles.compactIcon, { color }]}>{icon}</Text>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {event.title}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, { backgroundColor: color + '30', borderColor: color + '60' }]}>
          <Text style={[styles.typeIcon, { color }]}>{icon}</Text>
          <Text style={[styles.typeLabel, { color }]}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>
      {event.affectedSigns.length > 0 && (
        <View style={styles.signsRow}>
          <Text style={styles.signsLabel}>Affects: </Text>
          <Text style={styles.signsValue}>{event.affectedSigns.join(', ')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e0d38',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeIcon: {
    fontSize: 12,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#ede0ff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: '#9c7cbf',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  signsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  signsLabel: {
    color: '#7c5cbf',
    fontSize: 12,
    fontWeight: '600',
  },
  signsValue: {
    color: '#c8b0e8',
    fontSize: 12,
    flex: 1,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderLeftWidth: 2,
    paddingLeft: 8,
    marginBottom: 4,
  },
  compactIcon: {
    fontSize: 12,
  },
  compactTitle: {
    color: '#c8b0e8',
    fontSize: 12,
    flex: 1,
  },
});
