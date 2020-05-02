import winston from 'winston';

export default winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            level: 'info',
        }),
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
    ),
});
