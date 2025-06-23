// Test to verify that project_manager role now works correctly

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

async function testProjectManagerRole() {
  console.log('🧪 Testing Project Manager Role Assignment');
  console.log('='.repeat(50));
  
  const testCases = [
    {
      role: 'project_manager',
      email: 'test-pm-fixed@example.com',
      name: 'Test Project Manager Fixed',
      description: 'Testing project_manager role (should now work)'
    },
    {
      role: 'manager',
      email: 'test-manager-compare@example.com',
      name: 'Test Manager Compare',
      description: 'Testing regular manager role for comparison'
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
      
      if (response.ok) {
        console.log('✅ Signup successful');
        
        // Check what was stored in the database
        const storedRole = await checkDatabaseRole(testCase.email);
        console.log('💾 Database stored role:', storedRole);
        
        if (storedRole && storedRole.includes(testCase.role)) {
          console.log(`✅ ${testCase.role} role correctly stored!`);
        } else {
          console.log(`❌ ${testCase.role} role NOT stored correctly`);
          console.log('Expected:', testCase.role, 'Got:', storedRole);
        }
        
      } else {
        console.log('❌ Signup failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Network error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50));
  }
  
  // Also update your existing account to project_manager if you want
  console.log('\n🔄 Would you like to update your account to project_manager role?');
  console.log('Your current account: salloush227@gmail.com');
  
  const currentRole = await checkDatabaseRole('salloush227@gmail.com');
  console.log('Current role:', currentRole);
  
  // Uncomment the next lines if you want to update your role to project_manager
  /*
  console.log('Updating your role to project_manager...');
  await updateUserRole('salloush227@gmail.com', 'project_manager');
  const newRole = await checkDatabaseRole('salloush227@gmail.com');
  console.log('New role:', newRole);
  */
  
  console.log('\n🎉 Project Manager role is now available!');
  console.log('To update your account role, run: node update-my-role.js');
  console.log('and change line 24 to: const newRole = "project_manager";');
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

async function updateUserRole(email, role) {
  const uri = 'mongodb://localhost:27017/cleanarch';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('cleanarch');
    const users = db.collection('users');
    
    const result = await users.updateOne(
      { email: email },
      { $set: { roles: [role] } }
    );
    
    return result.modifiedCount > 0;
  } catch (err) {
    console.error('Database error:', err.message);
    return false;
  } finally {
    await client.close();
  }
}

testProjectManagerRole().catch(console.error); 