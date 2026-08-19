export interface LogQueryParameters {
    service?: string;
    level?: 'debug' | 'info' | 'warn' | 'error';
    since?: string;
    until?: string;
    q?: string;
    limit: number;
    cursor?: string;
}
