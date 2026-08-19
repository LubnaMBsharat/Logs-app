import { Request , Response} from "express";
import { queryWhereClauseBuilder, validateQueryLogs } from "../services/log-query.service.js";
import { getLogs } from "../db/queries/logs-query.js";
import { CursorPayload, encodeCursor } from "../utils/cursor.js";

export async function queryLogsHandler(req:Request, res: Response){
    const rawReqQuery= req.query;
    const queryParams = validateQueryLogs(rawReqQuery);

    const whereClause = queryWhereClauseBuilder(queryParams,rawReqQuery);
    const logResults =await getLogs(whereClause,queryParams.limit);

    let cursor=null;
    if( logResults.length  > queryParams.limit){
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