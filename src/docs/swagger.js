const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Project UKT 2025 API",
      version: "1.0.0",
      description: "API documentation for Project UKT 2025",
    },
    servers: [
      {
        url: `/`,
        description: "Dynamic server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../api/**/*.js")
  ], // Path to route files
};

console.log("Generating Swagger docs with options:", swaggerOptions);

// amazonq-ignore-next-line
const swaggerDocs = swaggerJSDoc(swaggerOptions);

const swaggerUIOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Project UKT 2025 API Documentation",
  customfavIcon: "/static/favicon.png",
};

const swagger = swaggerUi.setup(swaggerDocs, swaggerUIOptions);

module.exports = { swagger, swaggerDocs};