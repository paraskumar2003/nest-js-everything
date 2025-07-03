import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as WinstonCloudWatch from 'winston-aws-cloudwatch';
import * as AWS from 'aws-sdk';
import { LogData, LoggerService } from './interfaces/logger.interface';

@Injectable()
export class CustomLoggerService implements LoggerService {
    private logger: winston.Logger;

    constructor(private configService: ConfigService) {
        this.initializeLogger();
    }

    private initializeLogger() {
        const env = this.configService.get<string>('NODE_ENV', 'development');
        const logGroupName = `${this.configService.get<string>('APP_NAME', 'APP')}_${env}`;

        this.logger = winston.createLogger({
            levels: {
                emerg: 0,
                alert: 1,
                crit: 2,
                error: 3,
                warn: 4,
                notice: 5,
                info: 6,
                debug: 7,
            },
            transports: [
                new WinstonCloudWatch({
                    cloudWatchLogs: new AWS.CloudWatchLogs(),
                    logGroupName,
                    logStreamName: 'LOGGER_MODULE',
                    createLogGroup: true,
                    createLogStream: true,
                    submissionInterval: 2000,
                    submissionRetryCount: 1,
                    batchSize: 20,
                    awsConfig: {
                        accessKeyId:
                            this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                        secretAccessKey: this.configService.get<string>(
                            'AWS_SECRET_ACCESS_KEY',
                        ),
                        region: this.configService.get<string>('AWS_REGION'),
                    },
                    formatLog: item => {
                        return JSON.stringify({
                            timestamp: Date.now(),
                            tag: item.level,
                            journeyId: item.meta?.journeyId || 'system',
                            data: item.meta?.data || {},
                            message: item.message,
                        });
                    },
                }),
                new winston.transports.Console({
                    format: winston.format.simple(),
                }),
            ],
        });
    }

    private createLogData(
        tag: string,
        journeyId: string,
        data: Record<string, any>,
    ): LogData {
        return {
            timestamp: Date.now(),
            tag,
            journeyId,
            data,
        };
    }

    log(tag: string, journeyId: string, data: Record<string, any>): void {
        const logData = this.createLogData(tag, journeyId, data);
        this.logger.info(tag, { journeyId, data });
        console.log(JSON.stringify(logData));
    }

    error(tag: string, journeyId: string, data: Record<string, any>): void {
        const logData = this.createLogData(tag, journeyId, data);
        this.logger.error(tag, { journeyId, data });
        console.error(JSON.stringify(logData));
    }

    warn(tag: string, journeyId: string, data: Record<string, any>): void {
        const logData = this.createLogData(tag, journeyId, data);
        this.logger.warn(tag, { journeyId, data });
        console.warn(JSON.stringify(logData));
    }

    info(tag: string, journeyId: string, data: Record<string, any>): void {
        const logData = this.createLogData(tag, journeyId, data);
        this.logger.info(tag, { journeyId, data });
        console.info(JSON.stringify(logData));
    }
}
