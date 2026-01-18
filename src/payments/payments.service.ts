import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PurchaseOrderStatus } from '../common/enums/purchase-order-status.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async record(dto: CreatePaymentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const po = await queryRunner.manager.findOne(PurchaseOrder, {
        where: { id: dto.purchaseOrderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!po) throw new NotFoundException('Purchase order not found');
      if (po.status === PurchaseOrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot pay a cancelled purchase order');
      }

      const outstanding = po.outstandingAmount;
      if (dto.amount > outstanding) {
        throw new BadRequestException('Payment exceeds outstanding amount');
      }

      const payment = queryRunner.manager.create(Payment, {
        purchaseOrder: po,
        amount: dto.amount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        reference: dto.reference,
      });

      po.paidAmount = Number((po.paidAmount + dto.amount).toFixed(2));
      po.outstandingAmount = Number((po.outstandingAmount - dto.amount).toFixed(2));
      po.status = po.outstandingAmount <= 0 ? PurchaseOrderStatus.PAID : PurchaseOrderStatus.PARTIALLY_PAID;

      const savedPayment = await queryRunner.manager.save(payment);
      const updatedPO = await queryRunner.manager.save(po);

      await queryRunner.commitTransaction();
      
      // Return payment with updated purchase order to show status changes
      return {
        payment: savedPayment,
        purchaseOrder: {
          id: updatedPO.id,
          poNumber: updatedPO.poNumber,
          status: updatedPO.status,
          totalAmount: updatedPO.totalAmount,
          paidAmount: updatedPO.paidAmount,
          outstandingAmount: updatedPO.outstandingAmount,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.paymentRepo.find({ relations: ['purchaseOrder'] });
  }
}
