// API Test Utility
// Use this file to test your API integrations

import { fetchWeatherData } from './weather';

// Test Weather API
export const testWeatherAPI = async () => {
  console.log('Testing Weather API...');
  try {
    const weather = await fetchWeatherData('Chennai');
    console.log('✅ Weather API Success:', weather);
    return weather;
  } catch (error) {
    console.error('❌ Weather API Error:', error);
    return null;
  }
};

// Test Mappls API
export const testMapplsAPI = () => {
  console.log('Testing Mappls API Configuration...');
  
  const apiKey = import.meta.env.VITE_MAPPLS_API_KEY;
  const clientId = import.meta.env.VITE_MAPPLS_CLIENT_ID;
  
  if (apiKey && clientId) {
    console.log('✅ Mappls API keys found');
    console.log('API Key:', apiKey.substring(0, 8) + '...');
    console.log('Client ID:', clientId.substring(0, 8) + '...');
    return true;
  } else {
    console.error('❌ Mappls API keys missing');
    return false;
  }
};

// Test all APIs
export const testAllAPIs = async () => {
  console.log('Running API Tests...');
  
  const weatherResult = await testWeatherAPI();
  const mapplsResult = testMapplsAPI();
  
  console.log('\nTest Results:');
  console.log('Weather API:', weatherResult ? '✅ Working' : '❌ Failed');
  console.log('Mappls API:', mapplsResult ? '✅ Configured' : '❌ Not Configured');
  
  return {
    weather: weatherResult,
    mappls: mapplsResult
  };
};

// Auto-run tests in development
if (import.meta.env.DEV) {
  console.log('Development mode detected - running API tests...');
  testAllAPIs();
}
