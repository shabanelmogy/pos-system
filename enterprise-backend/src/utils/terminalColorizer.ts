import util from 'util';

const isDev = process.env.NODE_ENV !== 'production';

// ANSI escape codes for styling
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  inverse: '\x1b[7m',
  
  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  
  // Bright foreground colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
};

if (isDev) {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  const getTimestamp = (): string => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${colors.gray}[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]${colors.reset}`;
  };

  const colorizeString = (str: any): any => {
    if (typeof str !== 'string') return str;

    // 1. Check if it's a JSON log printed by our logger.js utility
    if (str.startsWith('{') && str.endsWith('}')) {
      try {
        const parsed = JSON.parse(str);
        if (parsed.level && parsed.message) {
          const timestamp = parsed.timestamp ? `${colors.gray}[${new Date(parsed.timestamp).toLocaleTimeString()}]${colors.reset} ` : '';
          const cid = parsed.correlationId ? `${colors.gray}[CID: ${parsed.correlationId}]${colors.reset} ` : '';
          
          let levelColor = colors.brightCyan;
          if (parsed.level === 'WARN') levelColor = colors.brightYellow;
          if (parsed.level === 'ERROR') levelColor = colors.brightRed;
          
          const levelStr = `${levelColor}${colors.bold}[${parsed.level}]${colors.reset}`;
          
          // Format additional context keys
          let contextStr = '';
          const contextKeys = Object.keys(parsed).filter(k => !['level', 'timestamp', 'correlationId', 'message', 'error', 'stack'].includes(k));
          if (contextKeys.length > 0) {
            const ctxObj: Record<string, any> = {};
            contextKeys.forEach(k => ctxObj[k] = parsed[k]);
            contextStr = ` ${colors.gray}${JSON.stringify(ctxObj)}${colors.reset}`;
          }
          
          const errStr = parsed.error ? `\n${colors.brightRed}${colors.bold}Error: ${parsed.error}${colors.reset}${parsed.stack ? `\n${colors.gray}${parsed.stack}${colors.reset}` : ''}` : '';
          
          return `${timestamp}${levelStr} ${cid}${parsed.message}${contextStr}${errStr}`;
        }
      } catch (e) {
        // Not a parsed JSON logger, continue to standard patterns
      }
    }

    // 2. Format Startup POS server banner
    if (str.includes('Starting POS Backend Server...')) {
      return `${colors.brightCyan}${colors.bold}${colors.inverse} ⚡ POS SYSTEM ⚡ ${colors.reset} ${colors.brightCyan}${colors.bold}Starting POS Backend Server...${colors.reset}`;
    }

    // 3. Success messages
    if (str.includes('✅') || str.includes('Success!') || str.includes('successfully') || str.includes('connected successfully')) {
      return `${colors.brightGreen}${colors.bold}${str}${colors.reset}`;
    }

    // 4. Critical failures or DB connect failures
    if (str.includes('❌') || str.includes('Failed') || str.includes('FAILED') || str.includes('Wipe failed') || str.includes('CRITICAL ERROR')) {
      return `${colors.brightRed}${colors.bold}${str}${colors.reset}`;
    }

    // 5. Warnings
    if (str.includes('⚠️') || str.includes('Warning:') || str.includes('warning') || str.includes('keys are missing')) {
      return `${colors.brightYellow}${colors.bold}${str}${colors.reset}`;
    }

    // 6. Debug / DB / Sync Tags
    if (str.includes('[DEBUG]') || str.includes('[SYNC]') || str.includes('[DB]') || str.includes('[DB ERROR]') || str.includes('[DB POOL ERROR]')) {
      return str
        .replace(/(\[DEBUG\])/g, `${colors.brightMagenta}${colors.bold}$1${colors.reset}`)
        .replace(/(\[SYNC\])/g, `${colors.brightCyan}${colors.bold}$1${colors.reset}`)
        .replace(/(\[DB ERROR\])/g, `${colors.brightRed}${colors.bold}$1${colors.reset}`)
        .replace(/(\[DB POOL ERROR\])/g, `${colors.brightRed}${colors.bold}$1${colors.reset}`)
        .replace(/(\[DB\])/g, `${colors.brightBlue}${colors.bold}$1${colors.reset}`);
    }

    // 7. Underline and color HTTP/HTTPS URLs (like Swagger links)
    if (str.includes('http://') || str.includes('https://')) {
      return str.replace(/(https?:\/\/[^\s]+)/g, `${colors.brightBlue}${colors.underline}$1${colors.reset}`);
    }

    return str;
  };

  const processArguments = (args: any[]): any[] => {
    return args.map(arg => {
      if (typeof arg === 'string') {
        return colorizeString(arg);
      } else if (typeof arg === 'object' && arg !== null) {
        return util.inspect(arg, { colors: true, depth: 3 });
      }
      return arg;
    });
  };

  console.log = (...args: any[]) => {
    originalLog(getTimestamp(), ...processArguments(args));
  };

  console.warn = (...args: any[]) => {
    originalWarn(getTimestamp(), `${colors.brightYellow}${colors.bold}[WARN]${colors.reset}`, ...processArguments(args));
  };

  console.error = (...args: any[]) => {
    originalError(getTimestamp(), `${colors.brightRed}${colors.bold}[ERROR]${colors.reset}`, ...processArguments(args));
  };

  console.info = (...args: any[]) => {
    originalInfo(getTimestamp(), `${colors.brightBlue}${colors.bold}[INFO]${colors.reset}`, ...processArguments(args));
  };
}

export default {};
