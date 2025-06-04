import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HmacService {
    createHmac(requestBody: string, key: string): string {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(requestBody);
        return hmac.digest('hex');
    }
}
