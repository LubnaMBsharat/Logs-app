import { MigrationConfig } from "drizzle-orm/migrator";
try {
    process.loadEnvFile();
} catch (err){
    // in docker container there is no .env file so to save the project from fail
}
export function loadOrThrow(key: string): string{
    const value = process.env[key];
    if(!value)
        throw new Error(`Environment variable ${key} is not set`);
    return value;
}

type Config = {
    dbUrl : string;
    port:number;
    migrationConfig : MigrationConfig;
    retentionDays : number;
}
//MigrationConfig object that stores the path to my migrations, we will use it for automatic migrations
const migrationConfig: MigrationConfig ={ 
    migrationsFolder: "src/db/migrations"
}
export const config : Config = {
    dbUrl : loadOrThrow("DATABASE_URL"),
    port: Number(loadOrThrow("PORT")),
    migrationConfig : migrationConfig,
    retentionDays: Number(loadOrThrow("RETENTION_DAYS"))
}
