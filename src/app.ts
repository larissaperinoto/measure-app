import * as express from "express";
import "dotenv/config";
import "reflect-metadata";
import * as swaggerJsdoc from "swagger-jsdoc";
import * as swaggerUi from "swagger-ui-express";
import measureRoutes from "./routes/measure.routes";

const app = express();

app.use(express.json({ limit: "50mb" }));

const swaggerSpec = swaggerJsdoc({
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Measure API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor local",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
});

app.use(measureRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
