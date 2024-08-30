import * as express from "express";
import "dotenv/config";
import "reflect-metadata";
import measureRoutes from "./routes/measure.routes";

const app = express();

app.use(express.json({ limit: "50mb" }));

app.use(measureRoutes);

export default app;
