import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useFocusEffect } from 'expo-router';
import { Friend, DayAstroData, PlanetaryEvent } from '../../types';
import { getFriends } from '../../lib/storage';
import { fetchAstroEventsForMonth, fetchMoonPhase } from '../../lib/api';
import { SIGN_SYMBOLS } from '../../lib/astrology';
import AstroEvent from '../../components/AstroEvent';

interface MarkedDate {
  dots?: { key: string; color: string }[];
  selected?: boolean;
  selectedColor?: string;
}

export default function CalendarTab() {
  const today = toDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [friends, setFriends] = useState<Friend[]>([]);
  const [monthEvents, setMonthEvents] = useState<PlanetaryEvent[]>([]);
  const [dayData, setDayData] = useState<DayAstroData | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [markedDates, setMarkedDates] = useState<Record<string, MarkedDate>>({});

  useFocusEffect(
    useCallback(() => {
      getFriends().then(setFriends);
    }, [])
  );

  useEffect(() => {
    loadMonthEvents(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  useEffect(() => {
    loadDayData(selectedDate);
  }, [selectedDate]);

  async function loadMonthEvents(year: number, month: number) {
    const events = await fetchAstroEventsForMonth(year, month);
    setMonthEvents(events);

    const marks: Record<string, MarkedDate> = {};
    for (const e of events) {
      if (!marks[e.date]) marks[e.date] = { dots: [] };
      marks[e.date].dots?.push({
        key: e.type,
        color: eventTypeColor(e.type),
      });
    }
    setMarkedDates((prev) => {
      const updated = { ...marks };
      if (selectedDate) {
        updated[selectedDate] = {
          ...(updated[selectedDate] ?? {}),
          selected: true,
          selectedColor: '#5c2fa8',
        };
      }
      return updated;
    });
  }

  async function loadDayData(date: string) {
    setLoadingDay(true);
    const [y, m] = date.split('-').map(Number);
    const [moonPhase, events] = await Promise.all([
      fetchMoonPhase(date),
      fetchAstroEventsForMonth(y, m).then((all) =>
        all.filter((e) => e.date === date)
      ),
    ]);
    setDayData({ date, moonPhase: moonPhase ?? undefined, events });
    setLoadingDay(false);
  }

  function handleDayPress(day: DateData) {
    const date = day.dateString;
    setSelectedDate(date);
    setMarkedDates((prev) => {
      const updated: Record<string, MarkedDate> = {};
      for (const [k, v] of Object.entries(prev)) {
        updated[k] = { ...v, selected: false, selectedColor: undefined };
      }
      updated[date] = { ...(updated[date] ?? {}), selected: true, selectedColor: '#5c2fa8' };
      return updated;
    });
  }

  function handleMonthChange(month: DateData) {
    setCurrentMonth({ year: month.year, month: month.month });
  }

  function getFriendImpacts(events: PlanetaryEvent[]): { friend: Friend; reasons: string[] }[] {
    if (!friends.length || !events.length) return [];
    const impacts: { friend: Friend; reasons: string[] }[] = [];
    for (const friend of friends) {
      const friendSigns = [friend.sunSign, friend.moonSign, friend.risingSign].filter(Boolean);
      const reasons: string[] = [];
      for (const event of events) {
        const matches = event.affectedSigns.filter((s) => friendSigns.includes(s));
        if (matches.length > 0) {
          reasons.push(`${event.title} (${matches.join(', ')})`);
        }
      }
      if (reasons.length > 0) impacts.push({ friend, reasons });
    }
    return impacts;
  }

  const impacts = dayData ? getFriendImpacts(dayData.events) : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Ayla's Tarot</Text>
        <Text style={styles.headerSub}>Astro Calendar</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Calendar
          current={today}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markingType="multi-dot"
          markedDates={markedDates}
          theme={{
            backgroundColor: '#0e0520',
            calendarBackground: '#1a0a2e',
            textSectionTitleColor: '#7c5cbf',
            selectedDayBackgroundColor: '#5c2fa8',
            selectedDayTextColor: '#ede0ff',
            todayTextColor: '#d4b8f0',
            todayBackgroundColor: '#2a1248',
            dayTextColor: '#c8b0e8',
            textDisabledColor: '#3a1f5e',
            dotColor: '#d4b8f0',
            selectedDotColor: '#ede0ff',
            arrowColor: '#9c7cbf',
            monthTextColor: '#ede0ff',
            indicatorColor: '#7c5cbf',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
          style={styles.calendar}
        />

        {/* Selected day panel */}
        <View style={styles.dayPanel}>
          <Text style={styles.dayPanelDate}>{formatDisplayDate(selectedDate)}</Text>

          {loadingDay ? (
            <ActivityIndicator color="#7c5cbf" style={{ marginVertical: 20 }} />
          ) : (
            <>
              {/* Moon phase */}
              {dayData?.moonPhase ? (
                <View style={styles.moonRow}>
                  <Text style={styles.moonEmoji}>{dayData.moonPhase.emoji}</Text>
                  <View>
                    <Text style={styles.moonPhase}>{dayData.moonPhase.phase}</Text>
                    <Text style={styles.moonIllum}>
                      {Math.round(dayData.moonPhase.illumination * 100)}% illuminated
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.moonRow}>
                  <Text style={styles.moonEmoji}>🌙</Text>
                  <Text style={styles.moonPhase}>Moon phase loading…</Text>
                </View>
              )}

              {/* Planetary events */}
              {dayData?.events.length ? (
                <View style={styles.eventsSection}>
                  <Text style={styles.sectionLabel}>Planetary Events</Text>
                  {dayData.events.map((e, i) => (
                    <AstroEvent key={i} event={e} />
                  ))}
                </View>
              ) : (
                <Text style={styles.noEvents}>No major planetary events today.</Text>
              )}

              {/* Friend impacts */}
              {impacts.length > 0 ? (
                <View style={styles.impactsSection}>
                  <Text style={styles.sectionLabel}>Your Stars Today</Text>
                  {impacts.map(({ friend, reasons }) => (
                    <View key={friend.id} style={styles.impactCard}>
                      <View style={styles.impactHeader}>
                        <Text style={styles.impactSymbol}>
                          {friend.sunSign ? SIGN_SYMBOLS[friend.sunSign] : '✦'}
                        </Text>
                        <Text style={styles.impactName}>{friend.name}</Text>
                      </View>
                      {reasons.map((r, i) => (
                        <Text key={i} style={styles.impactReason}>
                          · {r}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function eventTypeColor(type: PlanetaryEvent['type']): string {
  const map: Record<PlanetaryEvent['type'], string> = {
    ingress: '#5ba8c9',
    retrograde: '#e05c2a',
    direct: '#6b8f3e',
    eclipse: '#c940c0',
    conjunction: '#d4a017',
    other: '#9c7cbf',
  };
  return map[type] ?? '#9c7cbf';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0520',
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e0d38',
  },
  headerTitle: {
    color: '#ede0ff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: '#7c5cbf',
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  calendar: {
    borderRadius: 0,
    marginBottom: 0,
  },
  dayPanel: {
    backgroundColor: '#120826',
    borderTopWidth: 1,
    borderTopColor: '#2a1248',
    padding: 20,
  },
  dayPanelDate: {
    color: '#ede0ff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  moonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1a0a2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a1248',
  },
  moonEmoji: {
    fontSize: 32,
  },
  moonPhase: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
  },
  moonIllum: {
    color: '#7c5cbf',
    fontSize: 12,
    marginTop: 2,
  },
  eventsSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#7c5cbf',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  noEvents: {
    color: '#4a2f7a',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  impactsSection: {
    marginBottom: 8,
  },
  impactCard: {
    backgroundColor: '#1e0d38',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3a1f5e',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  impactSymbol: {
    fontSize: 22,
    color: '#9c7cbf',
  },
  impactName: {
    color: '#ede0ff',
    fontSize: 16,
    fontWeight: '700',
  },
  impactReason: {
    color: '#9c7cbf',
    fontSize: 13,
    lineHeight: 20,
  },
});
