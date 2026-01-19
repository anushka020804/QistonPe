import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'Unique purchase order ID', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Auto-generated PO number (PO-YYYYMMDD-XXX)' })
  @Column({ name: 'po_number', unique: true })
  poNumber: string;

  @ApiProperty({ description: 'Associated vendor', type: () => Vendor })
  @ManyToOne(() => Vendor, (vendor) => vendor.purchaseOrders, { eager: true })
  vendor: Vendor;

  @ApiProperty({ description: 'PO issue date' })
  @Column({ type: 'date', name: 'issue_date' })
  issueDate: Date;

  @ApiProperty({ description: 'PO due date (calculated from vendor payment terms)' })
  @Column({ type: 'date', name: 'due_date' })
  dueDate: Date;

  @ApiProperty({ description: 'Purchase order status', enum: PurchaseOrderStatus })
  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.APPROVED,
  })
  status: PurchaseOrderStatus;

  @ApiProperty({ description: 'Total amount (sum of all items)', example: 1000.00 })
  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer, name: 'total_amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Total amount paid', example: 500.00 })
  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer, name: 'paid_amount', default: 0 })
  paidAmount: number;

  @ApiProperty({ description: 'Outstanding amount (total - paid)', example: 500.00 })
  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer, name: 'outstanding_amount', default: 0 })
  outstandingAmount: number;

  @ApiProperty({ description: 'Optional notes', required: false })
  @Column({ type: 'text', nullable: true })
  note?: string;

  @ApiProperty({ description: 'Purchase order line items', type: () => [PurchaseOrderItem] })
  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true,
    eager: true,
  })
  items: PurchaseOrderItem[];

  @ApiProperty({ description: 'Payments made against this PO', type: () => [Payment] })
  @OneToMany(() => Payment, (payment) => payment.purchaseOrder)
  payments: Payment[];

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
