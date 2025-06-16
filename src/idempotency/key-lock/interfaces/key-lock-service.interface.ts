export interface KeyLockServiceInterface {
    lock(key: string): Promise<void>;
    release(key: string, ttl?: number): Promise<void>;
    wait(key: string): Promise<void>;
}
