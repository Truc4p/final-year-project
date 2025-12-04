// Migration script to fix documents field in Employee collection
// Run this once to fix existing employee records

const mongoose = require('mongoose');
const Employee = require('../models/hr/employee');
const secretManager = require('../services/secretManager');

async function migrateDocumentsField() {
  try {
    // Connect to MongoDB using the same method as the app
    const mongoUri = await secretManager.getSecret('MONGODB_URI').catch(() => {
      console.log('⚠️  Using fallback MongoDB URI');
      return "mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/Wrencos?retryWrites=true&w=majority";
    });
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    let fixed = 0;
    let alreadyCorrect = 0;

    for (const employee of employees) {
      // Check if documents field is not an array or doesn't exist
      if (!Array.isArray(employee.documents)) {
        console.log(`Fixing employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
        
        // Update using MongoDB directly to bypass validation
        await mongoose.connection.collection('employees').updateOne(
          { _id: employee._id },
          { $set: { documents: [] } }
        );
        
        fixed++;
      } else {
        alreadyCorrect++;
      }
    }

    console.log('\nMigration complete!');
    console.log(`- Fixed: ${fixed} employees`);
    console.log(`- Already correct: ${alreadyCorrect} employees`);
    console.log(`- Total: ${employees.length} employees`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateDocumentsField();
