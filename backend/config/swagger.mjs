import swaggerJSDoc from "swagger-jsdoc";

import swaggerSchemas from "./swaggerSchemas.mjs";
import swaggerResponses from "./swaggerResponses.mjs";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Yebegena Student Information Management System API",

      version: "1.0.0",

      description: "Professional API documentation for Yebegena SIMS",

      contact: {
        name: "Yebegena Development Team",
        email: "support@yebegena.com",
      },
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",

        description: "Development Server",
      },
    ],

    tags: [
      {
        name: "Authentication",
      },

      {
        name: "Students",
      },

      {
        name: "Teachers",
      },

      {
        name: "Classes",
      },

      {
        name: "Payments",
      },

      {
        name: "Schedules",
      },

      {
        name: "Exams",
      },

      {
        name: "Promotions",
      },

      {
        name: "Notifications",
      },

      {
        name: "Dashboard",
      },

      {
        name: "Reports",
      },

      {
        name: "Settings",
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

      schemas: swaggerSchemas,

      responses: swaggerResponses,
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.mjs", "./src/controllers/*.mjs"],
};

const specs = swaggerJSDoc(options);

export default specs;
