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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, name: 'contact_person' })
  contactPerson?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber?: string;

  @Column({ type: 'enum', enum: PaymentTerm, default: PaymentTerm.NET_30, name: 'payment_term' })
  paymentTerm: PaymentTerm;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => PurchaseOrder, (po) => po.vendor)
  purchaseOrders: PurchaseOrder[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
