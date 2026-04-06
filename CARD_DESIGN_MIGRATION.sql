-- Add card_design columns to profiles and friend_profiles tables

-- Add card_design to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS card_design TEXT,
ADD COLUMN IF NOT EXISTS custom_card_image TEXT;

-- Add card_design to friend_profiles table
ALTER TABLE friend_profiles 
ADD COLUMN IF NOT EXISTS card_design TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.card_design IS 'ID of the selected card design from predefined options';
COMMENT ON COLUMN profiles.custom_card_image IS 'Base64 or URL of custom uploaded card image';
COMMENT ON COLUMN friend_profiles.card_design IS 'ID of the selected card design for manually added friends';
