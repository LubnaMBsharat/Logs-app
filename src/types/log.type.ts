import {z} from "zod";

export const logSchema = z.object({
    timestamp: z.iso.datetime({
        message: "Invalid ISO timestamp format"})
        .transform((str)=> new Date(str))
        //Refinement to write a Custom Validation Rule
        .refine((date)=> date <= new Date(Date.now() + 5 * 60 * 1000),
        { message: "Must not be more than five minutes in the future" }
    ),
    level: z.enum(['debug','info','warn','error']),
    service: z.string().min(1,"Service name is required"),
    message: z.string().min(1,"Message cannot be empty"),
    attributes: z.record(z.string(), z.union([z.string(),z.number(),z.boolean()])).optional()
    // z.json().optional()
});

// to check the overall shape of the req not every entry on it
export const logsRequestShape  =z.object({
    logs: z.array(z.unknown())
});
export type LogEntry = z.infer<typeof logSchema>;
export type LogsShape = z.infer<typeof logsRequestShape>;
