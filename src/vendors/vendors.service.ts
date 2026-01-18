import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class VendorsService {
  constructor(@InjectRepository(Vendor) private readonly repo: Repository<Vendor>) {}

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
    return vendor;
  }

  async update(id: string, dto: UpdateVendorDto) {
    const vendor = await this.findOne(id);

    if (dto.name || dto.email) {
      await this.ensureUnique(dto.name ?? vendor.name, dto.email ?? vendor.email, id);
    }

    Object.assign(vendor, dto);
    return this.repo.save(vendor);
  }

  async remove(id: string) {
    const vendor = await this.findOne(id);
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
