import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Friend } from '../../types';
import { getFriends, saveFriend } from '../../lib/storage';
import FriendCard from '../../components/FriendCard';
import AddFriendModal from '../../components/AddFriendModal';
import VideoBackground from '../../components/VideoBackground';

export default function FriendsTab() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getFriends().then(setFriends);
    }, [])
  );

  async function handleSave(friend: Friend) {
    await saveFriend(friend);
    const updated = await getFriends();
    setFriends(updated);
    setModalVisible(false);
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
        <Text style={styles.headerTitle}>Ayla's Tarot</Text>
        <Text style={styles.headerSub}>Star Profiles</Text>
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
    </SafeAreaView>
  );
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
