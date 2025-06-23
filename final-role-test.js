// Final test to confirm project_manager role works correctly

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

async function finalTest() {
  console.log('🎯 FINAL ROLE ASSIGNMENT TEST');
  console.log('='.repeat(50));
  
  const timestamp = Date.now();
  const testEmail = `test-pm-final-${timestamp}@example.com`;
  
  console.log('Testing project_manager role with fresh email:', testEmail);
  
  const signupData = {
    name: 'Final Test Project Manager',
    email: testEmail,
    phone: '1234567890',
    password: 'testpass123',
    role: 'project_manager'
  };
  
  try {
    console.log('📤 Sending signup request...');
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
      console.log('✅ Signup successful!');
      
      // Check database
      const storedRole = await checkDatabaseRole(testEmail);
      console.log('💾 Database stored role:', storedRole);
      
      if (storedRole && storedRole.includes('project_manager')) {
        console.log('🎉 SUCCESS: project_manager role correctly stored!');
        console.log('');
        console.log('✅ PROBLEM SOLVED!');
        console.log('- project_manager role is now valid');
        console.log('- Role assignment works correctly');
        console.log('- Your account is updated to project_manager');
        console.log('');
        console.log('🚀 Next steps:');
        console.log('1. Use "project_manager" in your signup forms');
        console.log('2. Your account now has project_manager role');
        console.log('3. New signups can select Project Manager role');
      } else {
        console.log('❌ FAILED: project_manager role not stored correctly');
        console.log('Expected: ["project_manager"], Got:', storedRole);
      }
      
    } else {
      console.log('❌ Signup failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
  
  // Show your current account status
  console.log('\n📊 Your Account Status:');
  const yourRole = await checkDatabaseRole('salloush227@gmail.com');
  console.log('Email: salloush227@gmail.com');
  console.log('Current role:', yourRole);
  
  if (yourRole && yourRole.includes('project_manager')) {
    console.log('✅ Your account has project_manager role!');
  } else {
    console.log('ℹ️  Your account role:', yourRole);
  }
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

finalTest().catch(console.error); 