// Import SetMetadata to define custom route-level metadata
import { SetMetadata } from '@nestjs/common';

// Define a unique metadata key to be used in Reflector lookups
export const SKIP_INTERCEPTOR = 'SKIP_INTERCEPTOR';

/**
 * Custom decorator to mark a route or controller to skip a specific interceptor.
 *
 * Usage:
 *
 * @SkipInterceptor()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const SkipInterceptor = () => SetMetadata(SKIP_INTERCEPTOR, true);
