import { BadRequestError } from "../errors/app-errors.js";
import { LogEntry, RejectedEntry, VALID_LEVELS} from "../types/log.type.js";
import { isValidISODate } from "../utils/date-utils.js";


export function validateLogs(requestBody:any){
    if (!requestBody || !Array.isArray(requestBody.logs)) {
        throw new BadRequestError("Request must contain a 'logs' array");
    }
    const accepted: LogEntry[]= [];
    const rejected: RejectedEntry[] = [];
    const logs = requestBody.logs;
    const nowPlus5Min = Date.now() + 5 * 60 * 1000;

    for(let i=0; i<logs.length; i++){
        const log= logs[i];

        // log entry is an object and not array
        if(!log || typeof log !== 'object' || Array.isArray(log)){
            rejected.push({index: i,reason:"Log entry must be an object"});
            continue;
        }

        // 1. timestamp 
        if(!log.timestamp || typeof log.timestamp !== 'string' || !isValidISODate(log.timestamp)){
            rejected.push({index: i,reason:"Invalid ISO timestamp format"});
            continue;
        }
        const timestampObj = new Date(log.timestamp);
        if(timestampObj.getTime() > nowPlus5Min){
            rejected.push({index: i, reason:"Must not be more than five minutes in the future"});
            continue;
        }
        // 2. level
        if (!log.level || typeof log.level !== 'string' || !VALID_LEVELS.has(log.level)) {
            rejected.push({ index: i, reason: "Invalid log level" });
            continue;
        }

        // 3. service
        if (typeof log.service !== 'string' || log.service.length === 0) {
            rejected.push({ index: i, reason: "Service name is required" });
            continue;
        }        
        // 4. message
        if (typeof log.message !== 'string' || log.message.length === 0) {
            rejected.push({ index:i, reason: "Message cannot be empty" });
            continue;
        }
        // 5. attributes
        let validAttributes: Record<string, string | number | boolean> | undefined = undefined;

        if (log.attributes !== undefined && log.attributes !== null) {
            if (typeof log.attributes !== 'object' || Array.isArray(log.attributes)) {
            rejected.push({ index: i, reason: "Attributes must be a flat object" });
            continue;
        }

        let isFlatObject = true;
        const keys = Object.keys(log.attributes);

        for (let i = 0; i < keys.length; i++) {
            const val = log.attributes[keys[i]];
            const valType = typeof val;

            if (valType !== 'string' && valType !== 'number' && valType !== 'boolean') {
                isFlatObject = false;
                break;
            }
        }

        if (!isFlatObject) {
            rejected.push({ index:i, reason: "Attributes must contain only strings, numbers, or booleans" });
            continue;
        }
        validAttributes = log.attributes;
        } 

        accepted.push({
        timestamp: timestampObj,
        level: log.level,
        service: log.service,
        message: log.message,
        attributes: validAttributes,
        });
    }
    return { accepted, rejected };
}


