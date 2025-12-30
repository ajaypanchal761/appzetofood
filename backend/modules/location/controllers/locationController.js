import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Reverse geocode coordinates to address using OLA Maps API
 */
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude'
      });
    }

    const apiKey = process.env.OLA_MAPS_API_KEY;
    const projectId = process.env.OLA_MAPS_PROJECT_ID;
    const clientId = process.env.OLA_MAPS_CLIENT_ID;
    const clientSecret = process.env.OLA_MAPS_CLIENT_SECRET;

    if (!apiKey) {
      logger.error('OLA_MAPS_API_KEY not configured');
      return res.status(500).json({
        success: false,
        message: 'Location service not configured'
      });
    }

    try {
      let response = null;
      let lastError = null;

      // Try Method 1: API Key as query parameter (most common)
      try {
        response = await axios.get(
          'https://api.olamaps.io/places/v1/reverse-geocode',
          {
            params: { 
              lat: latNum, 
              lng: lngNum,
              key: apiKey
            },
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 5000 // Reduced timeout to 5 seconds
          }
        );
        logger.info('OLA Maps reverse geocode successful (query param)', {
          lat: latNum,
          lng: lngNum
        });
      } catch (err1) {
        lastError = err1;
        response = null;
        // Try Method 2: Bearer token with project headers
        try {
          const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          };
          
          if (projectId) {
            headers['X-Project-ID'] = projectId;
          }
          if (clientId) {
            headers['X-Client-ID'] = clientId;
          }

          response = await axios.get(
            'https://api.olamaps.io/places/v1/reverse-geocode',
            {
              params: { lat: latNum, lng: lngNum },
              headers,
              timeout: 5000 // Reduced timeout to 5 seconds
            }
          );
          logger.info('OLA Maps reverse geocode successful (bearer token)', {
            lat: latNum,
            lng: lngNum
          });
        } catch (err2) {
          lastError = err2;
          response = null;
          // Try Method 3: API Key in X-API-Key header
          try {
            response = await axios.get(
              'https://api.olamaps.io/places/v1/reverse-geocode',
              {
                params: { lat: latNum, lng: lngNum },
                headers: {
                  'X-API-Key': apiKey,
                  'Content-Type': 'application/json'
                },
                timeout: 5000 // Reduced timeout to 5 seconds
              }
            );
            logger.info('OLA Maps reverse geocode successful (header)', {
              lat: latNum,
              lng: lngNum
            });
          } catch (err3) {
            lastError = err3;
            response = null;
            // All OLA Maps methods failed, use fallback
            lastError = err3;
            logger.warn('All OLA Maps authentication methods failed, using fallback service', {
              error: err3.message,
              status: err3.response?.status
            });
            
            try {
              // Fallback to a free geocoding service
              const fallbackResponse = await axios.get(
                `https://api.bigdatacloud.net/data/reverse-geocode-client`,
                {
                  params: {
                    latitude: latNum,
                    longitude: lngNum,
                    localityLanguage: 'en'
                  },
                  timeout: 5000 // Reduced timeout to 5 seconds
                }
              );

              // Transform fallback response to match expected format
              const fallbackData = fallbackResponse.data;
              const transformedData = {
                results: [{
                  formatted_address: fallbackData.formattedAddress || 
                    `${fallbackData.locality || fallbackData.city || ''}, ${fallbackData.principalSubdivision || ''}`.trim(),
                  address_components: {
                    city: fallbackData.city || fallbackData.locality,
                    state: fallbackData.principalSubdivision || fallbackData.administrativeArea,
                    country: fallbackData.countryName,
                    area: fallbackData.localityInfo?.administrative?.[1]?.name
                  },
                  geometry: {
                    location: {
                      lat: latNum,
                      lng: lngNum
                    }
                  }
                }]
              };

              return res.json({
                success: true,
                data: transformedData,
                source: 'fallback'
              });
            } catch (fallbackError) {
              // Even fallback failed, return minimal data
              logger.error('Fallback geocoding also failed', {
                error: fallbackError.message
              });
              
              const minimalData = {
                results: [{
                  formatted_address: `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`,
                  address_components: {
                    city: 'Current Location',
                    state: '',
                    country: '',
                    area: ''
                  },
                  geometry: {
                    location: {
                      lat: latNum,
                      lng: lngNum
                    }
                  }
                }]
              };

              return res.json({
                success: true,
                data: minimalData,
                source: 'coordinates_only'
              });
            }
          }
        }
      }

      // Only return OLA Maps response if we have one
      if (response && response.data) {
        return res.json({
          success: true,
          data: response.data,
          source: 'olamaps'
        });
      }
      
      // If we reach here, all methods failed and fallback should have been used
      // But if fallback also failed, return coordinates-only response
      const minimalData = {
        results: [{
          formatted_address: `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`,
          address_components: {
            city: 'Current Location',
            state: '',
            country: '',
            area: ''
          },
          geometry: {
            location: {
              lat: latNum,
              lng: lngNum
            }
          }
        }]
      };

      return res.json({
        success: true,
        data: minimalData,
        source: 'coordinates_only'
      });
    } catch (apiError) {
      logger.error('Location service error (all methods failed)', {
        error: apiError.message,
        status: apiError.response?.status,
        data: apiError.response?.data
      });

      // Return error response
      if (apiError.response) {
        return res.status(apiError.response.status).json({
          success: false,
          message: 'Failed to get location details',
          error: apiError.response.data
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Location service unavailable',
        error: apiError.message
      });
    }
  } catch (error) {
    logger.error('Reverse geocode error', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

