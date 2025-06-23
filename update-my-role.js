const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/cleanarch';

async function updateMyRole() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('cleanarch');
    const users = db.collection('users');
    
    console.log('🔄 Updating role for salloush227@gmail.com');
    console.log('');
    
    // Show current role
    const currentUser = await users.findOne({ email: 'salloush227@gmail.com' });
    if (!currentUser) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('Current roles:', currentUser.roles);
    
    // UPDATE THIS LINE TO SET YOUR DESIRED ROLE:
    const newRole = 'project_manager'; // Change this to: customer, vendor, manager, project_manager, admin
    
    console.log(`Updating to role: ${newRole}`);
    
    const result = await users.updateOne(
      { email: 'salloush227@gmail.com' },
      { $set: { roles: [newRole] } }
    );
    
    console.log('Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
    
    if (result.modifiedCount > 0) {
      console.log('✅ Role updated successfully!');
      
      // Verify the update
      const updatedUser = await users.findOne({ email: 'salloush227@gmail.com' });
      console.log('New roles:', updatedUser.roles);
      
      console.log('');
      console.log('🎉 Your account role has been updated!');
      console.log('Next time you login, you will have the new role.');
    } else {
      console.log('❌ No changes made');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

console.log('🚀 Role Update Script');
console.log('====================');
console.log('');
console.log('Available roles:');
console.log('- user (basic user)');
console.log('- customer (customer role)');
console.log('- vendor (vendor role)');
console.log('- manager (manager role)');
console.log('- project_manager (project manager role)');
console.log('- admin (admin role)');
console.log('');
console.log('Current script will update to: project_manager');
console.log('Edit line 19 in this file to change the role.');
console.log('');

updateMyRole(); 