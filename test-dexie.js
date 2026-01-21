// test-dexie.js
const fetch = require('node-fetch'); // First install: npm install node-fetch

async function testBackend() {
  console.log('🧪 Testing Backend API...');
  
  // Replace with your actual Apps Script URL
  const API_URL = 'https://script.google.com/macros/s/AKfycbxA8wFlmM0NMKhNSG-fOWA4tRpV-k9w-sJ9P0KWpSAlKL8qkctT27-kDAvF65Vhw50H/exec/api/releases';
  
  try {
    const response = await fetch(API_URL + '?path=releases');
    const data = await response.json();
    
    console.log('✅ API Response:');
    console.log(`   Success: ${data.success}`);
    console.log(`   Count: ${data.count}`);
    
    if (data.releases && data.releases.length > 0) {
      console.log('   First release:', {
        id: data.releases[0].Release_id,
        system: data.releases[0].System_name,
        version: data.releases[0].Release_version
      });
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

testBackend();