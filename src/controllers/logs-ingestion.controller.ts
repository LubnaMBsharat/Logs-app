import {Request, Response} from "express";
import { validateLogs } from "../services/log-validation.service.js";
import { queueLogsForInsert } from "../services/log-batch-queue.service.js";

export async function insertLogsHandler(req: Request, res:Response){
    const result = validateLogs(req.body);
    // All entries are rejected    
    if(result.accepted.length === 0){
        res.status(400).json({
            accepted: 0,
            rejected: result.rejected
        });
        return;
    }   
    queueLogsForInsert(result.accepted) ;
    //await insertLogs(result.accepted)
    res.status(200).json({
        accepted: result.accepted.length,
        rejected: result.rejected
    });

}