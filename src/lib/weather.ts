// Weather API utilities using OpenWeatherMap

export interface WeatherData {
  temperature: string;
  humidity: string;
  rainfall: string;
  forecast: string;
}

// Main weather function using OpenWeatherMap API
export const fetchWeatherData = async (location: string = "Chennai"): Promise<WeatherData> => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenWeatherMap API key not found, using mock data');
    return fetchMockWeatherData();
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: `${Math.round(data.main.temp)}°C`,
      humidity: `${data.main.humidity}%`,
      rainfall: `${data.rain?.['1h'] || data.rain?.['3h'] || 0}mm`,
      forecast: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to mock data
    return fetchMockWeatherData();
  }
};

// Mock weather data fallback
export const fetchMockWeatherData = async (): Promise<WeatherData> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data with some randomization
  return {
    temperature: `${Math.floor(Math.random() * 10) + 25}°C`,
    humidity: `${Math.floor(Math.random() * 20) + 50}%`,
    rainfall: `${Math.floor(Math.random() * 20)}mm`,
    forecast: getRandomForecast(),
  };
};

// Enhanced weather function with coordinates support
export const fetchWeatherByCoordinates = async (lat: number, lon: number): Promise<WeatherData> => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenWeatherMap API key not found, using mock data');
    return fetchMockWeatherData();
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: `${Math.round(data.main.temp)}°C`,
      humidity: `${data.main.humidity}%`,
      rainfall: `${data.rain?.['1h'] || data.rain?.['3h'] || 0}mm`,
      forecast: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather data by coordinates:', error);
    return fetchMockWeatherData();
  }
};

const getRandomForecast = (): string => {
  const forecasts = [
    "Partly cloudy with chance of rain",
    "Sunny and clear",
    "Overcast with light rain",
    "Mostly sunny",
    "Scattered thunderstorms",
    "Clear skies",
    "Light drizzle expected",
    "Partly cloudy",
  ];
  
  return forecasts[Math.floor(Math.random() * forecasts.length)];
};

// Alternative: WeatherAPI.com integration (if you prefer this provider)
export const fetchWeatherFromWeatherAPI = async (apiKey: string, lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error(`WeatherAPI request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: `${Math.round(data.current.temp_c)}°C`,
      humidity: `${data.current.humidity}%`,
      rainfall: `${data.current.precip_mm}mm`,
      forecast: data.current.condition.text,
    };
  } catch (error) {
    console.error('Error fetching weather data from WeatherAPI:', error);
    return fetchMockWeatherData();
  }
};
