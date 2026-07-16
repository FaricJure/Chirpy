import type { MigrationConfig } from "drizzle-orm/migrator";

type APIConfig = {
  fileServerHits: number;
  platform: string;
  jwtSecret: string;
};

type DBConfig = {
  dbURL: string;
  migrationConfig: MigrationConfig;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
};

process.loadEnvFile();

const dbURL = process.env.DB_URL;
if (!dbURL) {
  throw new Error("DB_URL is not set");
}

const platform = process.env.PLATFORM;
if (!platform) {
  throw new Error("PLATFORM is not set");
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}

export const config: Config = {
  api: {
    fileServerHits: 0,
    platform,
    jwtSecret: jwtSecret,
  },
  db: {
    dbURL,
    migrationConfig: {
      migrationsFolder: "./src/db/generated",
    },
  },
};
