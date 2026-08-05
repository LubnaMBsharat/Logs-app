import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config/env.js";
import * as schema from "../db/schema.js";

const conn = postgres(config.dbUrl);
export const db = drizzle(conn, {schema});