import express from 'express';
import postgres from "postgres";
import { config } from "./config/env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { errorHandler } from "./middlewares/error-handler.js";
import appState from './utils/app-state.js';
import { checkDatabaseConnection } from './config/db.js';
import router from './routes.js';

const app = express();
const PORT = config.port;
app.use(express.json());

app.use(router);

app.use(errorHandler);

async function startServer(){
    try {
        const dbReadiness =await checkDatabaseConnection();
        appState.isDBReady = dbReadiness;

        const migrationClient = postgres(config.dbUrl,{max:1});
        await migrate(drizzle(migrationClient),config.migrationConfig);

        appState.isReady = true;
        app.listen(PORT, ()=>{
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(`err in start server : ${error}`)
        appState.isReady = false;
        process.exit(1);
    }
}
await startServer();




