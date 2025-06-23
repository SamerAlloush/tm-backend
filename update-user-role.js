const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/cleanarch';

async function updateUserRole() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('cleanarch');
    const users = db.collection('users');
    
    console.log('Current user role for salloush227@gmail.com: user');
    console.log('Available roles: user, customer, vendor, manager');
    console.log('');
    
    // Change this line to update the role:
    const newRole = 'customer'; // Change this to: customer, vendor, manager, etc.
    
    console.log(`Updating role to: ${newRole}`);
    
    const result = await users.updateOne(
      { email: 'salloush227@gmail.com' },
      { $set: { roles: [newRole] } }
    );
    
    console.log('Role update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
    
    if (result.modifiedCount > 0) {
      console.log('✅ Role updated successfully!');
      
      // Verify the update
      const updatedUser = await users.findOne({ email: 'salloush227@gmail.com' });
      console.log('Updated user roles:', updatedUser.roles);
    } else {
      console.log('❌ No changes made');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

updateUserRole(); 