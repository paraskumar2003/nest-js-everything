// src/common/exceptions/cached-response.exception.ts
export class CachedResponseException {
    constructor(public readonly cachedData: any) {}
}
