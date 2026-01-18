import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { PaymentTerm } from '../common/enums/payment-terms.enum';
import { PurchaseOrderStatus } from '../common/enums/purchase-order-status.enum';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderStatusDto } from './dto/update-purchase-order-status.dto';
import { PurchaseOrderItemDto } from './dto/purchase-order-item.dto';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  async create(dto: CreatePurchaseOrderDto) {
    const vendor = await this.vendorRepo.findOne({ where: { id: dto.vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    if (!vendor.isActive) {
      throw new BadRequestException('Cannot create PO for inactive vendor');
    }

    const poNumber = await this.generatePoNumber();
    const issueDate = dto.issueDate ? new Date(dto.issueDate) : new Date();
    const dueDate = this.calculateDueDate(issueDate, vendor.paymentTerm);

    const items = dto.items.map((item) => this.mapItem(item));
    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

    const po = this.poRepo.create({
      poNumber,
      vendor,
      issueDate,
      dueDate,
      status: PurchaseOrderStatus.APPROVED,
      totalAmount,
      paidAmount: 0,
      outstandingAmount: totalAmount,
      note: dto.note,
      items,
    });

    return this.poRepo.save(po);
  }

  async findAll() {
    return this.poRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const po = await this.poRepo.findOne({ where: { id } });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async updateStatus(id: string, dto: UpdatePurchaseOrderStatusDto) {
    const po = await this.findOne(id);

    if (dto.status === PurchaseOrderStatus.CANCELLED) {
      if (po.paidAmount > 0) {
        throw new BadRequestException('Cannot cancel a partially or fully paid PO');
      }
      po.status = PurchaseOrderStatus.CANCELLED;
      po.outstandingAmount = 0;
    } else {
      throw new BadRequestException('Status is managed automatically');
    }

    const updatedPO = await this.poRepo.save(po);
    // Reload with relations to show complete updated state
    const reloadedPO = await this.poRepo.findOne({
      where: { id: updatedPO.id },
      relations: ['vendor', 'items'],
    });
    if (!reloadedPO) {
      throw new NotFoundException('Purchase order not found after update');
    }
    return reloadedPO;
  }

  private async generatePoNumber(): Promise<string> {
    const datePart = this.formatDate(new Date());
    const existingCount = await this.poRepo.count({
      where: { poNumber: Like(`PO-${datePart}%`) },
      withDeleted: true,
    });
    const sequence = String(existingCount + 1).padStart(3, '0');
    return `PO-${datePart}-${sequence}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private calculateDueDate(issueDate: Date, term: PaymentTerm): Date {
    const due = new Date(issueDate);
    due.setDate(due.getDate() + term);
    return due;
  }

  private mapItem(item: PurchaseOrderItemDto): PurchaseOrderItem {
    const lineTotal = Number((item.quantity * item.unitPrice).toFixed(2));
    return this.poRepo.manager.create(PurchaseOrderItem, {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal,
    });
  }
}
