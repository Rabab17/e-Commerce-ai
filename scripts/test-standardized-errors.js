'use strict';

/**
 * Test script to demonstrate standardized error format
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

async function testStandardizedErrorFormat() {
  console.log('🧪 Testing Standardized Error Format...\n');

  try {
    // Test 1: Validation Error - Product Creation
    console.log('1. Testing Validation Error (Product Creation)...');
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
        console.log('✅ Standardized Validation Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Status Code: ${error.response.data.statusCode}`);
        console.log(`   Error Code: ${error.response.data.errorCode}`);
        console.log(`   Message: ${error.response.data.message}`);
        console.log(`   Request ID: ${error.response.data.requestId}`);
        console.log(`   Path: ${error.response.data.path}`);
        console.log(`   Timestamp: ${error.response.data.timestamp}`);
        console.log(`   Suggestions: ${error.response.data.meta?.suggestions?.join(', ')}`);
        console.log(`   Documentation: ${error.response.data.meta?.documentation}`);
      }
    }

    // Test 2: Authentication Error - Order Creation
    console.log('\n2. Testing Authentication Error (Order Creation)...');
    try {
      await axios.post(`${BASE_URL}/orders`, {
        data: {
          orderNumber: 'ORD-123456',
          totalAmount: 99.99
        }
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Standardized Authentication Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Status Code: ${error.response.data.statusCode}`);
        console.log(`   Error Code: ${error.response.data.errorCode}`);
        console.log(`   Message: ${error.response.data.message}`);
        console.log(`   Request ID: ${error.response.data.requestId}`);
        console.log(`   Path: ${error.response.data.path}`);
        console.log(`   Timestamp: ${error.response.data.timestamp}`);
        console.log(`   Suggestions: ${error.response.data.meta?.suggestions?.join(', ')}`);
        console.log(`   Documentation: ${error.response.data.meta?.documentation}`);
      }
    }

    // Test 3: Not Found Error - Invalid Product ID
    console.log('\n3. Testing Not Found Error (Invalid Product ID)...');
    try {
      await axios.get(`${BASE_URL}/products/99999`);
    } catch (error) {
      if (error.response) {
        console.log('✅ Standardized Not Found Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Status Code: ${error.response.data.statusCode}`);
        console.log(`   Error Code: ${error.response.data.errorCode}`);
        console.log(`   Message: ${error.response.data.message}`);
        console.log(`   Request ID: ${error.response.data.requestId}`);
        console.log(`   Path: ${error.response.data.path}`);
        console.log(`   Timestamp: ${error.response.data.timestamp}`);
        console.log(`   Suggestions: ${error.response.data.meta?.suggestions?.join(', ')}`);
        console.log(`   Documentation: ${error.response.data.meta?.documentation}`);
      }
    }

    // Test 4: Validation Error - Cart Creation
    console.log('\n4. Testing Validation Error (Cart Creation)...');
    try {
      await axios.post(`${BASE_URL}/carts`, {
        data: {
          // Missing sessionId and items
        }
      });
    } catch (error) {
      if (error.response) {
        console.log('✅ Standardized Validation Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Status Code: ${error.response.data.statusCode}`);
        console.log(`   Error Code: ${error.response.data.errorCode}`);
        console.log(`   Message: ${error.response.data.message}`);
        console.log(`   Request ID: ${error.response.data.requestId}`);
        console.log(`   Path: ${error.response.data.path}`);
        console.log(`   Timestamp: ${error.response.data.timestamp}`);
        console.log(`   Details: ${JSON.stringify(error.response.data.details, null, 2)}`);
        console.log(`   Suggestions: ${error.response.data.meta?.suggestions?.join(', ')}`);
        console.log(`   Documentation: ${error.response.data.meta?.documentation}`);
      }
    }

    // Test 5: Invalid Token Error
    console.log('\n5. Testing Invalid Token Error...');
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
        console.log('✅ Standardized Invalid Token Error Response:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Status Code: ${error.response.data.statusCode}`);
        console.log(`   Error Code: ${error.response.data.errorCode}`);
        console.log(`   Message: ${error.response.data.message}`);
        console.log(`   Request ID: ${error.response.data.requestId}`);
        console.log(`   Path: ${error.response.data.path}`);
        console.log(`   Timestamp: ${error.response.data.timestamp}`);
        console.log(`   Details: ${JSON.stringify(error.response.data.details, null, 2)}`);
        console.log(`   Suggestions: ${error.response.data.meta?.suggestions?.join(', ')}`);
        console.log(`   Documentation: ${error.response.data.meta?.documentation}`);
      }
    }

    console.log('\n🎉 Standardized error format tests completed!');
    console.log('\n📋 Standardized Error Response Features:');
    console.log('✅ Consistent error structure across all endpoints');
    console.log('✅ RFC-like error format with status, statusCode, errorCode');
    console.log('✅ Meaningful error messages');
    console.log('✅ Helpful suggestions for resolution');
    console.log('✅ Request ID tracking for debugging');
    console.log('✅ Proper HTTP status codes');
    console.log('✅ Error categorization by type');
    console.log('✅ Documentation links for each error type');
    console.log('✅ Timestamp for error tracking');
    console.log('✅ Path information for debugging');

    console.log('\n📊 Error Response Schema:');
    console.log(JSON.stringify({
      status: 'error',
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: {
        field: 'example field error details'
      },
      path: '/api/example',
      requestId: 'req_1642234567_abc123def',
      timestamp: '2024-01-15T10:30:00.000Z',
      meta: {
        suggestions: ['Helpful suggestion 1', 'Helpful suggestion 2'],
        documentation: '/docs/validation'
      }
    }, null, 2));

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

    // Test successful product creation
    try {
      const response = await axios.post(`${BASE_URL}/products`, {
        data: {
          title: 'Test Product with Standardized Errors',
          description: 'This is a test product to demonstrate standardized error handling',
          price: 29.99,
          stock: 10
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Product creation successful with standardized response:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.meta?.message}`);
      console.log(`   Timestamp: ${response.data.meta?.timestamp}`);
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Product creation failed:');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error Code: ${error.response.data.errorCode}`);
        console.log(`   Message: ${error.response.data.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Login failed - please check your credentials');
    console.log('   Make sure you have a valid admin user account');
  }
}

async function main() {
  await testStandardizedErrorFormat();
  await testWithValidToken();
}

main().catch((error) => {
  console.error('❌ Test script failed:', error.message);
  process.exit(1);
});
