type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export default class Logger {
    public timestamp: Date = new Date();

    public static log(level: LogLevel, message: string) {
        console.log(`[${new Date().toLocaleString()}] [${level.toUpperCase()}]: ${message}`);
    }

    public static info(message: string) {
        this.log('info', message);
    }

    public static warn(message: string) {
        this.log('warn', message);
    }

    public static error(message: string) {
        this.log('error', message);
    }

    public static debug(message: string) {
        this.log('debug', message);
    }

    public static success(message: string) {
        this.log('success', message);
    }
}