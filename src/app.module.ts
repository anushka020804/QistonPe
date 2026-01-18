import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeormConfig } from './config/typeorm.config';
import { AnalyticsModule } from './analytics/analytics.module';
import { PaymentsModule } from './payments/payments.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { VendorsModule } from './vendors/vendors.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...typeormConfig,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    VendorsModule,
    PurchaseOrdersModule,
    PaymentsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
