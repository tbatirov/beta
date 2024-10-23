import { LogLevel, LogEntry } from '../types/logging';

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: LogLevel, message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context: context ? JSON.stringify(context) : undefined,
    };
    this.logs.push(logEntry);
    console.log(`[${timestamp}] [${level}] ${message}`, context || '');

    // In a real-world scenario, you might want to send this to a backend service
    // this.sendToBackend(logEntry);
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === LogLevel.ERROR);
  }

  public analyzeErrorPatterns(): { [key: string]: number } {
    const errorPatterns: { [key: string]: number } = {};
    this.getErrorLogs().forEach(log => {
      const key = log.message.split(':')[0]; // Simple pattern matching
      errorPatterns[key] = (errorPatterns[key] || 0) + 1;
    });
    return errorPatterns;
  }

  // private sendToBackend(logEntry: LogEntry): void {
  //   // Implement sending logs to a backend service
  // }
}

export const logger = Logger.getInstance();