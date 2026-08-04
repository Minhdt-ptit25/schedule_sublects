const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/res_subject_db';
  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(MONGO_URI);
      console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
      break;
    } catch (error) {
      console.error(`[DB Error] ${error.message}. Retrying in 3 seconds... (${retries} retries left)`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;
