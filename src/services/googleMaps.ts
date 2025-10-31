type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

export interface RouteResult {
  distance: number;
  duration: number;
  travelMode: TravelMode;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

declare global {
  interface Window {
    google: any;
  }
}

// Carrega o script do Google Maps se ainda não estiver carregado
async function loadGoogleMapsScript(): Promise<void> {
  if (window.google && window.google.maps) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export async function calculateRoute(
  origin: string,
  destination: string,
  mode: TravelMode = 'TRANSIT'
): Promise<RouteResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return null;
  }

  try {
    await loadGoogleMapsScript();

    const directionsService = new window.google.maps.DirectionsService();

    const result = await new Promise<any>((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          travelMode: mode,
        },
        (response: any, status: any) => {
          if (status === 'OK') resolve(response);
          else reject(status);
        }
      );
    });

    const leg = result.routes[0].legs[0];

    return {
      distance: leg.distance.value / 1000,
      duration: leg.duration.value / 60,
      travelMode: mode,
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
}

export async function calculateMultimodalRoute(
  origin: string,
  destination: string,
  modals: string[]
): Promise<{
  totalDistance: number;
  totalDuration: number;
  segments: RouteResult[];
} | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured - using fallback data');
    return {
      totalDistance: 12.5,
      totalDuration: 45,
      segments: [],
    };
  }

  const modeMap: { [key: string]: TravelMode } = {
    bus: 'TRANSIT',
    metro: 'TRANSIT',
    bike: 'BICYCLING',
    walking: 'WALKING',
    carpool: 'DRIVING',
  };

  try {
    const primaryMode = modals[0] ? modeMap[modals[0]] || 'TRANSIT' : 'TRANSIT';
    const result = await calculateRoute(origin, destination, primaryMode);

    if (!result) {
      return {
        totalDistance: 12.5,
        totalDuration: 45,
        segments: [],
      };
    }

    return {
      totalDistance: result.distance,
      totalDuration: result.duration,
      segments: [result],
    };
  } catch (error) {
    console.error('Error calculating multimodal route:', error);
    return {
      totalDistance: 12.5,
      totalDuration: 45,
      segments: [],
    };
  }
}

export function calculateEstimatedCost(distance: number, modals: string[]): number {
  const costPerKm: { [key: string]: number } = {
    bus: 0.3,
    metro: 0.35,
    bike: 0.05,
    walking: 0,
    carpool: 0.5,
  };

  if (modals.length === 0) return 0;

  const avgCostPerKm =
    modals.reduce((sum, modal) => sum + (costPerKm[modal] || 0.3), 0) /
    modals.length;

  return distance * avgCostPerKm;
}
