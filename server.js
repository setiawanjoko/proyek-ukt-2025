const express = require('express');
const path = require('path');
const authRoutes = require('./src/api/auth');
const productRoutes = require('./src/api/products');
const {swagger} = require('./src/docs/swagger.js');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const logger = require('./src/utils/logger');

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port
const host = process.env.HOST || 'localhost'; // Use environment variable for host

// Middleware to parse JSON requests
app.use(express.json());

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Middleware to serve static files from the 'public' directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Mount authentication routes under '/api/auth'
app.use('/api/auth', authRoutes);

// Mount product routes under '/api/products'
app.use('/api/products', productRoutes);

// Swagger API documentation route
app.use('/docs', swaggerUi.serve, swagger);


// Generic error-handling middleware
app.use((err, req, res, next) => {
  logger.error(`Server error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start the server
app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});