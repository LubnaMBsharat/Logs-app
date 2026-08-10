import { basicLogQuerySchema} from "./log-query.type.js";
import {z} from "zod";
export const commonFiltersSchema = basicLogQuerySchema.pick({
    service: true,
    level:true,
    q:true
});
export type CommonFilters = z.infer<typeof commonFiltersSchema>;
