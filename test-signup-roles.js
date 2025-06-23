// Test to verify that signup roles are stored correctly in the database

const https = require('https');
const http = require('http');
const { MongoClient } = require('mongodb');

// Simple fetch implementation for Node.js
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function checkDatabaseRole(email) {
  const uri = 'mongodb://localhost:27017/cleanarch';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('cleanarch');
    const users = db.collection('users');
    
    const user = await users.findOne({ email: email });
    if (user) {
      return user.roles;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Database error:', err.message);
    return null;
  } finally {
    await client.close();
  }
}

async function testSignupRoleStorage() {
  console.log('🧪 Testing Signup Role Storage...\n');
  
  // Test different roles
  const testCases = [
    { role: 'vendor', email: 'test-vendor-2@example.com', name: 'Test Vendor 2' },
    { role: 'manager', email: 'test-manager-2@example.com', name: 'Test Manager 2' },
    { role: 'customer', email: 'test-customer-2@example.com', name: 'Test Customer 2' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing role: ${testCase.role} ---`);
    
    const signupData = {
      name: testCase.name,
      email: testCase.email,
      phone: '1234567890',
      password: 'testpass123',
      role: testCase.role
    };
    
    console.log('📤 Sending signup request with role:', testCase.role);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Signup successful');
        
        // Check what was stored in the database
        console.log('🔍 Checking database storage...');
        const storedRoles = await checkDatabaseRole(testCase.email);
        
        if (storedRoles) {
          console.log('📊 Database roles:', storedRoles);
          
          if (storedRoles.includes(testCase.role)) {
            console.log('✅ Role correctly stored in database!');
          } else {
            console.log('❌ Role mismatch! Expected:', testCase.role, 'Got:', storedRoles);
          }
        } else {
          console.log('❌ User not found in database');
        }
        
      } else {
        console.log('❌ Signup failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Network error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50));
  }
  
  // Also verify your updated account
  console.log('\n--- Verifying your updated account ---');
  const yourRoles = await checkDatabaseRole('salloush227@gmail.com');
  console.log('Your current roles:', yourRoles);
  
  if (yourRoles && yourRoles.includes('customer')) {
    console.log('✅ Your account role update was successful!');
  } else {
    console.log('❌ Your account role update may have failed');
  }
}

console.log('🚀 Signup Role Storage Test');
console.log('===========================');
console.log('This test will verify that:');
console.log('1. Signup requests with different roles store the correct role');
console.log('2. Your account role was updated successfully');
console.log('');

testSignupRoleStorage().catch(console.error); 