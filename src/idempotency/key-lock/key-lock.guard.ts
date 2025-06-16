import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { KeyLockService } from './key-lock.service';

@Injectable()
export class KeyLockGuard implements CanActivate {
    constructor(private keyLockService: KeyLockService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        await this.keyLockService.wait(request.user.id);
        await this.keyLockService.lock(request.user.id);

        response.on('finish', async () => {
            await this.keyLockService.release(request.user.id);
        });
        return true;
    }
}
