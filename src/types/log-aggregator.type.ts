import {z} from "zod";
import { commonFiltersSchema} from "./log-common.type.js";

export const LogAggregatorSchema = commonFiltersSchema.extend({
    since: z.iso.datetime(),
    until:z.iso.datetime(),
    bucket: z.enum(["1m","5m","1h","1d"]),
    group_by: z.enum(["service","level"]).optional()
}).refine(
    (data)=> new Date(data.since) <= new Date(data.until),
    {
        message: "'since' date cannot be after 'until' date",
        path: ['since']
    } 
);
export type LogAggregator = z.infer<typeof LogAggregatorSchema>;