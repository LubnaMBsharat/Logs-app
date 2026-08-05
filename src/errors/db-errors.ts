const FATAL_POSTGRES_CODES = new Set([
  'ECONNREFUSED',  // connection refused
  '57P01',         // admin_shutdown 
  '57P03',         // cannot_connect_now 
  '08006',         // connection_failure 
  '08001',         // unable_to_establish_sql connection
  'ETIMEDOUT',    
]);

export function isDatabaseFatalError(error: any): boolean {
  if (!error) return false;

  const errorCode = error.code || error.originalError?.code;
    
  return FATAL_POSTGRES_CODES.has(errorCode);
}