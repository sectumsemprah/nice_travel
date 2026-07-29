export interface LogContext {
  requestId?: string;
  userId?: string;
  tripId?: string;
  jobId?: string;
  traceId?: string;
  durationMs?: number;
  result?: string;
}

export function logInfo(message: string, context: LogContext = {}) {
  console.info(JSON.stringify({ level: 'info', message, at: new Date().toISOString(), ...context }));
}

export function logError(message: string, context: LogContext = {}) {
  console.error(JSON.stringify({ level: 'error', message, at: new Date().toISOString(), ...context }));
}

