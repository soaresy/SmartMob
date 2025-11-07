const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface PlaceDetails {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
}

let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;

function ensureGooglePlacesLoaded() {
  if (typeof google === 'undefined' || !google.maps) {
    throw new Error('Google Maps not loaded');
  }

  if (!autocompleteService) {
    autocompleteService = new google.maps.places.AutocompleteService();
  }

  if (!placesService) {
    const tempDiv = document.createElement('div');
    placesService = new google.maps.places.PlacesService(tempDiv);
  }

  return { autocompleteService, placesService };
}

export async function getAddressPredictions(input: string): Promise<PlacePrediction[]> {
  if (!GOOGLE_MAPS_API_KEY || !input.trim()) {
    return [];
  }

  try {
    const { autocompleteService } = ensureGooglePlacesLoaded();

    const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
      autocompleteService!.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'br' },
          types: ['geocode', 'establishment']
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      );
    });

    return predictions.map(p => ({
      place_id: p.place_id,
      description: p.description,
      main_text: p.structured_formatting.main_text,
      secondary_text: p.structured_formatting.secondary_text || ''
    }));
  } catch (error) {
    console.error('Error getting address predictions:', error);
    return [];
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const { placesService } = ensureGooglePlacesLoaded();

    const details = await new Promise<google.maps.places.PlaceResult | null>((resolve, reject) => {
      placesService!.getDetails(
        {
          placeId,
          fields: [
            'formatted_address',
            'address_components',
            'geometry',
            'name'
          ]
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      );
    });

    if (!details || !details.address_components || !details.geometry) {
      return null;
    }

    const addressComponents = details.address_components;
    let address = '';
    let city = '';
    let state = '';
    let zip_code = '';

    addressComponents.forEach(component => {
      const types = component.types;
      if (types.includes('route')) {
        address = `${component.long_name}`;
      }
      if (types.includes('street_number')) {
        address += `, ${component.long_name}`;
      }
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
      if (types.includes('postal_code')) {
        zip_code = component.long_name;
      }
    });

    return {
      address: address || details.formatted_address?.split(',')[0] || '',
      city,
      state,
      zip_code,
      latitude: details.geometry.location!.lat(),
      longitude: details.geometry.location!.lng()
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.maps) {
      resolve();
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}
