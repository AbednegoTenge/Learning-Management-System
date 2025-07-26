import pkg from "winston";
import path from "path";
import { fileURLToPath } from "url";
import DailyRotateFile from 'winston-daily-rotate-file';  // for log rotation

const { createLogger: createlogger, format, transports } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, defaultMeta }) => `${timestamp} [${level}] ${defaultMeta ? `[${defaultMeta.service}]` : ''}: ${message}`)
);

const consoleFormat = format.combine(
    format.colorize(),
    format.simple()  // Console-friendly format
);

const generalLogger = createlogger({
    level: process.env.LOG_LEVEL || 'info',  // Set log level via environment variable
    format: fileFormat,
    transports: [
        new transports.File({ filename: path.join(__dirname, '/logs/error.log'), level: 'error' }),
        new transports.File({ filename: path.join(__dirname, '/logs/combine.log') })
    ]
});

// Log rotation (daily rotation)
const rotateTransport = new DailyRotateFile({
    filename: path.join(__dirname, 'logs/%DATE%-combine.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '14d'
});
generalLogger.add(rotateTransport);

const dblogger = createlogger({
    level: 'debug',
    format: fileFormat,
    defaultMeta: { service: 'database' },
    transports: [
        new transports.File({ filename: path.join(__dirname, '/logs/db.log') })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    generalLogger.add(new transports.Console({ format: consoleFormat }));
    dblogger.add(new transports.Console({ format: consoleFormat }));
    dblogger.debug('Debugging mode is ON');
}

export { generalLogger, dblogger };
