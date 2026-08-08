import { BadRequestError } from "../errors/app-errors.js";

export type CursorPayload ={
    timestamp: string;
    id:string;
};

export function encodeCursor(payload: CursorPayload){
    const stringPayload = JSON.stringify(payload);
    // convert stringPayload into bytes first then convert the bytes into encoded string base64
    return Buffer.from(stringPayload, 'utf-8').toString('base64');
}

export function decodeCursor(cursor: string){
    try{
        const stringPayload = Buffer.from(cursor,'base64').toString('utf-8');
        const payload = JSON.parse(stringPayload);
        if(!payload || typeof payload.timestamp != "string" || typeof payload.id != "string"){
            throw new BadRequestError("Invalid or malformed cursor");
        }
        return payload as CursorPayload;
    }
    catch(error){
        throw new BadRequestError("Invalid or malformed cursor");
    }

}