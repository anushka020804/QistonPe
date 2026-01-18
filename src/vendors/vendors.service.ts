import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PurchaseOrderStatus } from '../common/enums/purchase-order-status.enum';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor) private readonly repo: Repository<Vendor>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateVendorDto) {
    await this.ensureUnique(dto.name, dto.email);
    const vendor = this.repo.create({ ...dto });
    return this.repo.save(vendor);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const vendor = await this.repo.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Calculate payment summary
    const summary = await this.dataSource
      .createQueryBuilder()
      .select('COALESCE(SUM(po.total_amount), 0)', 'totalAmount')
      .addSelect('COALESCE(SUM(po.paid_amount), 0)', 'paidAmount')
      .addSelect('COALESCE(SUM(po.outstanding_amount), 0)', 'outstandingAmount')
      .from('purchase_orders', 'po')
      .where('po."vendorId" = :vendorId', { vendorId: id })
      .andWhere('po.deleted_at IS NULL')
      .andWhere('po.status != :cancelled', { cancelled: PurchaseOrderStatus.CANCELLED })
      .getRawOne();

    return {
      ...vendor,
      paymentSummary: {
        totalAmount: Number(summary?.totalAmount ?? 0),
        paidAmount: Number(summary?.paidAmount ?? 0),
        outstandingAmount: Number(summary?.outstandingAmount ?? 0),
      },
    };
  }

  async update(id: string, dto: UpdateVendorDto) {
    const vendor = await this.repo.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (dto.name || dto.email) {
      await this.ensureUnique(dto.name ?? vendor.name, dto.email ?? vendor.email, id);
    }

    Object.assign(vendor, dto);
    return this.repo.save(vendor);
  }

  async remove(id: string) {
    const vendor = await this.repo.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    await this.repo.softRemove(vendor);
    return { message: 'Vendor removed' };
  }

  private async ensureUnique(name: string, email: string, ignoreId?: string) {
    const clash = await this.repo.findOne({
      where: [{ name }, { email }],
      withDeleted: true,
    });

    if (clash && clash.id !== ignoreId) {
      const conflicts = [] as string[];
      if (clash.name === name) conflicts.push('name');
      if (clash.email === email) conflicts.push('email');
      throw new ConflictException(`Vendor ${conflicts.join(' & ')} already exists`);
    }

    if (!name || !email) {
      throw new BadRequestException('Vendor name and email are required');
    }
  }
}
