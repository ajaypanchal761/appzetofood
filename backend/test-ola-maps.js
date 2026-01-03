/**
 * Test Ola Maps API Integration
 * 
 * This script tests the Ola Maps reverse geocoding API
 * to verify that your credentials are working correctly.
 * 
 * Usage:
 *   node test-ola-maps.js
 * 
 * Test coordinates: Indore (22.7196, 75.8577)
 * Expected area: "New Palasia"
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Test coordinates (Indore - New Palasia)
const testLat = 22.7196;
const testLng = 75.8577;

const apiKey = process.env.OLA_MAPS_API_KEY;
const projectId = process.env.OLA_MAPS_PROJECT_ID;
const clientId = process.env.OLA_MAPS_CLIENT_ID;
const clientSecret = process.env.OLA_MAPS_CLIENT_SECRET;

console.log('🔍 Testing Ola Maps API Integration\n');
console.log('📍 Test Coordinates:', testLat, testLng);
console.log('📍 Expected Area: New Palasia, Indore\n');

// Check if API key is configured
if (!apiKey) {
  console.error('❌ ERROR: OLA_MAPS_API_KEY is not configured in .env file');
  process.exit(1);
}

console.log('✅ OLA_MAPS_API_KEY is configured');
if (projectId) console.log('✅ OLA_MAPS_PROJECT_ID is configured');
if (clientId) console.log('✅ OLA_MAPS_CLIENT_ID is configured');
if (clientSecret) console.log('✅ OLA_MAPS_CLIENT_SECRET is configured');
console.log('');

// Test Method 1: API Key as query parameter
async function testMethod1() {
  console.log('🧪 Testing Method 1: API Key as query parameter...');
  try {
    const response = await axios.get(
      'https://api.olamaps.io/places/v1/reverse-geocode',
      {
        params: {
          lat: testLat,
          lng: testLng,
          key: apiKey,
          include_sublocality: true,
          include_neighborhood: true
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Method 1: SUCCESS');
    console.log('📦 Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err) {
    console.error('❌ Method 1: FAILED');
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
    return null;
  }
}

// Test Method 2: Bearer token with project headers
async function testMethod2() {
  console.log('\n🧪 Testing Method 2: Bearer token with project headers...');
  try {
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    if (projectId) headers['X-Project-ID'] = projectId;
    if (clientId) headers['X-Client-ID'] = clientId;

    const response = await axios.get(
      'https://api.olamaps.io/places/v1/reverse-geocode',
      {
        params: { lat: testLat, lng: testLng },
        headers,
        timeout: 10000
      }
    );

    console.log('✅ Method 2: SUCCESS');
    console.log('📦 Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err) {
    console.error('❌ Method 2: FAILED');
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
    return null;
  }
}

// Test Method 3: API Key in X-API-Key header
async function testMethod3() {
  console.log('\n🧪 Testing Method 3: API Key in X-API-Key header...');
  try {
    const response = await axios.get(
      'https://api.olamaps.io/places/v1/reverse-geocode',
      {
        params: { lat: testLat, lng: testLng },
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Method 3: SUCCESS');
    console.log('📦 Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err) {
    console.error('❌ Method 3: FAILED');
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
    return null;
  }
}

// Extract area from response
function extractArea(data) {
  try {
    // Try different response structures
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      const result = data.results[0];
      
      // Check address_components
      if (result.address_components) {
        if (Array.isArray(result.address_components)) {
          const sublocality = result.address_components.find(c => 
            c.types?.includes('sublocality') || 
            c.types?.includes('sublocality_level_1') ||
            c.types?.includes('neighborhood')
          );
          if (sublocality?.long_name) {
            return sublocality.long_name;
          }
        } else if (result.address_components.area) {
          return result.address_components.area;
        }
      }
      
      // Try formatted_address parsing
      if (result.formatted_address) {
        const parts = result.formatted_address.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          return parts[0]; // First part is usually the area
        }
      }
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

// Run tests
async function runTests() {
  const results = {
    method1: await testMethod1(),
    method2: await testMethod2(),
    method3: await testMethod3()
  };

  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(50));
  
  let successCount = 0;
  for (const [method, data] of Object.entries(results)) {
    if (data) {
      successCount++;
      const area = extractArea(data);
      console.log(`✅ ${method.toUpperCase()}: Working${area ? ` (Area: ${area})` : ''}`);
    } else {
      console.log(`❌ ${method.toUpperCase()}: Failed`);
    }
  }

  console.log('\n' + '='.repeat(50));
  if (successCount > 0) {
    console.log(`\n✅ SUCCESS: ${successCount} out of 3 methods are working!`);
    console.log('✅ Your Ola Maps API credentials are configured correctly.');
    console.log('\n💡 The backend will use the first working method automatically.');
  } else {
    console.log('\n❌ FAILED: None of the authentication methods worked.');
    console.log('💡 Please check your API credentials and try again.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(err => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
});

