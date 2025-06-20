const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testRoleSignup() {
  try {
    console.log('🧪 Testing Role-based Signup...\n');

    // Test different roles
    const testUsers = [
      {
        name: 'John User',
        email: 'user@test.com',
        phone: '1234567890',
        password: 'password123',
        role: 'user'
      },
      {
        name: 'Jane Manager',
        email: 'manager@test.com',
        phone: '1234567891',
        password: 'password123',
        role: 'manager'
      },
      {
        name: 'Bob Customer',
        email: 'customer@test.com',
        phone: '1234567892',
        password: 'password123',
        role: 'customer'
      },
      {
        name: 'Alice Vendor',
        email: 'vendor@test.com',
        phone: '1234567893',
        password: 'password123',
        role: 'vendor'
      },
      {
        name: 'Invalid Role Test',
        email: 'invalid@test.com',
        phone: '1234567894',
        password: 'password123',
        role: 'invalidrole' // Should default to 'user'
      }
    ];

    for (const userData of testUsers) {
      console.log(`\n📝 Testing signup for ${userData.name} with role: ${userData.role}`);
      
      try {
        const signupResponse = await axios.post(`${BASE_URL}/signup`, userData);
        console.log('✅ Signup Response:', {
          message: signupResponse.data.message,
          email: signupResponse.data.email,
          requiresVerification: signupResponse.data.requiresVerification
        });

        // Check OTP status
        const debugResponse = await axios.post(`${BASE_URL}/debug-otp`, {
          email: userData.email
        });
        
        console.log('🔍 User created with role:', debugResponse.data.storedOtp ? 'OTP generated' : 'No OTP');
        
      } catch (error) {
        if (error.response?.status === 409) {
          console.log('⚠️ User already exists, skipping...');
        } else {
          console.log('❌ Signup failed:', error.response?.data?.error || error.message);
        }
      }
    }

    console.log('\n🎉 Role-based signup testing completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your email for OTP codes');
    console.log('2. Verify accounts using /api/auth/verify-otp');
    console.log('3. Login and check user roles in dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Add delay to allow server startup
setTimeout(() => {
  testRoleSignup();
}, 2000);

console.log('Starting role-based signup test in 2 seconds...');
console.log('Make sure your server is running on http://localhost:5000'); 