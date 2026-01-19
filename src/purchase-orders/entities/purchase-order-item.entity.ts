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
import { PurchaseOrder } from './purchase-order.entity';

@Entity({ name: 'purchase_order_items' })
export class PurchaseOrderItem {
  @ApiProperty({ description: 'Unique item ID', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Parent purchase order', type: () => PurchaseOrder })
  @ManyToOne(() => PurchaseOrder, (po) => po.items, { onDelete: 'CASCADE' })
  purchaseOrder: PurchaseOrder;

  @ApiProperty({ description: 'Item description' })
  @Column()
  description: string;

  @ApiProperty({ description: 'Item quantity', example: 10 })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 100.00 })
  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer, name: 'unit_price' })
  unitPrice: number;

  @ApiProperty({ description: 'Line total (quantity × unit price)', example: 1000.00 })
  @Column({ type: 'decimal', precision: 14, scale: 2, transformer: numericTransformer, name: 'line_total' })
  lineTotal: number;

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
