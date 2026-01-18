import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PurchaseOrder])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
