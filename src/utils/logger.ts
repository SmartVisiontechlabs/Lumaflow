const isProd = import.meta.env.PROD;

if (isProd) {
  // Silence development/verbose logs in production builds
  console.log = () => {};
  console.warn = () => {};
  console.debug = () => {};
  console.info = () => {};
  // Keep console.error active for critical errors and monitoring
}

export const logger = {
  log: (...args: any[]) => {
    if (!isProd) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProd) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  debug: (...args: any[]) => {
    if (!isProd) {
      console.debug(...args);
    }
  }
};
