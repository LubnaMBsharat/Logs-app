import {z} from "zod";

export const basicLogQuerySchema = z.object({
    service: z.string().optional(),
    level: z.enum(['debug','info','warn','error']).optional(),
    since: z.iso.datetime().optional(),
    until: z.iso.datetime().optional(),
    q: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(1000).default(100),
    cursor: z.string().optional() 
})
export const logQuerySchema = basicLogQuerySchema.refine((data)=>{
    // if since an until both is sent
    if(data.since && data.until){
        return new Date(data.since) <= new Date(data.until);
    }
    //if only one of them is sent
    return true;  
},// Error Options Object for refine method
{
    message: "'since' date cannot be after 'until' date",
    //load the error message to the since field
    path: ['since']
}
);
export type LogQueryParameters = z.infer<typeof logQuerySchema>;
