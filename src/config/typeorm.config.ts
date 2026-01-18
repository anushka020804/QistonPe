import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { PurchaseOrderItem } from '../purchase-orders/entities/purchase-order-item.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { User } from '../users/user.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

dotenv.config();

const isSsl = (process.env.DB_SSL ?? 'false').toLowerCase() === 'true';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'postgres',
  entities: [User, Vendor, PurchaseOrder, PurchaseOrderItem, Payment],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  ssl: isSsl ? { rejectUnauthorized: false } : false,
};
