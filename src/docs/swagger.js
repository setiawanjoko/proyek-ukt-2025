const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

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
        url: `http://${process.env.HOST || "localhost"}:${process.env.PORT || 3000}`,
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
  apis: ["./src/api/auth/*.js", "./src/api/products/*.js"], // Path to route files
};


const swaggerDocs = swaggerJSDoc(swaggerOptions);

const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Project UKT 2025 API Documentation",
  customfavIcon: "/static/favicon.png",
}

const swagger = swaggerUi.setup(swaggerDocs, options);

module.exports = { swagger, swaggerDocs};