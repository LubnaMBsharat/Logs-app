import express from 'express';
import postgres from "postgres";
import { config } from "./config/env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { errorHandler } from "./middlewares/error-handler.js";
import appState from './utils/app-state.js';
import { checkDatabaseConnection } from './config/db.js';
import router from './routes.js';
import { managePartitions } from './services/partitions.service.js';

export const app = express();
const PORT = config.port;

app.use(express.json({ limit: '20mb' }));

app.use(router);

app.use(errorHandler);

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
 
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});
 
async function startServer(){
    try {
        const dbReadiness =await checkDatabaseConnection();
        appState.isDBReady = dbReadiness;

        const migrationClient = postgres(config.dbUrl,{max:1});
        await migrate(drizzle(migrationClient),config.migrationConfig);

        await managePartitions();
        setInterval(() => {
            managePartitions().catch((err) =>
            console.error(`Error in periodic partition check: ${err}`)
        );
        }, 12 * 60 * 60 * 1000);

        appState.isReady = true;
        const server = app.listen(PORT, ()=>{
            console.log(`Server is running on http://localhost:${PORT}`);
        });
        const shutdown = (signal: string) => {
            console.log(`${signal} received, shutting down gracefully...`);
            appState.isReady = false;
            server.close(() => {
                console.log('HTTP server closed');
                process.exit(0);
            });
            // Safety net: force-exit if connections don't drain in time.
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10_000).unref();
        };
 
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));        
    } catch (error) {
        console.log(`err in start server : ${error}`)
        appState.isReady = false;
        process.exit(1);
    }
}
await startServer();




