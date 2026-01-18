import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PurchaseOrderStatus } from '../common/enums/purchase-order-status.enum';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async vendorOutstanding() {
    return this.poRepo
      .createQueryBuilder('po')
      .select('vendor.id', 'vendorId')
      .addSelect('vendor.name', 'vendorName')
      .addSelect('vendor.email', 'vendorEmail')
      .addSelect('COALESCE(SUM(po.outstandingAmount), 0)', 'outstanding')
      .innerJoin('po.vendor', 'vendor')
      .where('po.status != :cancelled', { cancelled: PurchaseOrderStatus.CANCELLED })
      .andWhere('po.deletedAt IS NULL')
      .groupBy('vendor.id')
      .addGroupBy('vendor.name')
      .addGroupBy('vendor.email')
      .orderBy('outstanding', 'DESC')
      .getRawMany();
  }

  async agingBuckets() {
    const sql = `
      SELECT
        SUM(CASE WHEN days_overdue BETWEEN 0 AND 30 THEN outstanding_amount ELSE 0 END) AS bucket_0_30,
        SUM(CASE WHEN days_overdue BETWEEN 31 AND 60 THEN outstanding_amount ELSE 0 END) AS bucket_31_60,
        SUM(CASE WHEN days_overdue BETWEEN 61 AND 90 THEN outstanding_amount ELSE 0 END) AS bucket_61_90,
        SUM(CASE WHEN days_overdue > 90 THEN outstanding_amount ELSE 0 END) AS bucket_90_plus
      FROM (
        SELECT
          po.outstanding_amount,
          GREATEST(0, (CURRENT_DATE - po.due_date)::INT) AS days_overdue
        FROM purchase_orders po
        WHERE po.deleted_at IS NULL
          AND po.status NOT IN ('CANCELLED')
          AND po.outstanding_amount > 0
      ) AS aging;
    `;

    const [result] = await this.dataSource.query(sql);
    return {
      bucket_0_30: Number(result?.bucket_0_30 ?? 0),
      bucket_31_60: Number(result?.bucket_31_60 ?? 0),
      bucket_61_90: Number(result?.bucket_61_90 ?? 0),
      bucket_90_plus: Number(result?.bucket_90_plus ?? 0),
    };
  }
}
