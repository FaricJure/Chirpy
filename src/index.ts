import express from "express";
import postgres from "postgres";

import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerCreateUser } from "./api/users.js";
import {
  errorHandler,
  middlewareLogResponse,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerChirps, handlerGetChirp, handlerGetChirps } from "./api/chirps.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import {
  handlerLogin,
  handlerRefresh,
  handlerRevoke,
} from "./api/auth.js";

const migrationClient = postgres(config.db.dbURL, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
await migrationClient.end();

const app = express();
const PORT = 8080;

app.use(express.json());

app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpId", handlerGetChirp);
app.post("/admin/reset", handlerReset);
app.post("/api/users", handlerCreateUser);
app.post("/api/chirps", handlerChirps);
app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
