import { Request, Response } from "express";
import { buildAggregateQuery, validateLogAggregator } from "../services/log-aggregator-service.js";
import { getAggregatedLogs } from "../db/queries/log-aggregate.js";

export async function aggregateLogsHandler(req:Request, res:Response){
    const queryParams = req.query;
    const validatedParams = validateLogAggregator(queryParams);

    const query = buildAggregateQuery(validatedParams,queryParams);
    const logResults = await getAggregatedLogs(query);

    res.status(200).json({
        buckets:logResults});
}