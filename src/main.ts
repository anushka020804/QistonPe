import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Vendor } from './vendors/entities/vendor.entity';
import { PurchaseOrder } from './purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from './purchase-orders/entities/purchase-order-item.entity';
import { Payment } from './payments/entities/payment.entity';
import { User } from './users/user.entity';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Vendor Payment System')
    .setDescription(
      'MSME vendor payment tracking API\n\n' +
      '## Understanding Schemas Section\n\n' +
      '**DTOs (Data Transfer Objects)** - API request/response formats:\n' +
      '- Shows what data to send in API requests (e.g., CreateVendorDto, CreatePaymentDto)\n' +
      '- Only includes fields you provide (no auto-generated IDs or timestamps)\n' +
      '- Contains validation rules for input data\n\n' +
      '**Database Entities** - Complete database table structures:\n' +
      '- Shows the full database schema (e.g., Vendor, PurchaseOrder, Payment)\n' +
      '- Includes all fields: IDs, timestamps, relationships, system fields\n' +
      '- Represents what is actually stored in the database\n\n' +
      '**Example:**\n' +
      '- Use `CreateVendorDto` to see what to send in POST /vendors\n' +
      '- Check `Vendor` entity to see the complete database structure\n\n' +
      '**Authentication:** All endpoints (except /auth/login) require Bearer token authentication.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [Vendor, PurchaseOrder, PurchaseOrderItem, Payment, User],
  });
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
}

bootstrap();
