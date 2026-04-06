import AsyncStorage from '@react-native-async-storage/async-storage';
import { Friend } from '../types';

const FRIENDS_KEY = '@aylas_tarot:friends';

export async function getFriends(): Promise<Friend[]> {
  try {
    const json = await AsyncStorage.getItem(FRIENDS_KEY);
    return json ? (JSON.parse(json) as Friend[]) : [];
  } catch {
    return [];
  }
}

export async function saveFriend(friend: Friend): Promise<void> {
  const friends = await getFriends();
  const idx = friends.findIndex((f) => f.id === friend.id);
  if (idx >= 0) {
    friends[idx] = friend;
  } else {
    friends.push(friend);
  }
  await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

export async function deleteFriend(id: string): Promise<void> {
  const friends = await getFriends();
  const updated = friends.filter((f) => f.id !== id);
  await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(updated));
}

export async function getFriendById(id: string): Promise<Friend | null> {
  const friends = await getFriends();
  return friends.find((f) => f.id === id) ?? null;
}
