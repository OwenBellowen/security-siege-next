type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

/**
 * Represents a Logger class for logging messages with different log levels.
 */
export default class Logger {
    /**
     * The timestamp of when the logger is created.
     */
    public timestamp: Date = new Date();

    /**
     * Logs a message with the specified log level.
     * @param level - The log level.
     * @param message - The message to log.
     */
    public static log(level: LogLevel, message: string) {
        console.log(`[${new Date().toLocaleString()}] [${level.toUpperCase()}]: ${message}`);
    }

    /**
     * Logs an info message.
     * @param message - The info message to log.
     */
    public static info(message: string) {
        this.log('info', message);
    }

    /**
     * Logs a warning message.
     * @param message - The warning message to log.
     */
    public static warn(message: string) {
        this.log('warn', message);
    }

    /**
     * Logs an error message.
     * @param message - The error message to log.
     */
    public static error(message: string) {
        this.log('error', message);
    }

    /**
     * Logs a debug message.
     * @param message - The debug message to log.
     */
    public static debug(message: string) {
        this.log('debug', message);
    }

    /**
     * Logs a success message.
     * @param message - The success message to log.
     */
    public static success(message: string) {
        this.log('success', message);
    }
}