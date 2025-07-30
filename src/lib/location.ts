// Location and Map utilities
// You can integrate with Google Maps, Mapbox, or other mapping services

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface MapConfig {
  center: [number, number]; // [latitude, longitude]
  zoom: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
  }>;
}

// Get user's current location
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Mock farm locations for demo
export const getFarmLocations = (): Array<{
  id: string;
  name: string;
  position: [number, number];
  type: 'crop' | 'poultry' | 'both';
  area: number;
}> => {
  return [
    {
      id: '1',
      name: 'Main Poultry House',
      position: [28.6139, 77.2090], // Delhi coordinates
      type: 'poultry',
      area: 2.5,
    },
    {
      id: '2', 
      name: 'Corn Field A',
      position: [28.6149, 77.2080],
      type: 'crop',
      area: 5.2,
    },
    {
      id: '3',
      name: 'Mixed Farm Area',
      position: [28.6129, 77.2100],
      type: 'both',
      area: 8.0,
    },
  ];
};

// Example function to integrate with Google Maps Geocoding API
export const reverseGeocode = async (lat: number, lon: number, apiKey: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
};

// Generate Google Maps URL for directions
export const getDirectionsUrl = (from: LocationData, to: LocationData): string => {
  return `https://www.google.com/maps/dir/${from.latitude},${from.longitude}/${to.latitude},${to.longitude}`;
};

// Generate map embed URL (requires Google Maps API key)
export const getMapEmbedUrl = (center: LocationData, zoom: number = 15, apiKey: string): string => {
  return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center.latitude},${center.longitude}&zoom=${zoom}`;
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (point1: LocationData, point2: LocationData): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(point2.latitude - point1.latitude);
  const dLon = deg2rad(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Example integration with Mapbox (alternative to Google Maps)
export const getMapboxStaticMapUrl = (
  center: LocationData, 
  zoom: number = 15, 
  width: number = 600, 
  height: number = 400,
  accessToken: string
): string => {
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${center.longitude},${center.latitude},${zoom}/${width}x${height}?access_token=${accessToken}`;
};
