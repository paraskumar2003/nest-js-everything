import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/api-logging.interceptor';
import { AllExceptionsFilter } from './common/filters/exception.filter';
import { AppClusterService } from './app-cluster.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Set global prefix
    app.setGlobalPrefix('api');

    // Apply global response transformation interceptor
    const transformInterceptor = app.get(TransformInterceptor);
    const loggingInterceptor = app.get(LoggingInterceptor);
    app.useGlobalInterceptors(transformInterceptor, loggingInterceptor);

    // Apply global exception filter
    const exceptionFilter = app.get(AllExceptionsFilter);
    app.useGlobalFilters(exceptionFilter);

    // Enable validation pipes globally
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Enable CORS
    app.enableCors({ origin: ['http://localhost:3000'] });

    const port = process.env.PORT || 3000;

    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}

if (process.env.NODE_ENV === 'production') {
    AppClusterService.clusterize(bootstrap);
} else {
    bootstrap();
}
