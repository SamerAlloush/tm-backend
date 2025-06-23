// Debug script to test role signup process

const https = require('https');
const http = require('http');

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

async function testRoleSignup() {
  console.log('🧪 Testing Role Signup Process...\n');
  
  // Test signup with different roles
  const testUsers = [
    {
      name: 'Test Customer',
      email: 'test-customer@example.com',
      phone: '1234567890',
      password: 'testpass123',
      role: 'customer'
    },
    {
      name: 'Test Vendor',
      email: 'test-vendor@example.com',
      phone: '1234567891',
      password: 'testpass123',
      role: 'vendor'
    },
    {
      name: 'Test Manager',
      email: 'test-manager@example.com',
      phone: '1234567892',
      password: 'testpass123',
      role: 'manager'
    }
  ];
  
  for (const userData of testUsers) {
    console.log(`\n--- Testing signup with role: ${userData.role} ---`);
    console.log('Sending data:', JSON.stringify(userData, null, 2));
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(result, null, 2));
      
      if (response.ok) {
        console.log(`✅ Signup successful for ${userData.role} role`);
        
        // Now let's check what was actually stored in the database
        console.log('\n--- Checking database storage ---');
        await checkDatabaseRole(userData.email);
      } else {
        console.log(`❌ Signup failed for ${userData.role} role:`, result.error);
      }
      
    } catch (error) {
      console.error(`❌ Network error for ${userData.role}:`, error.message);
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

async function checkDatabaseRole(email) {
  const { MongoClient } = require('mongodb');
  const uri = 'mongodb://localhost:27017/cleanarch';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('cleanarch');
    const users = db.collection('users');
    
    const user = await users.findOne({ email: email });
    if (user) {
      console.log(`Database roles for ${email}:`, user.roles);
      console.log(`Expected role vs actual role: ${user.roles[0]}`);
    } else {
      console.log(`❌ User not found in database: ${email}`);
    }
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await client.close();
  }
}

// Run the test
testRoleSignup().catch(console.error); 