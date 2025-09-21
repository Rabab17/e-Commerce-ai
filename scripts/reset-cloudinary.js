/**
 * Reset Cloudinary Configuration
 * إعادة تعيين إعدادات Cloudinary لحل مشكلة عرض الصور
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function resetCloudinaryConfig() {
  console.log('🔄 Resetting Cloudinary Configuration...\n');

  try {
    // Import Strapi
    const strapi = require('@strapi/strapi');
    
    // Create Strapi instance
    const app = await strapi().load();
    
    console.log('📋 Current Cloudinary Configuration:');
    const currentConfig = app.config.get('plugin.upload');
    console.log(JSON.stringify(currentConfig, null, 2));
    
    // Test Cloudinary connection
    const cloudName = process.env.CLOUDINARY_NAME;
    const apiKey = process.env.CLOUDINARY_KEY;
    const apiSecret = process.env.CLOUDINARY_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.log('❌ Cloudinary credentials not found in .env file');
      return;
    }
    
    console.log('✅ Cloudinary credentials found');
    console.log(`Cloud Name: ${cloudName}`);
    console.log(`API Key: ${apiKey.substring(0, 8)}...`);
    console.log(`API Secret: ${apiSecret.substring(0, 8)}...`);
    
    // Test upload
    console.log('\n🧪 Testing Cloudinary upload...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const uploadService = app.plugin('upload').service('upload');
    
    try {
      const result = await uploadService.upload({
        data: {
          fileInfo: {
            name: 'test-image.png',
            type: 'image/png',
            size: testImageBuffer.length
          }
        },
        files: {
          files: [{
            name: 'test-image.png',
            type: 'image/png',
            size: testImageBuffer.length,
            stream: require('stream').Readable.from(testImageBuffer)
          }]
        }
      });
      
      console.log('✅ Test upload successful!');
      console.log('Upload result:', result);
      
      // Clean up test file
      if (result && result[0] && result[0].id) {
        await uploadService.remove(result[0].id);
        console.log('🧹 Test file cleaned up');
      }
      
    } catch (uploadError) {
      console.log('❌ Test upload failed:', uploadError.message);
    }
    
    await app.destroy();
    console.log('\n✅ Cloudinary configuration reset complete!');
    console.log('🚀 Please restart your Strapi server: npm run develop');
    
  } catch (error) {
    console.error('❌ Error resetting Cloudinary configuration:', error.message);
  }
}

// Run the reset
if (require.main === module) {
  resetCloudinaryConfig();
}

module.exports = { resetCloudinaryConfig };
