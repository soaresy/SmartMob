/*
  # SmartMob Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `routes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `origin` (text)
      - `destination` (text)
      - `modals` (text array)
      - `total_time` (integer, minutes)
      - `total_distance` (numeric, km)
      - `estimated_cost` (numeric)
      - `is_sustainable` (boolean)
      - `created_at` (timestamptz)
    
    - `emissions_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `distance` (numeric, km)
      - `transport_mode` (text)
      - `co2_generated` (numeric, kg)
      - `co2_avoided` (numeric, kg)
      - `created_at` (timestamptz)
    
    - `transport_lines`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text, 'bus' or 'metro')
      - `status` (text)
      - `next_arrival` (text)
      - `favorited_by` (uuid array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can read/write their own profile data
    - Users can read/write their own routes and emissions history
    - Transport lines are readable by all, writable by authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  origin text NOT NULL,
  destination text NOT NULL,
  modals text[] NOT NULL DEFAULT '{}',
  total_time integer NOT NULL DEFAULT 0,
  total_distance numeric NOT NULL DEFAULT 0,
  estimated_cost numeric NOT NULL DEFAULT 0,
  is_sustainable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own routes"
  ON routes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes"
  ON routes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create emissions_history table
CREATE TABLE IF NOT EXISTS emissions_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  distance numeric NOT NULL,
  transport_mode text NOT NULL,
  co2_generated numeric NOT NULL,
  co2_avoided numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emissions_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own emissions history"
  ON emissions_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emissions history"
  ON emissions_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create transport_lines table
CREATE TABLE IF NOT EXISTS transport_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bus', 'metro')),
  status text NOT NULL DEFAULT 'on_time',
  next_arrival text NOT NULL,
  favorited_by uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transport_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read transport lines"
  ON transport_lines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update transport lines"
  ON transport_lines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample transport lines
INSERT INTO transport_lines (name, type, status, next_arrival) VALUES
  ('Linha 201 - Centro/Terminal', 'bus', 'on_time', '5 min'),
  ('Linha 102 - Shopping/Universidade', 'bus', 'delayed', '12 min'),
  ('Linha 1 - Azul', 'metro', 'on_time', '3 min'),
  ('Linha 2 - Verde', 'metro', 'on_time', '7 min'),
  ('Linha 305 - Aeroporto/Centro', 'bus', 'on_time', '8 min')
ON CONFLICT DO NOTHING;
