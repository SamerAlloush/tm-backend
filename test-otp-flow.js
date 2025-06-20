const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = `test${Date.now()}@example.com`;

async function testOtpFlow() {
  try {
    console.log('🧪 Testing OTP Flow...\n');

    // Step 1: Signup
    console.log('1️⃣ Testing Signup...');
    const signupResponse = await axios.post(`${BASE_URL}/signup`, {
      name: 'Test User',
      email: TEST_EMAIL,
      phone: '1234567890',
      password: 'password123'
    });
    
    console.log('✅ Signup Response:', signupResponse.data);
    
    // Step 2: Debug OTP
    console.log('\n2️⃣ Checking OTP Status...');
    const debugResponse = await axios.post(`${BASE_URL}/debug-otp`, {
      email: TEST_EMAIL
    });
    
    console.log('🔍 OTP Debug Info:', debugResponse.data);
    const storedOtp = debugResponse.data.storedOtp;
    
    if (!storedOtp) {
      console.log('❌ No OTP found in database!');
      return;
    }
    
    // Step 3: Verify OTP
    console.log('\n3️⃣ Testing OTP Verification...');
    const verifyResponse = await axios.post(`${BASE_URL}/verify-otp`, {
      email: TEST_EMAIL,
      otp: storedOtp
    });
    
    console.log('✅ Verification Response:', verifyResponse.data);
    console.log('\n🎉 OTP Flow completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

// Add delay to allow server startup
setTimeout(() => {
  testOtpFlow();
}, 2000);

console.log('Starting OTP flow test in 2 seconds...');
console.log('Make sure your server is running on http://localhost:5000'); 