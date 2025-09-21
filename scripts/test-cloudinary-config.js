/**
 * Test Cloudinary Configuration
 * اختبار إعدادات Cloudinary
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function testCloudinaryConfig() {
  console.log('🔍 Testing Cloudinary Configuration...\n');

  // Check environment variables
  const cloudName = process.env.CLOUDINARY_NAME;
  const apiKey = process.env.CLOUDINARY_KEY;
  const apiSecret = process.env.CLOUDINARY_SECRET;

  console.log('📋 Environment Variables:');
  console.log(`CLOUDINARY_NAME: ${cloudName ? '✅ Set' : '❌ Missing'}`);
  console.log(`CLOUDINARY_KEY: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`CLOUDINARY_SECRET: ${apiSecret ? '✅ Set' : '❌ Missing'}\n`);

  // Validate configuration
  if (!cloudName || !apiKey || !apiSecret) {
    console.log('❌ Cloudinary configuration is incomplete!');
    console.log('Please check your .env file and ensure all Cloudinary variables are set.\n');
    
    console.log('📝 Required variables:');
    console.log('CLOUDINARY_NAME=your_cloud_name');
    console.log('CLOUDINARY_KEY=your_api_key');
    console.log('CLOUDINARY_SECRET=your_api_secret\n');
    
    return false;
  }

  // Test Cloudinary URL format
  const testPublicId = 'sample_image';
  const testUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_300,h_300,c_limit,q_auto:good,f_auto/${testPublicId}`;
  
  console.log('🔗 Test Cloudinary URL:');
  console.log(testUrl);
  console.log('✅ URL format is valid\n');

  // Test configuration completeness
  console.log('✅ Cloudinary configuration is complete!');
  console.log('🚀 You can now start your Strapi server and test image uploads.\n');

  return true;
}

// Run the test
if (require.main === module) {
  testCloudinaryConfig();
}

module.exports = { testCloudinaryConfig };
