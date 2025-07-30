# API Integration Guide

## Weather APIs

### 1. OpenWeatherMap (Recommended)
- **Free Tier**: 1,000 calls/day
- **Setup**: Get API key from [openweathermap.org](https://openweathermap.org/api)
- **Usage**: See `src/lib/weather.ts` - `fetchRealWeatherData()` function

```javascript
// Add to .env file
VITE_OPENWEATHER_API_KEY=your_api_key_here

// Usage in component
import { fetchRealWeatherData } from '@/lib/weather';
const weather = await fetchRealWeatherData(apiKey, 'Your City');
```

### 2. WeatherAPI.com (Alternative)
- **Free Tier**: 1 million calls/month
- **Setup**: Get API key from [weatherapi.com](https://www.weatherapi.com/)
- **Usage**: See `src/lib/weather.ts` - `fetchWeatherFromOtherAPI()` function

## Map APIs

### 1. Mappls (MapMyIndia) - Currently Integrated ✅
- **Setup**: ✅ Already configured with your API credentials
- **Cost**: Free tier available, competitive pricing for Indian market
- **Integration**: 

```bash
npm install mappls-web-maps  # ✅ Already installed
```

```javascript
// ✅ Already added to .env file
VITE_MAPPLS_API_KEY=21b2d60e8be47191eac3234fd147b305
VITE_MAPPLS_CLIENT_ID=96dHZVzsAuvHvv3xHM4eXxz8uydoco53D32DOVAXXj5rxiKJErndb7KM5evxFkh1hGJ_nUHNmEUnpA8tEK0wYUFJ_mjdb2J-
VITE_MAPPLS_CLIENT_SECRET=lrFxI-iSEg8UeLHzvn1HBR2QnnTMxU1Fsm72FNj7YkKgEwEx-lQJm033HoomAbO97BjgxKGp9YXLRoq0lT822NwKRCY-Ru_k6HYCgaf-JYM=

// Usage example in MapComponent.tsx
const mapplsApiKey = import.meta.env.VITE_MAPPLS_API_KEY;

// Load Mappls script
const script = document.createElement('script');
script.src = `https://apis.mappls.com/advancedmaps/api/${mapplsApiKey}/map_sdk?layer=vector&v=3.0`;
```

**Features**:
- Indian map data with detailed coverage
- Geocoding and reverse geocoding
- Route planning and navigation
- Real-time traffic data
- Place search with Indian context

### 2. Google Maps (Most Popular)
- **Setup**: Enable Maps JavaScript API in Google Cloud Console
- **Cost**: $7 per 1,000 map loads after free tier
- **Integration**: 

```bash
npm install @googlemaps/react-wrapper
```

```javascript
// Add to .env file
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

// Basic integration example
import { Wrapper } from "@googlemaps/react-wrapper";

<Wrapper apiKey={process.env.VITE_GOOGLE_MAPS_API_KEY}>
  <MyMapComponent />
</Wrapper>
```

### 2. Mapbox (Great Alternative)
- **Setup**: Get access token from [mapbox.com](https://www.mapbox.com/)
- **Cost**: 50,000 map views/month free
- **Integration**:

```bash
npm install mapbox-gl react-map-gl
```

```javascript
// Add to .env file
VITE_MAPBOX_ACCESS_TOKEN=your_token_here

// Basic integration
import Map from 'react-map-gl';

<Map
  mapboxAccessToken={process.env.VITE_MAPBOX_ACCESS_TOKEN}
  initialViewState={{
    longitude: 77.2090,
    latitude: 28.6139,
    zoom: 14
  }}
  style={{width: 600, height: 400}}
  mapStyle="mapbox://styles/mapbox/streets-v9"
/>
```

### 3. OpenStreetMap + Leaflet (Free)
- **Setup**: No API key required
- **Cost**: Completely free
- **Integration**:

```bash
npm install leaflet react-leaflet
```

```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[28.6139, 77.2090]} zoom={13}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
  <Marker position={[28.6139, 77.2090]}>
    <Popup>Your farm location</Popup>
  </Marker>
</MapContainer>
```

## Implementation Steps

### For Weather Integration:
1. Choose your weather provider
2. Sign up and get API key
3. Add API key to `.env` file
4. Update `src/lib/weather.ts` to use real API
5. Replace mock data calls in components

### For Map Integration:
1. Choose your map provider
2. Install required packages
3. Get API key/token (if required)
4. Replace `MapComponent.tsx` with real map implementation
5. Add environment variables

## Environment Variables Template

Create a `.env` file in your project root:

```bash
# Weather API
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_WEATHERAPI_KEY=your_weatherapi_key

# Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Optional: Default location
VITE_DEFAULT_LAT=28.6139
VITE_DEFAULT_LNG=77.2090
VITE_DEFAULT_CITY=Delhi
```

## Cost Comparison

| Service | Free Tier | Cost After Free |
|---------|-----------|-----------------|
| OpenWeatherMap | 1,000 calls/day | $0.0015/call |
| WeatherAPI.com | 1M calls/month | $4/month for 10M |
| Google Maps | $200 credit/month | $7/1,000 loads |
| Mapbox | 50,000 views/month | $5/1,000 views |
| OpenStreetMap | Unlimited | Free |

## Best Practices

1. **Cache weather data** for at least 10-15 minutes
2. **Handle API failures** gracefully with fallback data
3. **Rate limit requests** to avoid exceeding quotas
4. **Store API keys securely** in environment variables
5. **Monitor usage** to avoid unexpected charges

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Consider using serverless functions for API calls in production
- Implement request rate limiting on your backend
