import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Maximize, RefreshCw } from "lucide-react";
import { getFarmLocations, getCurrentLocation, type LocationData } from "@/lib/location";

interface MapComponentProps {
  height?: string;
  showControls?: boolean;
  centerLocation?: LocationData;
}

export default function MapComponent({ 
  height = "400px", 
  showControls = true,
  centerLocation 
}: MapComponentProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const farmLocations = getFarmLocations();

  const mapplsApiKey = import.meta.env.VITE_MAPPLS_API_KEY;

  useEffect(() => {
    // Load Mappls Map SDK
    if (mapplsApiKey && !mapLoaded) {
      loadMapplsScript();
    }
  }, [mapplsApiKey, mapLoaded]);

  const loadMapplsScript = () => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="mappls-web-maps"]')) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://apis.mappls.com/advancedmaps/api/${mapplsApiKey}/map_sdk?layer=vector&v=3.0&callback=initMapplsMap`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setMapLoaded(true);
      initializeMap();
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    // Initialize Mappls map when API is loaded
    // This would be implemented with actual Mappls SDK
    console.log('Mappls Map SDK loaded, ready to initialize map');
  };

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your current location. Please check your browser permissions.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const openInMappls = () => {
    const center = centerLocation || currentLocation || farmLocations[0].position;
    // Mappls web URL format
    const url = `https://maps.mappls.com/direction?destination=${center[0]},${center[1]}`;
    window.open(url, '_blank');
  };

  const getDirections = (to: [number, number]) => {
    if (currentLocation) {
      const url = `https://maps.mappls.com/direction?source=${currentLocation.latitude},${currentLocation.longitude}&destination=${to[0]},${to[1]}`;
      window.open(url, '_blank');
    } else {
      alert('Please get your current location first to calculate directions.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Farm Locations Map
        </CardTitle>
        <CardDescription>View and navigate to your farm locations</CardDescription>
      </CardHeader>
      <CardContent>
        {showControls && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
            >
              <Navigation className="mr-2 h-4 w-4" />
              {isLoadingLocation ? 'Getting Location...' : 'Get My Location'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={openInMappls}
            >
              <Maximize className="mr-2 h-4 w-4" />
              Open in Mappls
            </Button>
          </div>
        )}

        {/* Map Container - In a real app, you'd integrate with Google Maps, Mapbox, or Leaflet */}
        <div 
          style={{ height }}
          className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
        >
          <div className="text-center p-6">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Mappls Interactive Map</h3>
            <p className="text-sm text-gray-500 mb-4">
              {mapplsApiKey 
                ? "Mappls Map SDK is loading... Interactive map will appear here." 
                : "Add Mappls API key to environment variables to enable interactive mapping."}
            </p>
            
            {/* Current Location Display */}
            {currentLocation && (
              <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
                <p className="text-sm font-medium text-green-600">Your Location:</p>
                <p className="text-xs text-gray-600">
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </p>
              </div>
            )}
            
            {/* Sample Integration Code Comment */}
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
              {mapplsApiKey 
                ? "Mappls SDK loading... Interactive map coming soon!" 
                : "Add Mappls API key to activate interactive mapping"}
            </div>
          </div>
          
          {/* Simulated Map Markers */}
          <div className="absolute inset-0 pointer-events-none">
            {farmLocations.map((location, index) => (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${20 + (index * 25)}%`,
                  top: `${30 + (index * 15)}%`,
                }}
              >
                <div className="relative group">
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {location.name}
                      <div className="text-xs text-gray-300">{location.area} acres</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Farm Locations List */}
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Farm Locations:</h4>
          {farmLocations.map((location) => (
            <div key={location.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-sm">{location.name}</div>
                <div className="text-xs text-gray-500">
                  {location.type} • {location.area} acres
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => getDirections(location.position)}
              >
                <Navigation className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Integration Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 text-sm mb-2">Mappls Integration {mapplsApiKey ? 'Active' : 'Pending'}</h4>
          {mapplsApiKey ? (
            <div>
              <p className="text-xs text-green-700 mb-2">
                Mappls API key detected! Map SDK is ready for full integration.
              </p>
              <p className="text-xs text-blue-700">
                Current status: Loading Mappls Map SDK...
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-blue-700">
                To enable full Mappls map functionality:
              </p>
              <ul className="text-xs text-blue-600 mt-2 space-y-1">
                <li>• Mappls API key added to environment variables</li>
                <li>• Install @mappls/mappls-web-maps SDK</li>
                <li>• Initialize interactive map with markers</li>
                <li>• Enable location services for better experience</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
