import express from "express";
import postgres from "postgres";
import { config } from "./config/env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();
const PORT = config.port;

const migrationClient = postgres(config.dbUrl,{max:1});
await migrate(drizzle(migrationClient),config.migrationConfig);

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})
app.use(errorHandler);