import { Request, Response } from "express";
import { LogAggregatorSchema } from "../types/log-aggregator.type.js"
import { BadRequestError } from "../errors/app-errors.js";
import { buildAggregateQuery } from "../services/log-aggregator-service.js";
import { getAggregatedLogs } from "../db/queries/log-aggregate.js";

export async function aggregateLogsHandler(req:Request, res:Response){
    const queryParams = req.query;
    const result = LogAggregatorSchema.safeParse(queryParams);
    if(!result.success)
        throw new BadRequestError(result.error.issues[0].message);
    const query = buildAggregateQuery(result.data,queryParams);
    const logResults = await getAggregatedLogs(query);
    res.status(200).json({buckets:
        logResults})
}