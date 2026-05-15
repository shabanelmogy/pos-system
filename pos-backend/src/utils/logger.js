import { AsyncLocalStorage } from 'async_hooks';

const als = new AsyncLocalStorage();

export const runWithCorrelationId = (correlationId, fn) => {
  return als.run(correlationId, fn);
};

const getCorrelationId = () => als.getStore();

const logger = {
  info(message, context = {}) {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      correlationId: getCorrelationId(),
      message,
      ...context
    }));
  },
  warn(message, context = {}) {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      correlationId: getCorrelationId(),
      message,
      ...context
    }));
  },
  error(message, error = null, context = {}) {
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
