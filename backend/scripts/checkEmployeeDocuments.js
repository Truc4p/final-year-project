// Check specific employee document structure
const mongoose = require('mongoose');
const secretManager = require('../services/secretManager');

async function checkEmployee() {
  try {
    const mongoUri = await secretManager.getSecret('MONGODB_URI').catch(() => {
      return "mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/Wrencos?retryWrites=true&w=majority";
    });
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const employeeId = '68d781cdd4c56616b768e8d1';
    
    // Get employee directly from collection without schema validation
    const rawEmployee = await mongoose.connection.collection('employees').findOne(
      { _id: new mongoose.Types.ObjectId(employeeId) }
    );

    console.log('📋 Employee found:');
    console.log('Name:', rawEmployee.firstName, rawEmployee.lastName);
    console.log('Email:', rawEmployee.email);
    console.log('\n📄 Documents field type:', typeof rawEmployee.documents);
    console.log('Documents field value:', rawEmployee.documents);
    console.log('Is Array:', Array.isArray(rawEmployee.documents));
    
    if (rawEmployee.documents) {
      console.log('\n🔍 Detailed inspection:');
      console.log(JSON.stringify(rawEmployee.documents, null, 2));
    }

    // Fix if needed
    if (typeof rawEmployee.documents === 'string' || !Array.isArray(rawEmployee.documents)) {
      console.log('\n⚠️  Documents field is NOT an array! Fixing...');
      
      await mongoose.connection.collection('employees').updateOne(
        { _id: new mongoose.Types.ObjectId(employeeId) },
        { $set: { documents: [] } }
      );
      
      console.log('✅ Fixed! Documents field is now an empty array.');
    } else {
      console.log('\n✅ Documents field is already correctly formatted as an array.');
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEmployee();
