import { NextFunction, Request, Response } from "express";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError, ServiceUnavailable, AppError } from "../errors/app-errors.js";
import { isDatabaseFatalError } from "../errors/db-errors.js";
import appState from "../utils/app-state.js";

export function errorHandler(err: Error,req: Request, res:Response , next: NextFunction){
    console.log(err.message);
    if(err instanceof AppError)
    {
        console.log(err.message); 
        res.status(err.statusCode).json({error: err.message});
    }

    else {
        console.error(err); 
        if (isDatabaseFatalError(err)) 
            appState.isDBReady = false; 
        res.status(500).json({error: "Something went wrong on our end"});
    }

}