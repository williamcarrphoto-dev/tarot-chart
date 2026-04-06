import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Friend } from '../../types';
import { getFriendProfiles, saveFriendProfile, getAcceptedFriends, addFriendByShareCode } from '../../lib/supabase-storage';
import FriendCard from '../../components/FriendCard';
import AddFriendModal from '../../components/AddFriendModal';
import VideoBackground from '../../components/VideoBackground';
import AddByCodeModal from '../../components/AddByCodeModal';
import CardDesignSelector from '../../components/CardDesignSelector';

export default function FriendsTab() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [cardPickerVisible, setCardPickerVisible] = useState(false);
  const [newFriendId, setNewFriendId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [])
  );

  async function loadFriends() {
    const [manualFriends, connectedFriends] = await Promise.all([
      getFriendProfiles(),
      getAcceptedFriends(),
    ]);
    
    const allFriends = [
      ...manualFriends.map(f => ({
        id: f.id,
        name: f.name,
        birthDate: f.birth_date,
        birthTime: f.birth_time,
        birthLocation: f.birth_location,
        sunSign: f.sun_sign,
        moonSign: f.moon_sign,
        risingSign: f.rising_sign,
        createdAt: new Date().toISOString(),
        cardDesign: f.card_design,
      })),
      ...connectedFriends.map(f => ({
        id: f.id,
        name: f.name || 'Friend',
        birthDate: f.birth_date,
        birthTime: f.birth_time,
        birthLocation: f.birth_location,
        sunSign: f.sun_sign,
        moonSign: f.moon_sign,
        risingSign: f.rising_sign,
        createdAt: new Date().toISOString(),
        cardDesign: f.card_design,
      })),
    ];
    
    setFriends(allFriends);
  }

  async function handleSave(friend: Friend) {
    const { id } = await saveFriendProfile({
      name: friend.name,
      birth_date: friend.birthDate,
      birth_time: friend.birthTime,
      birth_location: friend.birthLocation,
      sun_sign: friend.sunSign,
      moon_sign: friend.moonSign,
      rising_sign: friend.risingSign,
    });
    await loadFriends();
    setModalVisible(false);
    
    // Show card picker for the new friend
    if (id) {
      setNewFriendId(id);
      setCardPickerVisible(true);
    }
  }

  async function handleCardSelect(designId: string) {
    if (newFriendId) {
      await saveFriendProfile({ id: newFriendId, card_design: designId });
      await loadFriends();
    }
    setCardPickerVisible(false);
    setNewFriendId(null);
  }

  async function handleAddByCode(code: string) {
    const { error } = await addFriendByShareCode(code);
    if (!error) {
      await loadFriends();
      setCodeModalVisible(false);
    }
    return { error };
  }

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptySymbol}>✦</Text>
        <Text style={styles.emptyTitle}>No profiles yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to add your first star
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VideoBackground opacity={0.25} />
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Ayla's Tarot</Text>
          <Text style={styles.headerSub}>Star Profiles</Text>
        </View>
        <TouchableOpacity
          style={styles.codeButton}
          onPress={() => setCodeModalVisible(true)}
        >
          <Text style={styles.codeButtonText}>+ Code</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onPress={() => router.push(`/friend/${item.id}`)}
            cardDesign={item.cardDesign}
          />
        )}
        columnWrapperStyle={styles.row}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddFriendModal
        visible={modalVisible}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />

      <AddByCodeModal
        visible={codeModalVisible}
        onAdd={handleAddByCode}
        onClose={() => setCodeModalVisible(false)}
      />

      <CardDesignSelector
        visible={cardPickerVisible}
        onSelect={handleCardSelect}
        onClose={() => {
          setCardPickerVisible(false);
          setNewFriendId(null);
        }}
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
  codeButton: {
    backgroundColor: '#5c2fa8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  codeButtonText: {
    color: '#ede0ff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#ede0ff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'web' ? 'Cinzel Decorative, serif' : undefined,
  },
  headerSub: {
    color: '#7c5cbf',
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'flex-start',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 10,
  },
  emptySymbol: {
    fontSize: 48,
    color: '#3a1f5e',
  },
  emptyTitle: {
    color: '#7c5cbf',
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#4a2f7a',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 220,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5c2fa8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9b59b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: '#ede0ff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
});
