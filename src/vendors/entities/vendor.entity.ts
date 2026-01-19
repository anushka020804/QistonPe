import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentTerm } from '../../common/enums/payment-terms.enum';
import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity';

@Entity({ name: 'vendors' })
export class Vendor {
  @ApiProperty({ description: 'Unique vendor ID', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Vendor name (unique)' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Vendor email (unique)' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Payment terms in days', enum: PaymentTerm })
  @Column({ type: 'enum', enum: PaymentTerm, default: PaymentTerm.NET_30, name: 'payment_term' })
  paymentTerm: PaymentTerm;

  @ApiProperty({ description: 'Vendor active status' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Purchase orders for this vendor', type: () => [PurchaseOrder] })
  @OneToMany(() => PurchaseOrder, (po) => po.vendor)
  purchaseOrders: PurchaseOrder[];

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
