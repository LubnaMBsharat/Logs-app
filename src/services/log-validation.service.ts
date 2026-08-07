import { BadRequestError } from "../errors/app-errors.js";
import { LogEntry, logSchema,logsRequestShape } from "../types/log.type.js";

export function validateLogs(requestBody:unknown){
    const logsArrayResult = logsRequestShape.safeParse(requestBody);
    if(!logsArrayResult.success)
        throw new BadRequestError("Request must contain a 'logs' array");
    const accepted: LogEntry[]= [];
    const rejected: {index:number;reason:string}[] = [];

    logsArrayResult.data.logs.forEach((log,index)=>{
        const logResult = logSchema.safeParse(log);

        if(logResult.success)
            accepted.push(logResult.data);
        else{
            rejected.push({index,reason:logResult.error.issues[0].message});
        }
    });
   return {accepted,rejected};
    
}