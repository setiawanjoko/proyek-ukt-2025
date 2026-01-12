const express = require('express');
const path = require('path');
const authRoutes = require('./src/api/auth');
const productRoutes = require('./src/api/products');
const swaggerSpec = require('./src/docs/swagger.js');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port
const host = process.env.HOST || 'localhost'; // Use environment variable for host

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to serve static files from the 'public' directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Mount authentication routes under '/api/auth'
app.use('/api/auth', authRoutes);

// Mount product routes under '/api/products'
app.use('/api/products', productRoutes);

// Swagger API documentation route
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Project UKT 2025 API Documentation",
}));

// Generic error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start the server
app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});