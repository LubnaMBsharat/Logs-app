import { Request , Response} from "express";
import { queryWhereClauseBuilder } from "../services/log-query.service.js";
import { logQuerySchema } from "../types/log-query.type.js";
import { BadRequestError } from "../errors/app-errors.js";
import { getLogs } from "../db/queries/logs-query.js";
import { CursorPayload, encodeCursor } from "../utils/cursor.js";

export async function queryLogsHandler(req:Request, res: Response){
    //console.log(req.query);
    const rawReqQuery= req.query;
    const result = logQuerySchema.safeParse(req.query);
    if(!result.success){
        throw new BadRequestError(result.error.issues[0].message);
    }
    const whereClause = queryWhereClauseBuilder(result.data,rawReqQuery);
    const logResults =await getLogs(whereClause,result.data.limit);

    let cursor=null;
    if( logResults.length  > result.data.limit){
        logResults.pop();
        const lastLog = logResults.at(-1);
        if(!lastLog)
            throw new Error("Unexpected Error: The last log not found");
        const cursorPayload:CursorPayload = {
            timestamp:lastLog.timestamp.toISOString(),
            id:lastLog.id
        }
        cursor = encodeCursor(cursorPayload);
    }
    res.status(200).json({
        logs: logResults,
        next_cursor: cursor
    })
}