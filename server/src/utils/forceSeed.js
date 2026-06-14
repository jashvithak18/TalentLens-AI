const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { seedData } = require('./seeder');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Forcing database re-seed...');
    await seedData(true);
    console.log('Seeder completed successfully.');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
