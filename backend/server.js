const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// MVC Routes
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    architecture: 'Express MVC',
    system: 'PTIT Course Registration Simulator API'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Express MVC Backend API Server running on port ${PORT}`);
    console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer();
