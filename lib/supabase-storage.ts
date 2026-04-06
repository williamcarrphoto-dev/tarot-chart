import { supabase } from './supabase';

export interface Profile {
  id: string;
  email: string;
  name?: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  share_code?: string;
  card_design?: string;
  custom_card_image?: string;
}

export interface FriendProfile {
  id: string;
  user_id: string;
  name: string;
  birth_date?: string;
  birth_time?: string;
  birth_location?: string;
  sun_sign?: string;
  moon_sign?: string;
  rising_sign?: string;
  notes?: string;
  card_design?: string;
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateMyProfile(updates: Partial<Profile>): Promise<{ error: any }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  console.log('📝 Updating profile with:', updates);
  console.log('User ID:', user.id);

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Supabase update error:', error);
  }

  return { error };
}

export async function getFriendProfiles(): Promise<FriendProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('friend_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching friend profiles:', error);
    return [];
  }

  return data || [];
}

export async function saveFriendProfile(friend: Partial<FriendProfile>): Promise<{ error: any }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  console.log('💾 Saving friend profile:', { hasId: !!friend.id, name: friend.name });

  if (friend.id) {
    // Update existing friend - don't include id in the update payload
    const { id, ...updateData } = friend;
    const { error } = await supabase
      .from('friend_profiles')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) console.error('❌ Friend update error:', error);
    return { error };
  } else {
    // Insert new friend - let Supabase generate the id
    const { error } = await supabase
      .from('friend_profiles')
      .insert({ ...friend, user_id: user.id });
    if (error) console.error('❌ Friend insert error:', error);
    else console.log('✅ Friend saved successfully');
    return { error };
  }
}

export async function deleteFriendProfile(id: string): Promise<{ error: any }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('friend_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return { error };
}

export async function getProfileByShareCode(shareCode: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('share_code', shareCode)
    .single();

  if (error) {
    console.error('Error fetching profile by share code:', error);
    return null;
  }

  return data;
}

export async function addFriendByShareCode(shareCode: string): Promise<{ error: any; profile?: Profile }> {
  const profile = await getProfileByShareCode(shareCode);
  
  if (!profile) {
    return { error: 'Profile not found with that share code' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (profile.id === user.id) {
    return { error: "You can't add yourself as a friend" };
  }

  const { error } = await supabase
    .from('friendships')
    .insert({
      user_id: user.id,
      friend_id: profile.id,
      status: 'accepted',
    });

  if (error) {
    if (error.code === '23505') {
      return { error: 'Already friends with this user' };
    }
    return { error: error.message };
  }

  return { error: null, profile };
}

export async function getAcceptedFriends(): Promise<Profile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', user.id)
    .eq('status', 'accepted');

  if (error || !data) return [];

  const friendIds = data.map(f => f.friend_id);
  if (friendIds.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds);

  if (profilesError) return [];

  return profiles || [];
}
