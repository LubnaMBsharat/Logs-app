export interface CommonFilters {
  service?: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  q?: string;
}