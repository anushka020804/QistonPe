import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity';

@Entity({ name: 'payments' })
export class Payment {
  @ApiProperty({ description: 'Unique payment ID', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Associated purchase order', type: () => PurchaseOrder })
  @ManyToOne(() => PurchaseOrder, (po) => po.payments, { onDelete: 'CASCADE' })
  purchaseOrder: PurchaseOrder;

  @ApiProperty({ description: 'Payment amount', example: 500.00 })
  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer })
  amount: number;

  @ApiProperty({ description: 'Payment date' })
  @Column({ type: 'date', name: 'payment_date' })
  paymentDate: Date;

  @ApiProperty({ description: 'Payment reference (optional)', required: false })
  @Column({ nullable: true })
  reference?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
