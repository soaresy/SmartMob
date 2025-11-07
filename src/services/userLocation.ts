import { supabase } from '../lib/supabase';

export interface UserLocation {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
}

export async function getUserLocation(userId: string): Promise<UserLocation | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('address, city, state, zip_code, latitude, longitude')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user location:', error);
      return null;
    }

    if (!data || !data.address) {
      return null;
    }

    return {
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
}

export function formatFullAddress(location: UserLocation): string {
  if (!location.address) return '';

  const parts = [location.address];
  if (location.complement) parts.push(location.complement);
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.zip_code) parts.push(location.zip_code);

  return parts.filter(Boolean).join(', ');
}

export function getFormattedOriginDestination(
  userLocation: UserLocation | null,
  destination: string
): { origin: string; destination: string } {
  return {
    origin: userLocation ? formatFullAddress(userLocation) : '',
    destination
  };
}
