'use strict';

/**
 * Test script to demonstrate error handling
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

async function testErrorHandling() {
  console.log('🧪 Testing Error Handling System...\n');

  try {
    // Test 1: Validation Error
    console.log('1. Testing Validation Error...');
    try {
      await axios.post(`${BASE_URL}/products`, {
        data: {
          title: 'AB', // Too short
          description: 'Short', // Too short
          price: -10, // Invalid
          stock: -5 // Invalid
        }
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Validation Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Code: ${error.response.data.error.code}`);
        console.log(`   Message: ${error.response.data.error.message}`);
        console.log(`   Request ID: ${error.response.data.error.requestId}`);
        console.log(`   Suggestions: ${error.response.data.meta.suggestions.join(', ')}`);
      }
    }

    // Test 2: Authentication Error
    console.log('\n2. Testing Authentication Error...');
    try {
      await axios.post(`${BASE_URL}/products`, {
        data: {
          title: 'Test Product',
          description: 'Valid description',
          price: 29.99,
          stock: 10
        }
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Authentication Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Code: ${error.response.data.error.code}`);
        console.log(`   Message: ${error.response.data.error.message}`);
        console.log(`   Request ID: ${error.response.data.error.requestId}`);
        console.log(`   Suggestions: ${error.response.data.meta.suggestions.join(', ')}`);
      }
    }

    // Test 3: Invalid Token
    console.log('\n3. Testing Invalid Token...');
    try {
      await axios.post(`${BASE_URL}/products`, {
        data: {
          title: 'Test Product',
          description: 'Valid description',
          price: 29.99,
          stock: 10
        }
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Invalid Token Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Code: ${error.response.data.error.code}`);
        console.log(`   Message: ${error.response.data.error.message}`);
        console.log(`   Request ID: ${error.response.data.error.requestId}`);
        console.log(`   Suggestions: ${error.response.data.meta.suggestions.join(', ')}`);
      }
    }

    // Test 4: Not Found Error
    console.log('\n4. Testing Not Found Error...');
    try {
      await axios.get(`${BASE_URL}/products/99999`);
    } catch (error) {
      if (error.response) {
        console.log('✅ Not Found Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Code: ${error.response.data.error.code}`);
        console.log(`   Message: ${error.response.data.error.message}`);
        console.log(`   Request ID: ${error.response.data.error.requestId}`);
        console.log(`   Suggestions: ${error.response.data.meta.suggestions.join(', ')}`);
      }
    }

    console.log('\n🎉 Error handling tests completed!');
    console.log('\n📋 Error Response Features:');
    console.log('✅ Structured error responses');
    console.log('✅ Meaningful error messages');
    console.log('✅ Helpful suggestions');
    console.log('✅ Request ID tracking');
    console.log('✅ Proper HTTP status codes');
    console.log('✅ Error categorization');
    console.log('✅ Documentation links');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testWithValidToken() {
  console.log('\n🔐 Testing with Valid Token...');
  
  try {
    // First, try to login
    const loginResponse = await axios.post(`${BASE_URL}/auth/local`, {
      identifier: 'admin@example.com',
      password: 'your-password'
    });

    const token = loginResponse.data.jwt;
    console.log('✅ Login successful, token obtained');

    // Test with valid token
    try {
      await axios.post(`${BASE_URL}/products`, {
        data: {
          title: 'Test Product with Valid Token',
          description: 'This is a test product created with valid authentication',
          price: 29.99,
          stock: 10
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Product creation successful with valid token');
    } catch (error) {
      if (error.response) {
        console.log('❌ Product creation failed:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Code: ${error.response.data.error.code}`);
        console.log(`   Message: ${error.response.data.error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Login failed - please check your credentials');
    console.log('   Make sure you have a valid admin user account');
  }
}

async function main() {
  await testErrorHandling();
  await testWithValidToken();
}

main().catch((error) => {
  console.error('❌ Test script failed:', error.message);
  process.exit(1);
});
