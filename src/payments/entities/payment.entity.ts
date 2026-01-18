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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.payments, { onDelete: 'CASCADE' })
  purchaseOrder: PurchaseOrder;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer })
  amount: number;

  @Column({ type: 'date', name: 'payment_date' })
  paymentDate: Date;

  @Column({ nullable: true })
  reference?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
