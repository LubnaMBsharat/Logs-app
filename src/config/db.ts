import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config/env.js";
import * as schema from "../db/schema.js";

const conn = postgres(config.dbUrl,{ max: 6 });
export const copyClient = postgres(config.dbUrl, { 
  max: 15,
  idle_timeout: 5,
});
export const db = drizzle(conn, {schema});

export async function checkDatabaseConnection ():Promise<boolean>{
    try{
        await conn`SELECT 1`;
        return true;
    }
    catch(error){
        console.error("Database connection check failed:", error);
        return false;
    }
}