import {Request, Response} from "express";
import { validateLogs } from "../services/log-validation.service.js";
import { insertLogs } from "../db/queries/log-ingestion.js";
export async function insertLogsHandler(req: Request, res:Response){
    const result = validateLogs(req.body);
    // All entries are rejected    
    if(result.accepted.length === 0){
        res.status(400).json({
            accepted: result.accepted.length,
            rejected: result.rejected
        });
        return;
    }    
    await insertLogs(result.accepted)
    res.status(200).json({
        accepted: result.accepted.length,
        rejected: result.rejected
    });

}