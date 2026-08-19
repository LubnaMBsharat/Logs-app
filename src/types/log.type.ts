export interface LogEntry {
    timestamp: Date;
    level: 'debug'| 'info' | 'warn' | 'error';
    service: string;
    message: string;
    attributes?:  Record<string, string | number | boolean>;
}
export interface RejectedEntry {
    index: number;
    reason: string;
}
export interface ValidationResult {
    accepted: LogEntry[];
    rejected: RejectedEntry[];
}

export const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error']);