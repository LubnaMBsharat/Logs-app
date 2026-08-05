import { NextFunction, Request, Response } from "express";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../error/app-errors.js";

export function errorHandler(err: Error,req: Request, res:Response , next: NextFunction){
    console.log(err.message);
    if(err instanceof BadRequestError)
        res.status(err.code).json({error: err.message});
    else if (err instanceof UnauthorizedError)
        res.status(err.code).json({error: err.message});
    else if (err instanceof ForbiddenError)
        res.status(err.code).json({error: err.message});
    else if (err instanceof NotFoundError)
        res.status(err.code).json({error: err.message});
    else 
        res.status(500).json({error: "Something went wrong on our end"});
}