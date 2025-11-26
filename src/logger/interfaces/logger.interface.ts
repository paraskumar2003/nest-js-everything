export interface LogData {
    timestamp: number;
    tag: string;
    journeyId: string;
    data: Record<string, any>;
}

export interface LoggerService {
    log(tag: string, journeyId: string, data: Record<string, any>): void;
    error(tag: string, journeyId: string, data: Record<string, any>): void;
    warn(tag: string, journeyId: string, data: Record<string, any>): void;
    info(tag: string, journeyId: string, data: Record<string, any>): void;
}
