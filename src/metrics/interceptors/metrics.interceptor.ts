import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Histogram, Counter } from 'prom-client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status', 'service'],
});

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status', 'service'],
});

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const route = req.route?.path || 'unknown';
    const service = 'nest-service';

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const status = context.switchToHttp().getResponse().statusCode;
        const duration = (Date.now() - start) / 1000;

        httpRequestDuration
          .labels(method, route, status.toString(), service)
          .observe(duration);

        httpRequestsTotal
          .labels(method, route, status.toString(), service)
          .inc();
      }),
    );
  }
}
