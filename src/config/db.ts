import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config/env.js";
import * as schema from "../db/schema.js";

const readClient = postgres(config.dbUrl,{ max: 6 });
export const copyClient = postgres(config.dbUrl, { 
  max: 6,
  idle_timeout: 5,
});
export const rollupClient = postgres(config.dbUrl, { 
  max:3,
  idle_timeout: 5,
});
export const db = drizzle(readClient, {schema});
export const dbRollup = drizzle(rollupClient, {schema});

export async function checkDatabaseConnection ():Promise<boolean>{
    try{
        await readClient`SELECT 1`;
        return true;
    }
    catch(error){
        console.error("Database connection check failed:", error);
        return false;
    }
}