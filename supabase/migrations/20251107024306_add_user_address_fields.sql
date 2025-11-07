/*
  # Add User Address Fields

  1. New Columns
    - `address` (text) - Complete address with street and number
    - `city` (text) - City name
    - `state` (text) - State abbreviation
    - `zip_code` (text) - ZIP/CEP code
    - `complement` (text) - Optional address complement
    - `latitude` (numeric) - Geographic latitude
    - `longitude` (numeric) - Geographic longitude
    - `updated_at` (timestamptz) - Track updates

  2. Changes
    - All address fields are optional to not break existing data
    - Added geographic coordinates for location-based features
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
    ALTER TABLE profiles ADD COLUMN city text;
    ALTER TABLE profiles ADD COLUMN state text;
    ALTER TABLE profiles ADD COLUMN zip_code text;
    ALTER TABLE profiles ADD COLUMN complement text;
    ALTER TABLE profiles ADD COLUMN latitude numeric;
    ALTER TABLE profiles ADD COLUMN longitude numeric;
  END IF;
END $$;
