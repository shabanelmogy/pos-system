import { AsyncLocalStorage } from 'async_hooks';

const als = new AsyncLocalStorage<string>();

export const runWithCorrelationId = <T>(correlationId: string, fn: () => T): T => {
  return als.run(correlationId, fn);
};

const getCorrelationId = (): string | undefined => als.getStore();

const logger = {
  info(message: string, context: Record<string, any> = {}): void {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      correlationId: getCorrelationId(),
      message,
      ...context
    }));
  },
  warn(message: string, context: Record<string, any> = {}): void {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      correlationId: getCorrelationId(),
      message,
      ...context
    }));
  },
  error(message: string, error: any = null, context: Record<string, any> = {}): void {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      correlationId: getCorrelationId(),
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...context
    }));
  }
};

export default logger;
