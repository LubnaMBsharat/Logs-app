import { describe, test, expect } from 'vitest';
import {validateLogs} from "../../services/log-validation.service.js"
describe("Service: validateLogs", ()=>{
    test("Should Process a valid batch", ()=>{
      const validBatch = {
        logs: [
            {
                timestamp: new Date().toISOString(),
                level: "error",
                service: "checkout",
                message: "payment declined",
                attributes:{
                    user_id : "42",
                    region: "eu-west",
                    retries: 3
                }
            },
            {
                timestamp: new Date().toISOString(),
                level: "error",
                service: "log-in",
                message: "wrong password",
                attributes:{
                    user_id : "22",
                }
            }
        ]
      };
    const result = validateLogs(validBatch);
    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(0);
    expect(result.accepted[0].service).toBe("checkout");
    expect(result.accepted[1].service).toBe("log-in");
    });
    test("Should perform partial rejection correctly", ()=>{
        const batch ={
        logs: [
        // 1. Valid entry without attributes
        {
            timestamp: new Date().toISOString(),
            level: 'warn',
            service: 'payment-service',
            message: 'Payment retry'
        },
        // 2. Valid Entry with attributes
        {
            timestamp: new Date().toISOString(),
            level: 'info',
            service: 'payment-service',
            message: 'Payment success',
            attributes:{
                user_id : "42",
                region: "eu-west",
            }
        },
        // 3. Future timestamp (> 5 mins)
        {
            timestamp: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            level: 'info',
            service: 'order-service',
            message: 'Future event'
        },
        // 4. Invalid Enum level
        {
            timestamp: new Date().toISOString(),
            level: 'fatal',
            service: 'order-service',
            message: 'Fatal error'
        },
        // 5. Empty service string
        {
            timestamp: new Date().toISOString(),
            level: 'error',
            service: '',
            message: 'Missing service'
        },
        // 6. Empty message string
        {
            timestamp: new Date().toISOString(),
            level: 'error',
            service: 'log-in',
            message: ''
        }
    ]};
    const result = validateLogs(batch);
    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(4);

    expect(result.rejected[0].index).toBe(2);
    expect(result.rejected[1].index).toBe(3);
    expect(result.rejected[2].index).toBe(4);
    expect(result.rejected[3].index).toBe(5);
    });
    test("",()=>{
        const invalidBatch = {
        logs:[
        //invalid entry: timestamp without timezone   
            {
                timestamp: "2026-07-20T14:32:01.123",
                level: 'warn',
                service: 'payment-service',
                message: 'Payment retry'
            },
        ]
    };
    const result = validateLogs(invalidBatch);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);

    expect(result.rejected[0].reason).toContain("timestamp");
    })
    test("Should handle empty batch",()=>{
        const emptyBatch = {
            logs:[]
        };
    const result = validateLogs(emptyBatch);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
    });

})