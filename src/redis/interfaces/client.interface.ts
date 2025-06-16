export interface IRedisClient {
    get(key: string): Promise<string>;
    set(
        key: string,
        value: string,
        options?: 'EX' | 'PX',
        ttl?: number,
    ): Promise<string>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<number>;
}
