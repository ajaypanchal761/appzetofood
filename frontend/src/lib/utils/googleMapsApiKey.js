/**
 * Google Maps API Key Utility
 * Fetches API key from backend database instead of .env file
 */

let cachedApiKey = null;
let apiKeyPromise = null;

/**
 * Get Google Maps API Key from backend
 * Uses caching to avoid multiple requests
 * @returns {Promise<string>} Google Maps API Key
 */
export async function getGoogleMapsApiKey() {
  // Return cached key if available
  if (cachedApiKey) {
    return cachedApiKey;
  }

  // Return existing promise if already fetching
  if (apiKeyPromise) {
    return apiKeyPromise;
  }

  // Fetch from backend
  apiKeyPromise = (async () => {
    try {
      const { adminAPI } = await import('../api/index.js');
      const response = await adminAPI.getPublicEnvVariables();
      
      if (response.data.success && response.data.data?.VITE_GOOGLE_MAPS_API_KEY) {
        cachedApiKey = response.data.data.VITE_GOOGLE_MAPS_API_KEY;
        return cachedApiKey;
      }
      
      // Fallback to env variable if backend doesn't have it
      return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    } catch (error) {
      console.warn('Failed to fetch Google Maps API key from backend, using env fallback:', error.message);
      // Fallback to env variable on error
      return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    } finally {
      apiKeyPromise = null;
    }
  })();

  return apiKeyPromise;
}

/**
 * Clear cached API key (call after updating in admin panel)
 */
export function clearGoogleMapsApiKeyCache() {
  cachedApiKey = null;
  apiKeyPromise = null;
}

