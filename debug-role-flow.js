// Debug script to trace role assignment flow and identify issues

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

async function debugRoleAssignment() {
  console.log('🔍 DEBUGGING ROLE ASSIGNMENT FLOW');
  console.log('='.repeat(50));
  
  // Test different role scenarios
  const testCases = [
    { 
      role: 'project_manager', 
      email: 'test-pm@example.com', 
      name: 'Test Project Manager',
      description: 'Testing project_manager role (not in valid roles list)'
    },
    { 
      role: 'manager', 
      email: 'test-mgr@example.com', 
      name: 'Test Manager',
      description: 'Testing manager role (valid role)'
    },
    { 
      role: 'CUSTOMER', 
      email: 'test-upper@example.com', 
      name: 'Test Uppercase',
      description: 'Testing uppercase role (should be normalized)'
    },
    { 
      role: 'invalid_role', 
      email: 'test-invalid@example.com', 
      name: 'Test Invalid',
      description: 'Testing invalid role (should default to user)'
    },
    { 
      role: '', 
      email: 'test-empty@example.com', 
      name: 'Test Empty',
      description: 'Testing empty role (should default to user)'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.description} ---`);
    console.log(`Input role: "${testCase.role}"`);
    
    const signupData = {
      name: testCase.name,
      email: testCase.email,
      phone: '1234567890',
      password: 'testpass123',
      role: testCase.role
    };
    
    console.log('📤 Request body:', JSON.stringify(signupData, null, 2));
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });
      
      const result = await response.json();
      console.log('📥 Response status:', response.status);
      console.log('📥 Response body:', JSON.stringify(result, null, 2));
      
      if (response.ok) {
        // Check what was actually stored in the database
        const storedRole = await checkDatabaseRole(testCase.email);
        console.log('💾 Database stored role:', storedRole);
        
        // Analyze the result
        if (testCase.role === 'project_manager') {
          if (storedRole && storedRole.includes('project_manager')) {
            console.log('✅ project_manager role correctly stored');
          } else {
            console.log('❌ project_manager role NOT stored correctly');
            console.log('🔧 ISSUE: project_manager is not in valid roles list');
          }
        } else if (testCase.role === 'manager') {
          if (storedRole && storedRole.includes('manager')) {
            console.log('✅ manager role correctly stored');
          } else {
            console.log('❌ manager role NOT stored correctly');
          }
        } else if (testCase.role === 'CUSTOMER') {
          if (storedRole && storedRole.includes('customer')) {
            console.log('✅ uppercase role correctly normalized to lowercase');
          } else {
            console.log('❌ uppercase role NOT normalized correctly');
          }
        } else if (testCase.role === 'invalid_role' || testCase.role === '') {
          if (storedRole && storedRole.includes('user')) {
            console.log('✅ invalid/empty role correctly defaulted to user');
          } else {
            console.log('❌ invalid/empty role NOT defaulted correctly');
          }
        }
        
      } else {
        console.log('❌ Signup failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Network error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50));
  }
  
  // Summary and recommendations
  console.log('\n🎯 ANALYSIS AND RECOMMENDATIONS:');
  console.log('='.repeat(50));
  console.log('');
  
  console.log('1. VALID ROLES CHECK:');
  console.log('   Current valid roles: user, customer, vendor, manager, admin');
  console.log('   ❌ "project_manager" is NOT in the valid roles list');
  console.log('   🔧 Solution: Add "project_manager" to UserRole enum and VALID_ROLES');
  console.log('');
  
  console.log('2. ROLE VALIDATION LOGIC:');
  console.log('   validateRole() function defaults invalid roles to "user"');
  console.log('   This explains why non-standard roles become "user"');
  console.log('');
  
  console.log('3. FIXES NEEDED:');
  console.log('   a) Add PROJECT_MANAGER to UserRole enum');
  console.log('   b) Update getSignupRoles() to include project_manager');
  console.log('   c) Update role hierarchy if needed');
  console.log('');
}

async function checkDatabaseRole(email) {
  const uri = 'mongodb://localhost:27017/cleanarch';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('cleanarch');
    const users = db.collection('users');
    
    const user = await users.findOne({ email: email });
    return user ? user.roles : null;
  } catch (err) {
    console.error('Database error:', err.message);
    return null;
  } finally {
    await client.close();
  }
}

debugRoleAssignment().catch(console.error); 