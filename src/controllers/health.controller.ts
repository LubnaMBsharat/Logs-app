import { Request, Response } from "express";
import appState from "../utils/app-state.js";
import { ServiceUnavailable } from "../errors/app-errors.js";

export async function healthHandler(req:Request, res:Response ){
    if(!appState.isReady || !appState.isDBReady){
        throw new ServiceUnavailable('Service is not ready yet');
    }
    res.status(200).json({
        status:'ok',
        message:'Service is healthy and ready',
    })
}