type APIConfig = {
  fileServerHits: number;
  dbURL: string;
};

process.loadEnvFile();

const dbURL = process.env.DB_URL;
if (!dbURL) {
  throw new Error("DB_URL is not set");
}

export const config: APIConfig = {
  fileServerHits: 0,
  dbURL,
};
