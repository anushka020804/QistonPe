import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseOrderStatus } from '../../common/enums/purchase-order-status.enum';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Payment } from '../../payments/entities/payment.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

@Entity({ name: 'purchase_orders' })
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'po_number', unique: true })
  poNumber: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.purchaseOrders, { eager: true })
  vendor: Vendor;

  @Column({ type: 'date', name: 'issue_date' })
  issueDate: Date;

  @Column({ type: 'date', name: 'due_date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.APPROVED,
  })
  status: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer, name: 'paid_amount', default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer, name: 'outstanding_amount', default: 0 })
  outstandingAmount: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
    eager: true,
  })
  items: PurchaseOrderItem[];

  @OneToMany(() => Payment, (payment) => payment.purchaseOrder)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
