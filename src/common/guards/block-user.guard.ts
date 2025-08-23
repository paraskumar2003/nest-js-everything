import {
    Injectable,
    ForbiddenException,
    ExecutionContext,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/modules/users/users.service';
import { UserStatus } from 'src/modules/users/enum/user-status.enum';

@Injectable()
export class CustomAuthGuard extends JwtAuthGuard {
    constructor(private readonly usersService: UsersService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // ✅ First, run the default JWT auth guard
        const canActivate = await super.canActivate(context);
        if (!canActivate) return false;

        // ✅ Get the request with user from JWT payload
        const request = context.switchToHttp().getRequest();
        const jwtUser = request.user;

        // ✅ Fetch latest user from DB
        const freshUser = await this.usersService.findOneById(jwtUser.id);
        if (!freshUser) {
            return false;
        }

        if (
            [UserStatus.Blocked, UserStatus.Inactive].includes(freshUser.status)
        ) {
            throw new ForbiddenException(
                'Please contact your administrator or support.',
            );
        }

        // Replace JWT payload user with fresh DB record
        request.user = freshUser;
        return true;
    }
}
