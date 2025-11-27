import {
    Injectable,
    ExecutionContext,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class CustomAuthGuard extends JwtAuthGuard {
    constructor() {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // ✅ First, run the default JWT auth guard
        const canActivate = await super.canActivate(context);
        if (!canActivate) return false;

        // ✅ Get the request with user from JWT payload
        const request = context.switchToHttp().getRequest();
        // Replace JWT payload user with fresh DB record
        request.user = request.user;
        return true;
    }
}
